#!/usr/bin/env node
/* Adminpanel voor Odysstream, Thuisplay en SpitsTV: één programma, maar elk merk heeft zijn
   eigen portaal op zijn eigen domein (odysstream.nl/admin/, thuisplay.nl/admin/, spitstv.nl/admin/),
   met een eigen wachtwoord, en ziet en wijzigt alleen zijn eigen instellingen.
   Klein Node-programma zonder externe pakketten (Node 18 of nieuwer).

   Wat het doet:
   - /admin/                 het beheerscherm van het merk van dit domein
   - /api/...                inloggen en instellingen lezen/schrijven (alleen ingelogd, alleen eigen merk)
   - /instellingen.json      de openbare instellingen van dit merk, gelezen door de site zelf
   Welk merk: de header X-Merk die Nginx per domein meestuurt (of lokaal ?merk=... / de submap).

   Instellingen staan per merk als JSON-bestand in de map data/ (data/odysstream.json enz.).

   Eerste keer:   node server.js wachtwoord odysstream    (per merk een eigen wachtwoord)
                  node server.js wachtwoord thuisplay
                  node server.js wachtwoord spitstv
   Draaien:       node server.js                          (poort uit config.json, standaard 3000)
   Lokaal testen: node server.js --dev                    (serveert ook de drie sites, zonder Nginx) */
'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),readline=require('readline');

const HIER=__dirname;
const CONFIG_PAD=path.join(HIER,'config.json');
const MERKEN=['odysstream','thuisplay','spitstv'];
const MERK_NAAM={odysstream:'Odysstream',thuisplay:'Thuisplay',spitstv:'SpitsTV'};
const MERK_KLEUR={odysstream:'#1FD8FF',thuisplay:'#E8B54A',spitstv:'#A6FF3F'};

function leesConfig(){
  let c={};
  try{c=JSON.parse(fs.readFileSync(CONFIG_PAD,'utf8'))}catch(e){}
  c.poort=c.poort||3000;
  c.dataMap=c.dataMap||path.join(HIER,'data');
  if(!c.geheim){c.geheim=crypto.randomBytes(32).toString('hex');schrijfConfig(c)}
  return c;
}
function schrijfConfig(c){fs.writeFileSync(CONFIG_PAD,JSON.stringify(c,null,2)+'\n',{mode:0o600})}

/* ---------- wachtwoord ---------- */
function hashWachtwoord(w){
  const zout=crypto.randomBytes(16);
  const h=crypto.scryptSync(w,zout,64);
  return 'scrypt$'+zout.toString('hex')+'$'+h.toString('hex');
}
function controleerWachtwoord(w,hash){
  if(!hash||typeof w!=='string')return false;
  const [alg,zout,h]=hash.split('$');
  if(alg!=='scrypt')return false;
  const kandidaat=crypto.scryptSync(w,Buffer.from(zout,'hex'),64);
  const echt=Buffer.from(h,'hex');
  return kandidaat.length===echt.length&&crypto.timingSafeEqual(kandidaat,echt);
}
if(process.argv[2]==='wachtwoord'){
  const merk=(process.argv[3]||'').toLowerCase();
  if(!MERKEN.includes(merk)){console.error('Geef het merk op:  node server.js wachtwoord odysstream|thuisplay|spitstv');process.exit(1)}
  const rl=readline.createInterface({input:process.stdin,output:process.stdout});
  process.stdout.write('Nieuw beheerwachtwoord voor '+MERK_NAAM[merk]+' (minimaal 10 tekens): ');
  rl.question('',(w)=>{
    rl.close();
    if(!w||w.length<10){console.error('Te kort. Niets gewijzigd.');process.exit(1)}
    const c=leesConfig();c.wachtwoorden=c.wachtwoorden||{};c.wachtwoorden[merk]=hashWachtwoord(w);schrijfConfig(c);
    console.log('Wachtwoord voor '+MERK_NAAM[merk]+' opgeslagen in config.json.');process.exit(0);
  });
  return;
}

const CONFIG=leesConfig();
const DEV=process.argv.includes('--dev');
CONFIG.wachtwoorden=CONFIG.wachtwoorden||{};
const zonder=MERKEN.filter(m=>!CONFIG.wachtwoorden[m]);
if(zonder.length===MERKEN.length){console.error('Nog geen wachtwoord ingesteld. Draai eerst per merk:  node server.js wachtwoord odysstream');process.exit(1)}
if(zonder.length)console.warn('Let op: nog geen wachtwoord voor '+zonder.map(m=>MERK_NAAM[m]).join(', ')+'; die portalen zijn tot die tijd gesloten.');
fs.mkdirSync(CONFIG.dataMap,{recursive:true});

/* ---------- sessies (getekende cookie per merk, 7 dagen) ---------- */
function teken(s){return crypto.createHmac('sha256',CONFIG.geheim).update(s).digest('base64url')}
function maakSessie(merk){const p=merk+'.'+String(Date.now()+7*24*3600*1000);return p+'.'+teken(p)}
function sessieGeldig(t,merk){
  if(!t)return false;const d=t.split('.');if(d.length!==3)return false;
  const p=d[0]+'.'+d[1],s=d[2];
  const verwacht=teken(p);
  if(s.length!==verwacht.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(verwacht)))return false;
  return d[0]===merk&&Number(d[1])>Date.now();
}
function cookies(req){const o={};(req.headers.cookie||'').split(';').forEach(p=>{const i=p.indexOf('=');if(i>0)o[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())});return o}
function ingelogd(req,merk){return sessieGeldig(cookies(req).sessie,merk)}

/* ---------- inlogpogingen beperken: 6 per kwartier per adres ---------- */
const pogingen=new Map();
function tePogingen(ip){
  const nu=Date.now();const l=(pogingen.get(ip)||[]).filter(t=>nu-t<15*60*1000);pogingen.set(ip,l);return l.length;
}
function noteerPoging(ip){const l=pogingen.get(ip)||[];l.push(Date.now());pogingen.set(ip,l)}

/* ---------- instellingen ---------- */
const LEEG={whatsapp:'',tenaamstelling:'',iban:'',pixelFacebook:'',pixelTiktok:'',films:[],series:[]};
function pad(merk){return path.join(CONFIG.dataMap,merk+'.json')}
/* De films en series waarmee de site begint (standaard.json, overgenomen uit de site zelf).
   Zolang de lijsten in het portaal nog nooit zijn opgeslagen, zie je die in het portaal,
   zodat je kunt verwijderen en toevoegen in plaats van vanaf nul beginnen. */
function standaard(){try{return JSON.parse(fs.readFileSync(path.join(HIER,'standaard.json'),'utf8'))}catch(e){return {films:[],series:[]}}}
function leesInstellingen(merk){
  let d={};
  try{d=JSON.parse(fs.readFileSync(pad(merk),'utf8'))}catch(e){}
  const uit=Object.assign({},LEEG,d);
  if(!d.filmsAangepast){const st=standaard();uit.films=st.films||[];uit.series=st.series||[]}
  return uit;
}
function schrijfInstellingen(merk,obj){
  const tmp=pad(merk)+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n');
  fs.renameSync(tmp,pad(merk));
}
function ibanOk(iban){
  const s=iban.replace(/\s+/g,'').toUpperCase();
  if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(s))return false;
  const om=s.slice(4)+s.slice(0,4);
  let rest=0;
  for(const ch of om){const v=/[A-Z]/.test(ch)?String(ch.charCodeAt(0)-55):ch;for(const d of v)rest=(rest*10+Number(d))%97}
  return rest===1;
}
function tekst(v,max){return typeof v==='string'?v.trim().slice(0,max):''}
function valideer(inp){
  const fouten=[];
  const uit=Object.assign({},LEEG);
  uit.whatsapp=tekst(inp.whatsapp,20).replace(/[^\d]/g,'');
  if(uit.whatsapp&&(uit.whatsapp.length<8||uit.whatsapp.length>15))fouten.push('Telefoonnummer: gebruik het internationale nummer zonder + of spaties, bijvoorbeeld 31612345678.');
  uit.tenaamstelling=tekst(inp.tenaamstelling,60);
  uit.iban=tekst(inp.iban,40).replace(/\s+/g,'').toUpperCase();
  if(uit.iban&&!ibanOk(uit.iban))fouten.push('IBAN: dit nummer klopt niet (controlegetal). Kijk hem nog even na.');
  uit.pixelFacebook=tekst(inp.pixelFacebook,30);
  if(uit.pixelFacebook&&!/^\d{5,25}$/.test(uit.pixelFacebook))fouten.push('Facebook-pixel: alleen cijfers, bijvoorbeeld 123456789012345.');
  uit.pixelTiktok=tekst(inp.pixelTiktok,40);
  if(uit.pixelTiktok&&!/^[A-Za-z0-9]{8,40}$/.test(uit.pixelTiktok))fouten.push('TikTok-pixel: alleen letters en cijfers, bijvoorbeeld CABC123DEF456.');
  ['films','series'].forEach(k=>{
    const lijst=Array.isArray(inp[k])?inp[k].slice(0,40):[];
    uit[k]=lijst.map((f,i)=>{
      f=f||{};
      const t={titel:tekst(f.titel,80),poster:tekst(f.poster,500),label:tekst(f.label,24),sub:tekst(f.sub,60)};
      if(!t.titel)fouten.push((k==='films'?'Film':'Serie')+' '+(i+1)+': titel ontbreekt.');
      if(!/^https:\/\/\S+$/.test(t.poster))fouten.push((k==='films'?'Film':'Serie')+' '+(i+1)+' ('+(t.titel||'zonder titel')+'): posterlink moet met https:// beginnen.');
      return t;
    }).filter(t=>t.titel||t.poster);
  });
  return {uit,fouten};
}

/* ---------- http ---------- */
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2'};
function stuurJson(res,code,obj,extra){res.writeHead(code,Object.assign({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},extra||{}));res.end(JSON.stringify(obj))}
function stuurBestand(res,bestand,extraHeaders){
  fs.readFile(bestand,(err,data)=>{
    if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Niet gevonden')}
    res.writeHead(200,Object.assign({'Content-Type':MIME[path.extname(bestand)]||'application/octet-stream'},extraHeaders||{}));res.end(data);
  });
}
function leesBody(req){return new Promise((ok,nee)=>{let d='';req.on('data',c=>{d+=c;if(d.length>400000){nee(new Error('te groot'));req.destroy()}});req.on('end',()=>{try{ok(d?JSON.parse(d):{})}catch(e){nee(e)}});req.on('error',nee)})}
function merkUit(req,url){
  /* op de VPS: Nginx stuurt per domein X-Merk mee. Lokaal: ?merk=... of de submap (/thuisplay/admin/). */
  const h=(req.headers['x-merk']||'').toString().toLowerCase();
  const q=DEV?(url.searchParams.get('merk')||'').toLowerCase():'';
  const m=h||q||'odysstream';
  return MERKEN.includes(m)?m:'odysstream';
}
function zelfdeOorsprong(req){
  /* schrijfacties alleen vanaf het panel zelf (bescherming tegen formulieren op andere sites) */
  const o=req.headers.origin;if(!o)return true;
  const host=req.headers['x-forwarded-host']||req.headers.host||'';
  try{return new URL(o).host===host}catch(e){return false}
}
function ip(req){return (req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress||''}
function veilig(res){res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','same-origin')}

const server=http.createServer(async (req,res)=>{
  veilig(res);
  const url=new URL(req.url,'http://x');
  const p=url.pathname;
  try{
    /* openbaar: de instellingen van één merk voor de site zelf */
    if(req.method==='GET'&&(p==='/instellingen.json'||/^\/(thuisplay|spitstv)\/instellingen\.json$/.test(p))){
      const m=p==='/instellingen.json'?merkUit(req,url):p.split('/')[1];
      return stuurJson(res,200,leesInstellingen(m),{'Cache-Control':'no-cache','Access-Control-Allow-Origin':'*'});
    }
    /* lokaal testen: /thuisplay/admin/ en /thuisplay/api/... werken als het portaal van dat merk */
    let merk=merkUit(req,url),pad=p;
    const sub=DEV&&p.match(/^\/(thuisplay|spitstv)(\/(?:admin|api)\/.*|\/admin)$/);
    if(sub){merk=sub[1];pad=sub[2]}
    /* het portaal van dit merk */
    if(pad==='/admin'){res.writeHead(302,{Location:p+'/'});return res.end()}
    if(pad==='/admin/'||pad==='/admin/index.html')return stuurBestand(res,path.join(HIER,'public','admin.html'),{'Cache-Control':'no-store'});
    if(pad.startsWith('/admin/')){const b=path.normalize(pad.slice(7));if(b.includes('..'))return stuurJson(res,404,{});return stuurBestand(res,path.join(HIER,'public',b))}
    /* api, altijd alleen voor het merk van dit domein */
    if(pad==='/api/sessie'&&req.method==='GET')return stuurJson(res,200,{ingelogd:ingelogd(req,merk),merk:merk,naam:MERK_NAAM[merk],kleur:MERK_KLEUR[merk],open:!!CONFIG.wachtwoorden[merk]});
    if(pad==='/api/login'&&req.method==='POST'){
      if(!zelfdeOorsprong(req))return stuurJson(res,403,{fout:'Ongeldige herkomst.'});
      if(!CONFIG.wachtwoorden[merk])return stuurJson(res,403,{fout:'Dit portaal heeft nog geen wachtwoord. Stel het in op de server:  node server.js wachtwoord '+merk});
      const adres=ip(req);
      if(tePogingen(adres)>=6)return stuurJson(res,429,{fout:'Te veel pogingen. Probeer het over een kwartier opnieuw.'});
      const body=await leesBody(req);
      if(!controleerWachtwoord(body.wachtwoord,CONFIG.wachtwoorden[merk])){noteerPoging(adres);return stuurJson(res,401,{fout:'Wachtwoord klopt niet.'})}
      const veiligeCookie=(req.headers['x-forwarded-proto']==='https')?'; Secure':'';
      return stuurJson(res,200,{ok:true},{'Set-Cookie':'sessie='+maakSessie(merk)+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+(7*24*3600)+veiligeCookie});
    }
    if(pad==='/api/logout'&&req.method==='POST')return stuurJson(res,200,{ok:true},{'Set-Cookie':'sessie=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'});
    if(pad==='/api/instellingen'){
      if(!ingelogd(req,merk))return stuurJson(res,401,{fout:'Niet ingelogd.'});
      if(req.method==='GET')return stuurJson(res,200,leesInstellingen(merk));
      if(req.method==='PUT'){
        if(!zelfdeOorsprong(req))return stuurJson(res,403,{fout:'Ongeldige herkomst.'});
        const body=await leesBody(req);
        const {uit,fouten}=valideer(body);
        if(fouten.length)return stuurJson(res,400,{fout:fouten.join('\n'),fouten});
        uit.filmsAangepast=true; /* vanaf nu gelden de lijsten uit het portaal, ook als ze leeg zijn */
        schrijfInstellingen(merk,uit);
        return stuurJson(res,200,{ok:true,instellingen:uit});
      }
    }
    /* lokaal testen zonder Nginx: de drie sites zelf serveren vanuit de map boven admin/ */
    if(DEV&&req.method==='GET'){
      const wortel=path.resolve(HIER,'..');
      let rel=decodeURIComponent(p);if(rel.endsWith('/'))rel+='index.html';
      const bestand=path.normalize(path.join(wortel,rel));
      if(bestand.startsWith(wortel)&&!bestand.startsWith(path.join(wortel,'admin')))return stuurBestand(res,bestand,{'Cache-Control':'no-store'});
    }
    stuurJson(res,404,{fout:'Niet gevonden.'});
  }catch(e){
    stuurJson(res,500,{fout:'Er ging iets mis: '+(e&&e.message||e)});
  }
});
server.listen(CONFIG.poort,'127.0.0.1',()=>console.log('Adminpanel draait op http://127.0.0.1:'+CONFIG.poort+'/admin/'+(DEV?'  (dev: sites op http://127.0.0.1:'+CONFIG.poort+'/ )':'')));
