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
    var NOVA_JAAR=99.99,now=document.getElementById('c-now'),save=document.getElementById('c-save'),big=save.parentElement;
    var fmt=function(n){return n.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})};
    var fmt0=function(n){return Math.round(n).toLocaleString('nl-NL')};
    var cur={now:0,save:0};
    function upd(){
      var t=0;calc.querySelectorAll('.ck input:checked').forEach(function(i){t+=parseFloat(i.value)});
      /* de vinkjes zijn maandprijzen; we rekenen alles om naar een jaarbedrag, zodat de vergelijking met €99,99 per jaar klopt */
      var tj=t*12,sy=Math.max(0,tj-NOVA_JAAR),from={now:cur.now,save:cur.save},s0=performance.now();
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
  var C=window.NOVA_CONFIG||{},modal=document.getElementById('proef'),form=document.getElementById('proef-form'),msg=document.getElementById('proef-msg'),waBtn=document.getElementById('proef-wa'),lastFocus=null;
  var koopWrap=modal.querySelector('.koopvelden'),modalTitle=document.getElementById('proef-t'),
      modalEyebrow=modal.querySelector('.eyebrow'),modalIntro=modal.querySelector('.box>p'),koopModus=false;

  /* Factuurnummer. Loopt op vanaf 33761 en telt één op per minuut sinds de start van
     de verkoop, zodat twee bezoekers vrijwel nooit hetzelfde nummer krijgen. Een echt
     sluitende nummering vraagt een server; zie KOPPELING.md. */
  var FACTUUR_START=C.factuurStart||33761,
      VERKOOP_START=Date.parse(C.verkoopStart||'2026-08-29T00:00:00Z');
  function factuurnummer(){
    return String(FACTUUR_START+Math.max(0,Math.floor((Date.now()-VERKOOP_START)/60000)));
  }

  /* IBAN-controle volgens de officiële 97-toets, zodat een typefout er meteen uit komt */
  function ibanGeldig(v){
    v=(v||'').replace(/\s+/g,'').toUpperCase();
    if(!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(v))return false;
    var her=v.slice(4)+v.slice(0,4), num='';
    for(var i=0;i<her.length;i++){var c=her.charCodeAt(i);num+=(c>=65&&c<=90)?(c-55):her[i]}
    var rest=0;
    for(var j=0;j<num.length;j++){rest=(rest*10+ +num[j])%97}
    return rest===1;
  }

  function openModal(plan,koop){
    koopModus=!!koop;
    modal.classList.remove('sent');form.reset();
    form.plan.value=plan||'Gratis proef 24 uur';
    koopWrap.hidden=!koopModus;
    if(koopModus){
      form.factuur.value=factuurnummer();
      modalEyebrow.textContent='Vooraf betaald, verlengt nooit vanzelf';
      modalTitle.textContent='Bestellen: '+(plan||'').replace('Abonnement ','');
      modalIntro.textContent='Vul je gegevens in. Je krijgt de betaalinstructies en je activatiecode via WhatsApp.';
      document.getElementById('proef-submit').textContent='Bestelling plaatsen';
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
  document.querySelectorAll('[data-wa]').forEach(function(a){a.href=waUrl('Hoi Odysstream, ik heb een vraag.');a.target='_blank';a.rel='noopener'});
  function lead(d){
    var payload={naam:d.naam,email:d.email,telefoon:d.telefoon,plan:d.plan,
      bron:d.koop?'website bestelling':'website gratis proef',pagina:location.href,tijd:new Date().toISOString()};
    if(d.koop){payload.factuurnummer=d.factuur;payload.tenaamstelling=d.tenaamstelling;payload.iban=d.iban}
    var jobs=[];
    if(C.crm==='hubspot'&&C.hubspotPortalId&&C.hubspotFormId){
      var hs={fields:[{name:'firstname',value:d.naam},{name:'email',value:d.email},{name:'phone',value:d.telefoon},{name:'message',value:'Bron: website. Plan: '+d.plan+(d.koop?('\nBESTELLING\nFactuurnummer: '+d.factuur+'\nTenaamstelling: '+d.tenaamstelling+'\nIBAN: '+d.iban):'')}],context:{pageUri:location.href,pageName:document.title},legalConsentOptions:{consent:{consentToProcess:true,text:'Ik ga akkoord met de algemene voorwaarden en het privacybeleid van Odysstream (odysstream.nl/voorwaarden, odysstream.nl/privacy).'}}};
      jobs.push(fetch('https://api'+(C.hubspotRegion?'-'+C.hubspotRegion:'')+'.hsforms.com/submissions/v3/integration/submit/'+C.hubspotPortalId+'/'+C.hubspotFormId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(hs),keepalive:true}));
    }
    if(C.leadWebhook){jobs.push(fetch(C.leadWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}))}
    if(!jobs.length){try{var l=JSON.parse(localStorage.getItem('nova_leads')||'[]');l.push(payload);localStorage.setItem('nova_leads',JSON.stringify(l))}catch(e){}console.log('[Nova] lead (CRM nog niet gekoppeld):',payload)}
    return Promise.allSettled(jobs);
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();msg.textContent='';
    var d={naam:form.naam.value.trim(),email:form.email.value.trim(),telefoon:form.telefoon.value.trim(),plan:form.plan.value,koop:koopModus};
    if(koopModus){d.factuur=form.factuur.value;d.tenaamstelling=form.tenaamstelling.value.trim();
      d.iban=form.iban.value.replace(/\s+/g,'').toUpperCase()}
    var bad=[];form.querySelectorAll('input').forEach(function(i){i.classList.remove('err')});
    if(d.naam.length<2){bad.push('naam')}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)){bad.push('email')}
    if(d.telefoon.replace(/\D/g,'').length<9){bad.push('telefoon')}
    if(koopModus&&d.tenaamstelling.length<2){bad.push('tenaamstelling')}
    if(koopModus&&!ibanGeldig(d.iban)){bad.push('iban')}
    if(!form.akkoord.checked){bad.push('akkoord')}
    if(bad.length){bad.forEach(function(n){form[n].classList.add('err')});
      msg.textContent=bad[0]==='akkoord'?'Vink de voorwaarden aan om verder te gaan.':
        (bad[0]==='iban'?'Dit IBAN klopt niet. Controleer het even.':
        'Controleer je '+({naam:'naam',email:'e-mailadres',telefoon:'telefoonnummer',tenaamstelling:'tenaamstelling'})[bad[0]]+'.');
      form[bad[0]].focus();return}
    var btn=document.getElementById('proef-submit');btn.disabled=true;btn.textContent='Even geduld...';
    /* De IBAN gaat bewust NIET mee in de WhatsApp-link: die zou dan in de URL en in het
       chatverloop belanden. Alan vindt hem bij de bestelling in het CRM. */
    var text = koopModus
      ? 'Hoi Odysstream! Ik wil graag '+d.plan.toLowerCase()+' bestellen.\nFactuurnummer: '+d.factuur+'\nNaam: '+d.naam+'\nE-mail: '+d.email+'\nMijn rekeninggegevens heb ik op de site ingevuld.'
      : 'Hoi Odysstream! Ik wil graag de 24 uur gratis proef starten.\nNaam: '+d.naam+'\nE-mail: '+d.email;
    var url=waUrl(text);waBtn.href=url;
    var win=null;try{win=window.open('',
      '_blank')}catch(x){}
    lead(d).then(function(){
      var doneT=modal.querySelector('.done h3'),doneP=modal.querySelector('.done p');
      if(koopModus){doneT.textContent='Bestelling ontvangen';
        doneP.textContent='Je factuurnummer is '+d.factuur+'. Verstuur het bericht in WhatsApp, dan krijg je de betaalinstructies.'}
      else{doneT.textContent='Bijna klaar!';doneP.textContent='Verstuur het bericht in WhatsApp en je code komt eraan.'}
      modal.classList.add('sent');btn.disabled=false;btn.textContent=koopModus?'Bestelling plaatsen':'Probeer nu 24 uur gratis';if(win){win.location=url}else{location.href=url}});
  });
  if(fine)addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
})();

/* ===== Live sport: TheSportsDB ===== */
(function(){
  var sportSection=document.getElementById('sport');
  if(!sportSection)return;
  var C=window.NOVA_CONFIG||{};
  var KEY=C.sportsApiKey||'123';
  /* Eredivisie, Belgian Pro League, UEFA Champions League, UFC, Formule 1 */
  var LEAGUES=[4337,4338,4480,4443,4370];
  var CACHE_KEY='nova_sport_cache_v3',CACHE_MS=60*60*1000; /* 1 uur cache */
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
  function fetchLeague(id){
    return fetch('https://www.thesportsdb.com/api/v1/json/'+encodeURIComponent(KEY)+'/eventsnextleague.php?id='+id)
      .then(function(r){return r.ok?r.json():null})
      .then(function(j){return (j&&j.events)||[]})
      .catch(function(){return[]});
  }
  function render(events){
    var bento=sportSection.querySelector('.bento'),agenda=sportSection.querySelector('.agenda');
    if(!bento||!events.length)return; /* geen (bruikbare) data: de statische kaarten in index.html blijven gewoon staan */
    events.sort(function(a,b){return(a.dateEvent+(a.strTime||'')).localeCompare(b.dateEvent+(b.strTime||''))});
    var top=events.slice(0,6);
    var sizeCls=['big','m','m','s','s','s'];
    bento.innerHTML=top.map(function(ev,i){
      var attr=' class="ev '+sizeCls[i]+' rv"';
      var b=badgeInfo(ev);
      var crest=i===0?'<span class="crest"></span>':'';
      var btn=i===0?'<span class="btn primary">Probeer nu 24 uur gratis</span>':'';
      return '<a'+attr+' href="#gratis" data-proef>'+crest+
        '<span class="badge'+b.cls+'">'+b.txt+'</span>'+
        crestsHtml(ev)+
        '<span class="comp">'+esc(ev.strLeague||'')+'</span>'+
        '<span class="teams">'+teamsHtml(ev)+'</span>'+
        '<span class="when">'+esc(fmtWhen(ev))+(ev.strVenue?', '+esc(ev.strVenue):'')+'</span>'+btn+'</a>';
    }).join('');
    if(agenda){
      agenda.innerHTML=events.slice(0,4).map(function(ev){
        var d=toDate(ev);
        var label=isNaN(d.getTime())?'':DAGEN_KORT[d.getDay()]+' '+d.getDate()+' '+MAANDEN[d.getMonth()];
        return '<a class="ag" href="#gratis" data-proef><span class="d">'+label+'</span><div><b>'+esc(teamsPlain(ev))+'</b><small>'+esc(ev.strLeague||'')+(ev.strTime?', '+ev.strTime.slice(0,5)+' uur':'')+'</small></div></a>';
      }).join('');
    }
    /* dynamisch ingevoegde kaarten missen de scroll-reveal van bij het laden: gewoon meteen zichtbaar tonen */
    sportSection.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')});
  }
  function load(){
    try{
      var cached=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');
      if(cached&&(Date.now()-cached.t)<CACHE_MS&&cached.events&&cached.events.length){render(cached.events);return}
    }catch(e){}
    Promise.all(LEAGUES.map(fetchLeague)).then(function(lists){
      var today=new Date().toISOString().slice(0,10);
      var events=[].concat.apply([],lists).filter(function(ev){return ev&&ev.dateEvent&&ev.dateEvent>=today});
      if(events.length){
        try{localStorage.setItem(CACHE_KEY,JSON.stringify({t:Date.now(),events:events}))}catch(e){}
        render(events);
      }
      /* geen (toegankelijke) events voor deze sleutel/competities: de statische kaarten blijven staan, geen lege sectie */
    });
  }
  load();
})();
