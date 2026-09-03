/* Instellingen uit het beheerpaneel ophalen en op de pagina toepassen.
   Bron: instellingen.json naast deze pagina (op de VPS komt die uit het adminpanel).
   Lukt het ophalen niet (bijvoorbeeld op GitHub Pages), dan blijft alles zoals het in de
   pagina zelf staat: de site werkt altijd. */
(function(){
  var C=null,naam='';
  Object.keys(window).forEach(function(k){if(/_CONFIG$/.test(k)&&window[k]&&typeof window[k]==='object'){C=window[k];naam=k}});
  if(!C){C={};window.SITE_CONFIG=C}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  function pasToe(i){
    if(!i||typeof i!=='object')return;
    if(i.whatsapp)C.whatsapp=String(i.whatsapp).replace(/\D/g,'');
    if(i.iban)C.iban=i.iban;
    if(i.tenaamstelling)C.tenaamstelling=i.tenaamstelling;
    C.pixelFacebook=i.pixelFacebook||'';
    C.pixelTiktok=i.pixelTiktok||'';
    pixels();
    rails(i);
    C.instellingenGeladen=true;
    try{document.dispatchEvent(new CustomEvent('instellingen-geladen',{detail:i}))}catch(e){}
  }

  /* ---- advertentiepixels ---- */
  function pixels(){
    if(C.pixelFacebook&&!window.fbq){
      /* standaard Meta-pixelcode */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init',C.pixelFacebook);window.fbq('track','PageView');
    }
    if(C.pixelTiktok&&!window.ttq){
      /* standaard TikTok-pixelcode */
      !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var s=d.createElement('script');s.type='text/javascript';s.async=!0;s.src=r+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(s,a)};ttq.load(C.pixelTiktok);ttq.page()}(window,document,'ttq');
    }
  }
  /* aan te roepen door de site bij een verstuurd formulier */
  window.pixelLead=function(soort){
    try{if(window.fbq)window.fbq('track','Lead',{content_name:soort||'gratis proef'})}catch(e){}
    try{if(window.ttq)window.ttq.track('SubmitForm',{content_name:soort||'gratis proef'})}catch(e){}
  };

  /* ---- films en series ---- */
  function poster(f){
    return '<a class="poster" href="#gratis" data-proef><div class="pimg">'+(f.label?'<span class="tag">'+esc(f.label)+'</span>':'')+
      '<img src="'+esc(f.poster)+'" alt="'+esc(f.titel)+'" loading="lazy" referrerpolicy="no-referrer"><span class="play"></span></div>'+
      '<b>'+esc(f.titel)+'</b>'+(f.sub?'<small>'+esc(f.sub)+'</small>':'')+'</a>';
  }
  function rails(i){
    var sec=document.getElementById('films');if(!sec)return;
    var blokken=sec.querySelectorAll('.rails > div');
    [['films',0],['series',1]].forEach(function(p){
      var lijst=i[p[0]];if(!Array.isArray(lijst))return;
      var blok=blokken[p[1]];if(!blok)return;
      /* lege lijst: alleen leegmaken als de lijst bewust in het portaal is opgeslagen; anders blijven de vaste posters staan */
      if(!lijst.length){if(i.filmsAangepast)blok.hidden=true;return}
      blok.hidden=false;
      var rail=blok.querySelector('.rail');if(!rail)return;
      rail.innerHTML=lijst.filter(function(f){return f&&f.titel&&f.poster}).map(poster).join('');
      try{rail.scrollLeft=0}catch(e){}
    });
  }

  /* ---- ophalen ---- */
  function haal(){
    var url='instellingen.json';
    if(!window.fetch)return;
    fetch(url,{cache:'no-cache',credentials:'omit'}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j)pasToe(j)}).catch(function(){});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',haal);else haal();
})();
