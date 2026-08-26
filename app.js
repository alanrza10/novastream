(function(){
  document.querySelectorAll('.rail-track').forEach(function(t){t.innerHTML+=t.innerHTML});
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
    var NOVA=99/12,now=document.getElementById('c-now'),save=document.getElementById('c-save'),savem=document.getElementById('c-savem'),big=save.parentElement;
    var fmt=function(n){return n.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2})};
    var fmt0=function(n){return Math.round(n).toLocaleString('nl-NL')};
    var cur={now:0,save:0};
    function upd(){
      var t=0;calc.querySelectorAll('.ck input:checked').forEach(function(i){t+=parseFloat(i.value)});
      var sm=Math.max(0,t-NOVA),sy=sm*12,from={now:cur.now,save:cur.save},s0=performance.now();
      big.classList.add('pop');setTimeout(function(){big.classList.remove('pop')},250);
      (function f(n){var p=Math.min(1,(n-s0)/600),e=1-Math.pow(1-p,3);var a=from.now+(t-from.now)*e,b=from.save+(sy-from.save)*e;now.textContent=fmt(a);save.textContent=fmt0(b);savem.textContent=fmt(b/12);if(p<1)requestAnimationFrame(f);else{cur.now=t;cur.save=sy}})(s0);
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
  function openModal(plan){modal.classList.remove('sent');form.reset();form.plan.value=plan||'Gratis proef 24 uur';document.getElementById('proef-submit').textContent='Probeer nu 24 uur gratis';msg.textContent='';lastFocus=document.activeElement;modal.classList.add('open');document.body.style.overflow='hidden';setTimeout(function(){form.naam.focus()},50)}
  function closeModal(){modal.classList.remove('open');document.body.style.overflow='';if(lastFocus)lastFocus.focus()}
  document.querySelectorAll('[data-proef]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();openModal(a.dataset.plan?'Abonnement '+a.dataset.plan:'')})});
  modal.querySelectorAll('[data-close]').forEach(function(el){el.addEventListener('click',closeModal)});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});
  function waUrl(text){return 'https://wa.me/'+(C.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(text)}
  document.querySelectorAll('[data-wa]').forEach(function(a){a.href=waUrl('Hoi Odysstream, ik heb een vraag.');a.target='_blank';a.rel='noopener'});
  function lead(d){
    var payload={naam:d.naam,email:d.email,telefoon:d.telefoon,plan:d.plan,bron:'website',pagina:location.href,tijd:new Date().toISOString()};
    var jobs=[];
    if(C.crm==='hubspot'&&C.hubspotPortalId&&C.hubspotFormId){
      var hs={fields:[{name:'firstname',value:d.naam},{name:'email',value:d.email},{name:'phone',value:d.telefoon},{name:'message',value:'Bron: website. Plan: '+d.plan}],context:{pageUri:location.href,pageName:document.title},legalConsentOptions:{consent:{consentToProcess:true,text:'Ik ga akkoord met de algemene voorwaarden en het privacybeleid van Odysstream (odysstream.nl/voorwaarden, odysstream.nl/privacy).'}}};
      jobs.push(fetch('https://api'+(C.hubspotRegion?'-'+C.hubspotRegion:'')+'.hsforms.com/submissions/v3/integration/submit/'+C.hubspotPortalId+'/'+C.hubspotFormId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(hs),keepalive:true}));
    }
    if(C.leadWebhook){jobs.push(fetch(C.leadWebhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}))}
    if(!jobs.length){try{var l=JSON.parse(localStorage.getItem('nova_leads')||'[]');l.push(payload);localStorage.setItem('nova_leads',JSON.stringify(l))}catch(e){}console.log('[Nova] lead (CRM nog niet gekoppeld):',payload)}
    return Promise.allSettled(jobs);
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();msg.textContent='';
    var d={naam:form.naam.value.trim(),email:form.email.value.trim(),telefoon:form.telefoon.value.trim(),plan:form.plan.value};
    var bad=[];form.querySelectorAll('input').forEach(function(i){i.classList.remove('err')});
    if(d.naam.length<2){bad.push('naam')}
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)){bad.push('email')}
    if(d.telefoon.replace(/\D/g,'').length<9){bad.push('telefoon')}
    if(!form.akkoord.checked){bad.push('akkoord')}
    if(bad.length){bad.forEach(function(n){form[n].classList.add('err')});msg.textContent=bad[0]==='akkoord'?'Vink de voorwaarden aan om verder te gaan.':'Controleer je '+({naam:'naam',email:'e-mailadres',telefoon:'telefoonnummer'})[bad[0]]+'.';form[bad[0]].focus();return}
    var btn=document.getElementById('proef-submit');btn.disabled=true;btn.textContent='Even geduld...';
    var text='Hoi Odysstream! Ik wil graag '+(d.plan.indexOf('Abonnement')===0?'het '+d.plan.toLowerCase():'de 24 uur gratis proef')+' starten.\nNaam: '+d.naam+'\nE-mail: '+d.email;
    var url=waUrl(text);waBtn.href=url;
    var win=null;try{win=window.open('',
      '_blank')}catch(x){}
    lead(d).then(function(){modal.classList.add('sent');btn.disabled=false;btn.textContent='Probeer nu 24 uur gratis';if(win){win.location=url}else{location.href=url}});
  });
  if(fine)addEventListener('mousemove',function(e){mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2},{passive:true});
})();
