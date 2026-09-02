(function(){
  /* rijen tikken elke paar seconden één item door, zelfde richting; handmatig scrollen pauzeert */
  document.querySelectorAll('.rail.tick,.toprail.tick').forEach(function(r){
    var vis=false,pauseUntil=0,timer=null;
    /* pijlknoppen (ook voor muisgebruikers zonder horizontaal scrollen) */
    var wrap=document.createElement('div');wrap.className='railwrap'+(r.classList.contains('toprail')?' railwrap-top':'');r.parentNode.insertBefore(wrap,r);wrap.appendChild(r);
    function mk(dir){var b=document.createElement('button');b.type='button';b.className='rail-btn '+dir;b.setAttribute('aria-label',dir==='prev'?'Vorige':'Volgende');b.innerHTML=dir==='prev'?'<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>':'<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';b.addEventListener('click',function(){pause(10000);var k=r.children,w=k.length>1?k[1].offsetLeft-k[0].offsetLeft:240;var page=Math.max(w,Math.floor(r.clientWidth/w)*w);r.scrollBy({left:dir==='prev'?-page:page,behavior:'smooth'})});wrap.appendChild(b);return b}
    var bp=mk('prev'),bn=mk('next');
    function sync(){bp.disabled=r.scrollLeft<=2;bn.disabled=r.scrollLeft>=r.scrollWidth-r.clientWidth-2}
    r.addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);setTimeout(sync,300);
    function step(){
      if(!vis||Date.now()<pauseUntil||document.hidden)return;
      var kids=r.children;if(kids.length<2)return;
      var w=kids[1].offsetLeft-kids[0].offsetLeft;
      var max=r.scrollWidth-r.clientWidth;
      if(r.scrollLeft>=max-4){r.scrollTo({left:0,behavior:'smooth'})}else{r.scrollBy({left:w,behavior:'smooth'})}
    }
    var pause=function(ms){pauseUntil=Date.now()+(ms||7000)};
    ['touchstart','pointerdown','wheel'].forEach(function(ev){r.addEventListener(ev,function(){pause(8000)},{passive:true})});
    r.addEventListener('mouseenter',function(){pause(60000)});r.addEventListener('mouseleave',function(){pauseUntil=0});
    new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!timer){timer=setInterval(step,3500)}else if(!vis&&timer){clearInterval(timer);timer=null}},{threshold:.3}).observe(r);
  });
  // sticky nav
  var nav=document.getElementById('nav');
  var onS=function(){nav.classList.toggle('scrolled',window.scrollY>40)};onS();addEventListener('scroll',onS,{passive:true});
  // reveal on scroll
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  // hero already in view
  document.querySelectorAll('.hero .rv').forEach(function(el,i){setTimeout(function(){el.classList.add('in')},120+i*90)});
  document.querySelectorAll('.rv-l,.stagger').forEach(function(el){io.observe(el)});
  /* rekentool */
  var calc=document.getElementById('bespaar');
  if(calc){
    var JAARPRIJS=124.99,now=document.getElementById('c-now'),save=document.getElementById('c-save'),big=save.parentElement;
    var fmt=function(n){return n.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})};
    var fmt0=function(n){return Math.round(n).toLocaleString('nl-NL')};
    var cur={now:0,save:0};
    function upd(){
      var t=0;calc.querySelectorAll('.ck input:checked').forEach(function(i){t+=parseFloat(i.value)});
      /* de vinkjes zijn maandprijzen; we rekenen alles om naar een jaarbedrag, zodat de vergelijking met €124,99 per jaar klopt */
      var tj=t*12,sy=Math.max(0,tj-JAARPRIJS),from={now:cur.now,save:cur.save},s0=performance.now();
      big.classList.add('pop');setTimeout(function(){big.classList.remove('pop')},250);
      (function f(n){var p=Math.min(1,(n-s0)/600),e=1-Math.pow(1-p,3);var a=from.now+(tj-from.now)*e,b=from.save+(sy-from.save)*e;now.textContent=fmt(a);save.textContent=fmt0(b);if(p<1)requestAnimationFrame(f);else{cur.now=tj;cur.save=sy}})(s0);
    }
    calc.querySelectorAll('.ck input').forEach(function(i){i.addEventListener('change',upd)});
    upd();
  }
  // count up
  var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var el=e.target,t=+el.dataset.count,s=performance.now();(function f(n){var p=Math.min(1,(n-s)/1400),v=Math.round(t*(1-Math.pow(1-p,3)));el.textContent=v.toLocaleString('nl-NL');if(p<1)requestAnimationFrame(f)})(s)})},{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){co.observe(el)});
  // parallax backdrops + hero wall tilt with mouse
  var px=document.querySelectorAll('[data-parallax]'),wall=document.getElementById('wall');
  var fine=matchMedia('(pointer:fine)').matches,mx=0,my=0;
  function frame(){
    var y=window.scrollY;
    px.forEach(function(el){var r=el.parentElement.getBoundingClientRect();var o=(r.top+r.height/2-innerHeight/2)/innerHeight;el.style.transform='translateY('+(o*-60)+'px)'});
    if(wall&&fine){wall.style.transform='perspective(1400px) rotateY('+(-24+mx*4)+'deg) rotateX('+(8+my*3)+'deg) rotateZ(4deg) scale(1.12) translateY('+(y*0.12)+'px)'}
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame);

  /* ===== Gratis-proef flow: formulier -> CRM -> WhatsApp ===== */
  var C=window.SPITSTV_CONFIG||{},modal=document.getElementById('proef'),form=document.getElementById('proef-form'),msg=document.getElementById('proef-msg'),waBtn=document.getElementById('proef-wa'),lastFocus=null;
  var modalTitle=document.getElementById('proef-t'),
      modalEyebrow=modal.querySelector('.eyebrow'),modalIntro=modal.querySelector('.box>p'),koopModus=false;

  /* Referentienummer. Begint bij een getal van vijf cijfers en telt één op per minuut
     sinds de start van de verkoop, dus het loopt altijd op en twee bezoekers krijgen
     vrijwel nooit hetzelfde nummer. Een nummering die per bestelling precies één
     ophoogt kan niet zonder server; zie KOPPELING.md. */
  var REF_START=C.referentieStart||C.factuurStart||42017,
      VERKOOP_START=Date.parse(C.verkoopStart||'2026-08-29T00:00:00Z');
  function referentienummer(){
    return String(REF_START+Math.max(0,Math.floor((Date.now()-VERKOOP_START)/60000)));
  }
  var PRIJZEN={'3 maanden':'64,99','6 maanden':'84,99','12 maanden':'124,99'};

  function openModal(plan,koop){
    koopModus=!!koop;
    modal.classList.remove('sent');form.reset();
    form.plan.value=plan||'Gratis proef 24 uur';
    if(koopModus){
      modalEyebrow.textContent='Vooraf betaald, verlengt nooit vanzelf';
      modalTitle.textContent='Bestellen: '+(plan||'').replace('Abonnement ','');
      modalIntro.textContent='Vul je gegevens in. Op de volgende stap zie je naar welke rekening je overmaakt.';
      document.getElementById('proef-submit').textContent='Naar de betaalgegevens';
    }else{
      modalEyebrow.textContent='24 uur gratis, stopt vanzelf';
      modalTitle.textContent='Probeer nu 24 uur gratis';
      modalIntro.textContent='Vul je gegevens in, dan sturen we je binnen 5 minuten je activatiecode.';
      document.getElementById('proef-submit').textContent='Probeer nu 24 uur gratis';
    }
    msg.textContent='';lastFocus=document.activeElement;modal.classList.add('open');
    document.body.style.overflow='hidden';setTimeout(function(){form.naam.focus()},50)
  }
  function closeModal(){modal.classList.remove('open');document.body.style.overflow='';if(lastFocus)lastFocus.focus()}
  document.querySelectorAll('[data-proef]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();openModal(a.dataset.plan?'Abonnement '+a.dataset.plan:'')})});
  document.querySelectorAll('[data-koop]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();openModal('Abonnement '+a.dataset.plan,true)})});
  modal.querySelectorAll('[data-close]').forEach(function(el){el.addEventListener('click',closeModal)});
  /* links naar voorwaarden en privacy in het akkoordlabel mogen het vakje niet omzetten */
  modal.querySelectorAll('.chk a').forEach(function(a){a.addEventListener('click',function(e){e.stopPropagation()})});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});
  function waUrl(text){return 'https://wa.me/'+(C.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(text)}
  document.querySelectorAll('[data-wa]').forEach(function(a){a.href=waUrl('Hoi SpitsTV, ik heb een vraag.');a.target='_blank';a.rel='noopener'});
  function lead(d){
    var payload={naam:d.naam,email:d.email,telefoon:d.telefoon,plan:d.plan,
      merk:C.merk||'SpitsTV',bron:d.koop?'website bestelling':'website gratis proef',pagina:location.href,tijd:new Date().toISOString()};
    if(d.koop){payload.referentienummer=d.ref;payload.bedrag=d.bedrag}
    var jobs=[];
    if(C.crm==='hubspot'&&C.hubspotPortalId&&C.hubspotFormId){
      var hs={fields:[{name:'firstname',value:d.naam},{name:'email',value:d.email},{name:'phone',value:d.telefoon},{name:'message',value:'Merk: '+(C.merk||'SpitsTV')+'. Bron: website. Plan: '+d.plan+(d.koop?('\nBESTELLING\nReferentienummer: '+d.ref+'\nBedrag: EUR '+d.bedrag+'\nWacht op overboeking.'):'')}],context:{pageUri:location.href,pageName:document.title},legalConsentOptions:{consent:{consentToProcess:true,text:'Ik ga akkoord met de algemene voorwaarden en het privacybeleid van SpitsTV (spitstv.nl/voorwaarden, spitstv.nl/privacy).'}}};
      jobs.push(fetch('https://api'+(C.hubspotRegion?'-'+C.hubspotRegion:'')+'.hsforms.com/submissions/v3/integration/submit/'+C.hubspotPortalId+'/'+C.hubspotFormId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(hs),keepalive:true}));
    }
    if(C.leadWebhook){jobs.push(fetch(C.leadWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}))}
    if(!jobs.length){try{var l=JSON.parse(localStorage.getItem('spitstv_leads')||'[]');l.push(payload);localStorage.setItem('spitstv_leads',JSON.stringify(l))}catch(e){}console.log('[SpitsTV] lead (CRM nog niet gekoppeld):',payload)}
    return Promise.allSettled(jobs);
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();msg.textContent='';
    var periode=(form.plan.value||'').replace('Abonnement ','');
    var d={naam:form.naam.value.trim(),email:form.email.value.trim(),telefoon:form.telefoon.value.trim(),plan:form.plan.value,koop:koopModus};
    if(koopModus){d.ref=referentienummer();d.periode=periode;d.bedrag=PRIJZEN[periode]||'124,99'}
    var bad=[];form.querySelectorAll('input').forEach(function(i){i.classList.remove('err')});
    if(d.naam.length<2){bad.push('naam')}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)){bad.push('email')}
    if(d.telefoon.replace(/\D/g,'').length<9){bad.push('telefoon')}
    if(!form.akkoord.checked){bad.push('akkoord')}
    if(bad.length){bad.forEach(function(n){form[n].classList.add('err')});
      msg.textContent=bad[0]==='akkoord'?'Vink de voorwaarden aan om verder te gaan.':
        'Controleer je '+({naam:'naam',email:'e-mailadres',telefoon:'telefoonnummer'})[bad[0]]+'.';
      form[bad[0]].focus();return}
    var btn=document.getElementById('proef-submit');btn.disabled=true;btn.textContent='Even geduld...';

    /* Bestelling: geen WhatsApp-venster, maar door naar de betaalpagina met het
       referentienummer. Daar staat naar welke rekening het bedrag toe moet. */
    if(koopModus){
      lead(d).then(function(){
        location.href='betalen.html?plan='+encodeURIComponent(d.periode)+'&ref='+encodeURIComponent(d.ref)+'&naam='+encodeURIComponent(d.naam);
      });
      return;
    }
    var text='Hoi SpitsTV! Ik wil graag de 24 uur gratis proef starten.\nNaam: '+d.naam+'\nE-mail: '+d.email;
    var url=waUrl(text);waBtn.href=url;
    var win=null;try{win=window.open('',
      '_blank')}catch(x){}
    lead(d).then(function(){
      modal.classList.add('sent');btn.disabled=false;btn.textContent='Probeer nu 24 uur gratis';
      if(win){win.location=url}else{location.href=url}});
  });
  if(fine)addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
})();

/* ===== Live sport: TheSportsDB ===== */
(function(){
  var sportSection=document.getElementById('sport');
  if(!sportSection)return;
  var C=window.SPITSTV_CONFIG||{};
  var KEY=C.sportsApiKey||'123';
  /* NL + BE + de vier grote Europese competities + Europa- en Champions League + UFC + F1.
     Zonder de buitenlandse competities zag je nooit Barcelona, Liverpool of Inter. */
  var LEAGUES=[4337,4338,4328,4335,4332,4331,4480,4481,4443,4370];
  /* TheSportsDB geeft de competitienaam in het Engels terug. De site is Nederlands. */
  var COMP_NL={
    'Dutch Eredivisie':'Eredivisie',
    'Dutch Eerste Divisie':'Keuken Kampioen Divisie',
    'Belgian Pro League':'Jupiler Pro League',
    'Belgian First Division A':'Jupiler Pro League',
    'English Premier League':'Premier League',
    'Spanish La Liga':'La Liga',
    'Italian Serie A':'Serie A',
    'German Bundesliga':'Bundesliga',
    'French Ligue 1':'Ligue 1',
    'UEFA Champions League':'Champions League',
    'UEFA Europa League':'Europa League',
    'UEFA Europa Conference League':'Conference League',
    'Formula 1':'Formule 1',
    'UFC':'UFC'
  };
  function compNaam(ev){
    var n=ev.strLeague||'';
    if(COMP_NL[n])return COMP_NL[n];
    /* onbekende competitie: haal er in elk geval het landvoorvoegsel af */
    return n.replace(/^(Dutch|English|Spanish|Italian|German|French|Belgian|Portuguese|Scottish)\s+/,'');
  }
  var CACHE_KEY='spitstv_sport_cache_v4',CACHE_MS=20*60*1000; /* 20 minuten cache */
  var DAGEN=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
  var DAGEN_KORT=['zo','ma','di','wo','do','vr','za'];
  var MAANDEN=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];

  function pad(n){return (n<10?'0':'')+n}
  /* TheSportsDB geeft dateEvent/strTime doorgaans in UTC; we tonen dit in de tijdzone van de bezoeker (NL/BE = Europe/Amsterdam) */
  function toDate(ev){return new Date(ev.dateEvent+'T'+(ev.strTime||'19:00:00')+'Z')}
  function fmtWhen(ev){
    var d=toDate(ev);
    if(isNaN(d.getTime()))return ev.dateEvent||'';
    var dag=DAGEN[d.getDay()];
    return dag.charAt(0).toUpperCase()+dag.slice(1)+' '+d.getDate()+' '+MAANDEN[d.getMonth()]+', '+pad(d.getHours())+':'+pad(d.getMinutes())+' uur';
  }
  /* Het badge moet per kaart iets anders zeggen, anders is het ruis.
     Daarom de echte dag in plaats van zes keer "Dit weekend". */
  function badgeInfo(ev){
    var d=toDate(ev);
    if(isNaN(d.getTime()))return{cls:'',txt:'Binnenkort'};
    var now=new Date(),start=d.getTime();
    if(now.getTime()>=start&&now.getTime()<=start+3*60*60*1000)return{cls:' live',txt:'Nu live'};
    var dayOf=function(x){return new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime()};
    var days=Math.round((dayOf(d)-dayOf(now))/86400000);
    if(days<0)return{cls:'',txt:'Binnenkort'};
    if(days===0)return{cls:'',txt:d.getHours()>=17?'Vanavond':'Vandaag'};
    if(days===1)return{cls:'',txt:'Morgen'};
    if(days<7){var n=DAGEN[d.getDay()];return{cls:'',txt:n.charAt(0).toUpperCase()+n.slice(1)}}
    return{cls:'',txt:DAGEN_KORT[d.getDay()]+' '+d.getDate()+' '+MAANDEN[d.getMonth()]};
  }
  function teamsHtml(ev){
    if(ev.strHomeTeam&&ev.strAwayTeam)return esc(ev.strHomeTeam)+'<em>tegen</em>'+esc(ev.strAwayTeam);
    return esc(ev.strEvent||'')
  }
  function teamsPlain(ev){
    if(ev.strHomeTeam&&ev.strAwayTeam)return ev.strHomeTeam+' tegen '+ev.strAwayTeam;
    return ev.strEvent||''
  }
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function crestsHtml(ev){
    if(ev.strHomeTeamBadge&&ev.strAwayTeamBadge){
      return '<span class="crests"><img src="'+esc(ev.strHomeTeamBadge)+'" alt="" loading="lazy" onerror="this.parentElement.remove()"><em>vs</em><img src="'+esc(ev.strAwayTeamBadge)+'" alt="" loading="lazy" onerror="this.parentElement.remove()"></span>';
    }
    /* UFC, Formule 1 en andere events zonder twee clubs: het competitielogo als beeldanker */
    if(ev.strLeagueBadge){
      return '<span class="crests one"><img src="'+esc(ev.strLeagueBadge)+'" alt="" loading="lazy" onerror="this.parentElement.remove()"></span>';
    }
    return '';
  }
  /* Geen eventfoto's meer als achtergrond. De afbeeldingen van TheSportsDB zijn
     promotieposters met tekst en logo's er al in gedrukt; die botsen met onze eigen
     kop en snijden lelijk af. Elke kaart krijgt dezelfde rustige merkachtergrond
     (zie style.css) en de club- of competitielogo's leveren het beeld. */
  /* Kijkerstrekkers. De site moet de wedstrijden tonen waar mensen voor inschakelen,
     niet de eerstvolgende in de lijst (dat was op een zaterdag Heracles tegen NAC).
     Gewicht 3: de clubs die iedereen kent en die kijkcijfers trekken. 2: subtop en
     grote buitenlandse namen. Alles wat hier niet staat telt 1 mee. Matching gaat op
     een stukje van de naam, in kleine letters en zonder accenten, want TheSportsDB
     schrijft "PSV Eindhoven", "Inter Milan", "Atletico Madrid". */
  var TOP={
    'ajax':3,'psv':3,'feyenoord':3,
    'real madrid':3,'barcelona':3,'manchester city':3,'man city':3,'liverpool':3,
    'manchester united':3,'man united':3,'arsenal':3,'chelsea':3,'bayern':3,
    'paris saint':3,'paris sg':3,'inter':3,'juventus':3,'milan':3,
    'club brugge':3,'anderlecht':3,
    'az alkmaar':2,'twente':2,'utrecht':2,
    'atletico':2,'dortmund':2,'leverkusen':2,'tottenham':2,'newcastle':2,'aston villa':2,
    'napoli':2,'roma':2,'atalanta':2,'sevilla':2,'marseille':2,
    'genk':2,'antwerp':2,'standard':2,'union saint':2,'union sg':2
  };
  function norm(s){
    s=String(s||'').toLowerCase();
    try{s=s.normalize('NFD').replace(/[̀-ͯ]/g,'')}catch(e){}
    return s;
  }
  function gewicht(naam){
    var n=norm(naam),best=1,k;
    for(k in TOP){if(n.indexOf(k)>=0&&TOP[k]>best)best=TOP[k]}
    return best;
  }
  /* Thuispubliek: de Eredivisie telt even zwaar als de Champions League, de Belgische competitie iets minder. */
  var COMP_BONUS={'UEFA Champions League':2,'UEFA Europa League':1,'Dutch Eredivisie':2,'Belgian Pro League':1,'Belgian First Division A':1};
  /* Hoe hoger, hoe eerder op de site. Bij gelijke score wint de eerstvolgende. */
  function score(ev){
    var s=0,lg=ev.strLeague||'',n=norm(ev.strEvent),d=toDate(ev);
    var dagen=isNaN(d.getTime())?99:(d.getTime()-Date.now())/86400000;
    if(ev.strHomeTeam&&ev.strAwayTeam){
      var h=gewicht(ev.strHomeTeam),a=gewicht(ev.strAwayTeam);
      s=h+a+(COMP_BONUS[lg]||0);
      if(h>=3&&a>=3)s+=2;      /* topper: twee grote namen tegenover elkaar */
      else if(h>=2&&a>=2)s+=1; /* subtop onderling: ook leuk, maar geen Clasico */
    }else if(lg==='UFC'){
      s=/ufc\s*\d{3}/.test(n)?6:3;   /* genummerd event (UFC 3xx) trekt meer dan een Fight Night */
      if(s>3&&dagen<=7)s+=2;       /* het grote event van dit weekend hoort erbij */
    }else if(lg==='Formula 1'){
      if(/practice|qualifying|sprint|training|kwalificatie/.test(n))s=1;
      else{s=/dutch|netherlands|zandvoort/.test(n)?7:5;if(dagen<=7)s+=2}   /* raceweekend: Verstappen trekt kijkers */
    }else{
      s=2;
    }
    /* Wat ver weg is, mag pas later naar voren: de site gaat over deze en volgende week. */
    if(dagen>14)s-=2;
    if(dagen>28)s-=4;
    return s;
  }
  function isTopper(ev){
    if(!(ev.strHomeTeam&&ev.strAwayTeam))return false;
    return gewicht(ev.strHomeTeam)>=3&&gewicht(ev.strAwayTeam)>=3;
  }
  function fetchLeague(id){
    return fetch('https://www.thesportsdb.com/api/v1/json/'+encodeURIComponent(KEY)+'/eventsnextleague.php?id='+id)
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){return (j&&j.events)||[]})
      .catch(function(){return[]});
  }
  function render(events){
    var bento=sportSection.querySelector('.bento'),agenda=sportSection.querySelector('.agenda');
    if(!bento||!events.length)return; /* geen (bruikbare) data: de statische kaarten in index.html blijven gewoon staan */
    /* Eerst op kijkerstrekkers, dan op tijd. Zie score() hierboven. */
    var sc={};
    events.forEach(function(ev){sc[ev.idEvent||(ev.strEvent+ev.dateEvent)]=score(ev)});
    function key(ev){return ev.idEvent||(ev.strEvent+ev.dateEvent)}
    events.sort(function(a,b){
      var d=sc[key(b)]-sc[key(a)];
      if(d)return d;
      return(a.dateEvent+(a.strTime||'')).localeCompare(b.dateEvent+(b.strTime||''));
    });
    /* Niet zes keer dezelfde competitie: hooguit zoveel per competitie, daarna aanvullen op score. */
    function spreid(lijst,max,perComp){
      var uit=[],tel={},i;
      for(i=0;i<lijst.length&&uit.length<max;i++){
        var k=lijst[i].strLeague||'';
        if((tel[k]||0)>=perComp)continue;
        tel[k]=(tel[k]||0)+1;uit.push(lijst[i]);
      }
      for(i=0;i<lijst.length&&uit.length<max;i++){if(uit.indexOf(lijst[i])<0)uit.push(lijst[i])}
      return uit;
    }
    var top=spreid(events,6,2);
    var rest=events.filter(function(ev){return top.indexOf(ev)<0});
    var sizeCls=['big','m','m','s','s','s'];
    bento.innerHTML=top.map(function(ev,i){
      var attr=' class="ev '+sizeCls[i]+' rv"';
      var b=badgeInfo(ev);
      var crest=i===0?'<span class="crest"></span>':'';
      var btn=i===0?'<span class="btn primary">Probeer nu 24 uur gratis</span>':'';
      var topper=isTopper(ev)?'<span class="badge topper">Topper</span>':'';
      return '<a'+attr+' href="#gratis" data-proef>'+crest+
        '<span class="badge'+b.cls+'">'+b.txt+'</span>'+topper+
        crestsHtml(ev)+
        '<span class="comp">'+esc(compNaam(ev))+'</span>'+
        '<span class="teams">'+teamsHtml(ev)+'</span>'+
        '<span class="when">'+esc(fmtWhen(ev))+(ev.strVenue?', '+esc(ev.strVenue):'')+'</span>'+btn+'</a>';
    }).join('');
    if(agenda){
      var ag=spreid(rest.length>=4?rest:events,4,2);
      ag.sort(function(a,b){return(a.dateEvent+(a.strTime||'')).localeCompare(b.dateEvent+(b.strTime||''))});
      agenda.innerHTML=ag.map(function(ev){
        var d=toDate(ev);
        var label=isNaN(d.getTime())?'':DAGEN_KORT[d.getDay()]+' '+d.getDate()+' '+MAANDEN[d.getMonth()];
        return '<a class="ag" href="#gratis" data-proef><span class="d">'+label+'</span><div><b>'+esc(teamsPlain(ev))+'</b><small>'+esc(compNaam(ev))+(ev.strTime?', '+ev.strTime.slice(0,5)+' uur':'')+'</small></div></a>';
      }).join('');
    }
    /* dynamisch ingevoegde kaarten missen de scroll-reveal van bij het laden: gewoon meteen zichtbaar tonen */
    sportSection.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')});
  }
  /* Filteren op de echte begintijd, niet op de datumtekst. Een wedstrijd blijft staan
     tot drie uur na de aftrap (dan is hij afgelopen) en verdwijnt daarna. Ook de
     inhoud van de cache gaat hier nog een keer doorheen: anders toont een bezoeker
     met een oude cache alsnog de wedstrijd van gisteren. */
  function nogTeGaan(ev){
    if(!ev||!ev.dateEvent)return false;
    var d=toDate(ev);
    if(isNaN(d.getTime()))return false;
    return d.getTime()+3*60*60*1000>Date.now();
  }
  function load(){
    try{
      var cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(cached&&(Date.now()-cached.t)<CACHE_MS&&cached.events){
        var gz={};
        var vers=cached.events.filter(nogTeGaan).filter(function(ev){
          var k=ev.idEvent||(ev.strEvent+ev.dateEvent);
          if(gz[k])return false; gz[k]=1; return true;
        });
        if(vers.length){render(vers);return}
      }
    }catch(e){}
    Promise.all(LEAGUES.map(fetchLeague)).then(function(lists){
      var gezien={};
      var events=[].concat.apply([],lists).filter(nogTeGaan).filter(function(ev){
        var k=ev.idEvent||(ev.strEvent+ev.dateEvent);
        if(gezien[k])return false; gezien[k]=1; return true;
      });
      if(events.length){
        try{localStorage.setItem(CACHE_KEY,JSON.stringify({t:Date.now(),events:events}))}catch(e){}
        render(events);
      }
      /* geen (toegankelijke) events voor deze sleutel/competities: de statische kaarten blijven staan, geen lege sectie */
    });
  }
  load();
})();
