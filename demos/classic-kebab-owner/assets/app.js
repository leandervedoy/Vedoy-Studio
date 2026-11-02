
(function(){
 'use strict';
 var nf = new Intl.NumberFormat('nb-NO',{maximumFractionDigits:0});
 var n2 = new Intl.NumberFormat('nb-NO',{minimumFractionDigits:2,maximumFractionDigits:2});
 var fmt = function(n){return nf.format(n)+' kr'};
 var precise = function(n){return n2.format(n)+' kr'};
 var ids = ['orders','average','direct','market','acquisition','monthlyFee'];
 var byId = function(id){return document.getElementById(id)};
 function calc(){
  var orders=+byId('orders').value, avg=+byId('average').value, direct=+byId('direct').value/100, market=+byId('market').value/100;
  var vedoyFee=avg*.03+avg*.024+2, marketFee=avg*market, delta=marketFee-vedoyFee, moved=orders*direct;
  var marketing=+byId('acquisition').value, monthlyFee=+byId('monthlyFee').value;
  var monthly=moved*(delta-marketing)-monthlyFee;
  byId('orders-v').textContent=nf.format(orders);
  byId('average-v').textContent=fmt(avg);
  byId('direct-v').textContent=nf.format(direct*100)+' %';
  byId('market-v').textContent=nf.format(market*100)+' %';
  byId('acquisition-v').textContent=fmt(marketing);
  byId('monthlyFee-v').textContent=fmt(monthlyFee);
  byId('monthly').textContent=fmt(monthly);
  byId('moved').textContent=nf.format(moved);
  byId('yearly').textContent=fmt(monthly*12);
  byId('perorder').textContent=precise(delta);
  byId('leftmarket').textContent=fmt(avg-marketFee);
  byId('leftdirect').textContent=precise(avg-vedoyFee);
  var mKeep=(1-market)*100,vKeep=(1-vedoyFee/avg)*100;
  byId('market-pct').textContent=n2.format(mKeep)+' %';
  byId('vedoy-pct').textContent=n2.format(vKeep)+' %';
  byId('marketbar').style.width=Math.max(0,mKeep)+'%';
  byId('vedoybar').style.width=Math.max(0,vKeep)+'%';
 }
 ids.forEach(function(id){byId(id).addEventListener('input',calc)});calc();
 var dlg=byId('demoDialog'),close=byId('closeDemo'),cTab=byId('customerTab'),aTab=byId('adminTab'),cView=byId('customerView'),aView=byId('adminView');
 function open(){if(!dlg.open){dlg.showModal();document.body.classList.add('modal-open')}}
 function closeDialog(){dlg.close();document.body.classList.remove('modal-open')}
 document.querySelectorAll('[data-open-demo]').forEach(function(b){b.addEventListener('click',open)});
 close.addEventListener('click',closeDialog);
 dlg.addEventListener('close',function(){document.body.classList.remove('modal-open')});
 dlg.addEventListener('click',function(e){if(e.target===dlg)closeDialog()});
 function tab(admin){cView.hidden=admin;aView.hidden=!admin;cTab.classList.toggle('active',!admin);aTab.classList.toggle('active',admin);cTab.setAttribute('aria-pressed',String(!admin));aTab.setAttribute('aria-pressed',String(admin))}
 cTab.addEventListener('click',function(){tab(false)});aTab.addEventListener('click',function(){tab(true)});
 var menu={pita:{name:'Kebab i pita',price:139},milkshake:{name:'Milkshake',price:79},rull:{name:'Kebabrull',price:159}};
 var cart={pita:0,milkshake:0,rull:0},last=1001;
 var latestStatus=null;
 var statuses=['Ny bestilling','Godkjent','Tilberedes','Klar for henting','Fullført'];
 function refresh(){var count=0,total=0;Object.keys(cart).forEach(function(k){count+=cart[k];total+=cart[k]*menu[k].price});byId('cartCount').textContent=count;byId('cartTotal').textContent=fmt(total);byId('placeOrder').disabled=count===0}
 document.querySelectorAll('[data-item]').forEach(function(btn){btn.addEventListener('click',function(){cart[btn.dataset.item]++;refresh();byId('orderMessage').textContent='Lagt til i handlekurven. Dette er fortsatt bare en demo.'})});
 byId('placeOrder').addEventListener('click',function(){var names=Object.keys(cart).filter(function(k){return cart[k]>0}).map(function(k){return cart[k]+' × '+menu[k].name});if(!names.length)return;last++;var row=document.createElement('div');row.className='order';row.dataset.source='direct';var left=document.createElement('div');var strong=document.createElement('strong');strong.textContent='Demo #'+last+' · Direkte';var subt=document.createElement('span');subt.textContent=names.join(', ');left.appendChild(strong);left.appendChild(document.createElement('br'));left.appendChild(subt);var state=0;var status=document.createElement('span');status.className='order-chip';status.textContent=statuses[state];var next=document.createElement('button');next.className='advance';next.textContent='Neste status →';next.type='button';next.addEventListener('click',function(){state=Math.min(statuses.length-1,state+1);status.textContent=statuses[state];if(state===statuses.length-1){next.disabled=true;next.textContent='Fullført ✓'}if(latestStatus===status)byId('customerOrderStatus').textContent='Din simulerte bestilling #'+last+' · '+statuses[state]});row.appendChild(left);row.appendChild(status);row.appendChild(next);byId('demoOrders').prepend(row);latestStatus=status;byId('customerOrderStatus').hidden=false;byId('customerOrderStatus').textContent='Din simulerte bestilling #'+last+' · '+statuses[0];Object.keys(cart).forEach(function(k){cart[k]=0});refresh();byId('orderMessage').textContent='Bestillingen ble kun simulert. Se resultatet i restaurantpanelet.';tab(true)});
  var filterButtons=document.querySelectorAll('[data-filter-source]');
  function applyOrderFilter(source){
    document.querySelectorAll('#demoOrders .order').forEach(function(row){
      row.hidden=source!=='all'&&row.dataset.source!==source;
    });
    filterButtons.forEach(function(btn){
      var on=btn.dataset.filterSource===source;
      btn.classList.toggle('active',on);
      btn.setAttribute('aria-pressed',String(on));
    });
  }
  filterButtons.forEach(function(btn){btn.addEventListener('click',function(){applyOrderFilter(btn.dataset.filterSource)})});
  document.querySelectorAll('[data-plan-monthly]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var target=byId('monthlyFee'),value=Number(btn.dataset.planMonthly);
      if(!target||!Number.isFinite(value))return;
      target.value=String(value);calc();
      byId('kalkulator').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
  });
})();

/* source filters and price calculator shortcuts */

/* Delightful, accessible presentation motion and interactive examples. */
(function(){
 'use strict';
 var prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(!prefersReduced.matches&&'IntersectionObserver' in window){
   document.documentElement.classList.add('has-js');
   var observer=new IntersectionObserver(function(entries){
     entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}});
   },{threshold:.06,rootMargin:'0px 0px -24px 0px'});
   document.querySelectorAll('[data-reveal]').forEach(function(el){observer.observe(el)});
 } else {
   document.querySelectorAll('[data-reveal]').forEach(function(el){el.classList.add('is-visible')});
 }
 var typeEl=document.getElementById('typewriter');
 if(typeEl&&!prefersReduced.matches) {
   var phrases=['egen nettside','bestillingsapp','ett ordresystem','flere faste kunder'];
   var pi=0,pos=0,removing=false;
   function tick(){
     var phrase=phrases[pi];
     if(!removing){pos++;typeEl.textContent=phrase.slice(0,pos);if(pos>=phrase.length){removing=true;setTimeout(tick,1850);return}}
     else {pos--;typeEl.textContent=phrase.slice(0,pos);if(pos<=0){removing=false;pi=(pi+1)%phrases.length;setTimeout(tick,350);return}}
     setTimeout(tick,removing?43:85);
   }
   typeEl.textContent='';tick();
 }
 var game=document.getElementById('gameField'),target=document.getElementById('gameTarget'),start=document.getElementById('gameStart'),overlay=document.getElementById('gameOverlay'),hitsOut=document.getElementById('gameHits'),timeOut=document.getElementById('gameTime'),gameMsg=document.getElementById('gameMessage');
 if(game&&target&&start&&overlay){
   var points=0,remaining=12,interval=null,playing=false;
   function move(){
     // Limit target center to the safe playing area.
     var x=15+Math.random()*70,y=22+Math.random()*56;
     target.style.left=x+'%';target.style.top=y+'%';
   }
   function end(win){
     if(interval){clearInterval(interval);interval=null}
     playing=false;target.disabled=true;overlay.hidden=false;start.disabled=false;
     overlay.innerHTML=win?'<span>🏆</span><strong>Du klarte det!</strong><small>En ekte kampanje kunne gitt en kontrollert rabatt.</small>':'<span>🌯</span><strong>Tiden er ute!</strong><small>Prøv gjerne igjen – dette er bare en demo.</small>';
     gameMsg.textContent=win?'Demo fullført! Ingen ekte rabattkode opprettes.':'Et morsomt konsept for å engasjere gjestene.';
     start.textContent='Spill igjen ↗';
   }
   start.addEventListener('click',function(){
     if(interval)clearInterval(interval);
     points=0;remaining=12;playing=true;target.disabled=false;overlay.hidden=true;start.disabled=true;move();
     hitsOut.textContent='0 av 5 treff';timeOut.textContent='12 sekunder';gameMsg.textContent='Fang fem kebaber før tiden går ut.';
     interval=setInterval(function(){remaining--;timeOut.textContent=remaining+' sekunder';if(remaining<=0)end(false)},1000);
   });
   target.addEventListener('click',function(){if(!playing)return;points++;hitsOut.textContent=points+' av 5 treff';if(points>=5){end(true)}else move()});
 }
 var stamps=document.querySelectorAll('[data-stamp]'),stampButton=document.getElementById('stampButton'),counter=document.getElementById('stampCounter'),stampMessage=document.getElementById('stampMessage');
 if(stamps.length&&stampButton){
  var value=0;
  stampButton.addEventListener('click',function(){
    value=value>=5?0:value+1;
    stamps.forEach(function(el,i){el.classList.toggle('filled',i<value)});
    counter.textContent=value+' / 5';
    if(value===5){stampMessage.textContent='🎉 Simulert belønning oppnådd! Ingen ekte rabatt.';stampButton.textContent='Nullstill demoen ↻'}
    else {stampMessage.textContent=value+' simulerte kjøp. Ingenting lagres.';stampButton.textContent='Simuler en bestilling ↗'}
  });
 }
})();

/* Vedoy Growth – sales preview, no external data, no persistence */
(function(){
  'use strict';
  var tabs=Array.from(document.querySelectorAll('[data-growth-tab]'));
  var panel=document.getElementById('growthPanel');
  if(!tabs.length||!panel)return;
  var content={
    oversikt:{title:'Dagens oversikt',description:'Se raskt hva som trenger oppfølging – uten å lete i flere systemer.',kpis:[['AKTIVE KUNDER','24'],['ÅPNE HENVENDELSER','4'],['KOMMENDE BOOKINGER','3']],activities:[['Følg opp nye kundehenvendelser','Til oppfølging'],['Oppdater tilbud på nettsiden','Innhold'],['Se kommende bookinger','Kalender']],benefit:'Bedre kontroll på dagen.',explanation:'Samle oppgaver, henvendelser og viktig drift i ett bilde. Mindre leting gir mer tid til selve restauranten.'},
    kunder:{title:'Kunder og CRM',description:'Hold kontaktinformasjon, oppfølging og nye forespørsler samlet.',kpis:[['KUNDEKORT','24'],['VENTER PÅ SVAR','4'],['NYE HENVENDELSER','7']],activities:[['Se hvem som venter på svar','CRM'],['Følg opp forespørsel om catering','Eksempel'],['Oppdater kontaktinformasjon','Kundekort']],benefit:'Kundene blir ikke glemt.',explanation:'Ett kontaktpunkt for kundeoppfølging gjør det enklere å håndtere spørsmål, tilbud og tilbakemeldinger. CRM-modulen er i beta.'},
    prosjekter:{title:'Prosjekter og publisering',description:'Hold orden på nettsiden, pågående oppgaver og neste endring.',kpis:[['PÅGÅENDE PROSJEKTER','2'],['PLANLAGTE ENDRINGER','3'],['KLARE TIL GJENNOMGANG','1']],activities:[['Oppdatere menybilde','Nettside'],['Klargjøre kampanjeside','Prosjekt'],['Gjennomgå ny versjon','Utkast']],benefit:'Tydelig fremdrift.',explanation:'Når nye funksjoner eller kampanjer utvikles, kan bedriften følge med på hva som skjer og hva som skal godkjennes.'},
    booking:{title:'Booking og timeregistrering',description:'Planlegg avtaler, hold oversikt over tidsbruk og finn ledige tidspunkter.',kpis:[['AVTALER DENNE UKEN','3'],['REGISTRERTE TIMER','12'],['OPPGAVER TIL PLANLEGGING','2']],activities:[['Gjennomgå kommende avtaler','Kalender'],['Registrer utført arbeid','Timer'],['Planlegg ny oppfølgingssamtale','Booking']],benefit:'Ryddigere planlegging.',explanation:'Hold avtaler og arbeidstimer på ett sted, og gjør det enklere å vite hvem som skal gjøre hva.'},
    notater:{title:'Notater og Vedoy Canvas',description:'Samle idéer, møtenotater og oppgaver i en ryddig arbeidsflate.',kpis:[['ARBEIDSOMRÅDER','2'],['NOTATER','8'],['ÅPNE OPPGAVER','5']],activities:[['Idé til ny sommerspesial','Notat'],['Sjekkliste for åpningsdagen','Canvas'],['Planlegg neste kampanje','Arbeidsområde']],benefit:'Gode idéer blir til handling.',explanation:'En samlet arbeidsflate gjør det lettere å dokumentere beslutninger og holde teamet oppdatert.'}
  };
  var get=function(id){return document.getElementById(id)};
  function render(tab){
    var data=content[tab];if(!data)return;
    tabs.forEach(function(button){var active=button.dataset.growthTab===tab;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active)panel.setAttribute('aria-labelledby',button.id)});
    get('growthPanelTitle').textContent=data.title;
    get('growthPanelDescription').textContent=data.description;
    for(var i=0;i<3;i++){
      get('growthKpiLabel'+(i+1)).textContent=data.kpis[i][0];
      get('growthKpiValue'+(i+1)).textContent=data.kpis[i][1];
      get('growthKpiNote'+(i+1)).textContent='Eksempeltall';
    }
    get('growthActivityHeading').textContent=tab==='oversikt'?'Neste steg':'Eksempler på oppgaver';
    var list=get('growthActivityList');
    list.replaceChildren();
    data.activities.forEach(function(item){
      var li=document.createElement('li'),dot=document.createElement('span'),small=document.createElement('small');
      dot.className='business-activity-dot';small.textContent=item[1];li.appendChild(dot);li.appendChild(document.createTextNode(item[0]));li.appendChild(small);list.appendChild(li);
    });
    get('growthBenefitTitle').textContent=data.benefit;
    get('growthBenefitText').textContent=data.explanation;
  }
  tabs.forEach(function(button,index){
    button.tabIndex=button.classList.contains('active')?0:-1;
    button.addEventListener('click',function(){render(button.dataset.growthTab)});
    button.addEventListener('keydown',function(e){
      if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
      e.preventDefault();var next=index;
      if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(index+1)%tabs.length;
      else next=(index+tabs.length-1)%tabs.length;
      tabs[next].focus();render(tabs[next].dataset.growthTab);
    });
  });
})();
