
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
 byId('placeOrder').addEventListener('click',function(){var names=Object.keys(cart).filter(function(k){return cart[k]>0}).map(function(k){return cart[k]+' × '+menu[k].name});if(!names.length)return;last++;var row=document.createElement('div');row.className='order';var left=document.createElement('div');var strong=document.createElement('strong');strong.textContent='Demo #'+last+' · Direkte';var subt=document.createElement('span');subt.textContent=names.join(', ');left.appendChild(strong);left.appendChild(document.createElement('br'));left.appendChild(subt);var state=0;var status=document.createElement('span');status.className='order-chip';status.textContent=statuses[state];var next=document.createElement('button');next.className='advance';next.textContent='Neste status →';next.type='button';next.addEventListener('click',function(){state=Math.min(statuses.length-1,state+1);status.textContent=statuses[state];if(state===statuses.length-1){next.disabled=true;next.textContent='Fullført ✓'}if(latestStatus===status)byId('customerOrderStatus').textContent='Din simulerte bestilling #'+last+' · '+statuses[state]});row.appendChild(left);row.appendChild(status);row.appendChild(next);byId('demoOrders').prepend(row);latestStatus=status;byId('customerOrderStatus').hidden=false;byId('customerOrderStatus').textContent='Din simulerte bestilling #'+last+' · '+statuses[0];Object.keys(cart).forEach(function(k){cart[k]=0});refresh();byId('orderMessage').textContent='Bestillingen ble kun simulert. Se resultatet i restaurantpanelet.';tab(true)});
})();
