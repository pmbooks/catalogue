// Checkout page logic: read cart_v1 from localStorage, render table, manage qty/remove, continue shopping, proceed
function formatINR(n){const s=Number(n).toFixed(2).split('.');let intPart=s[0];let lastThree=intPart.slice(-3);let other=intPart.slice(0,-3);if(other!=='') lastThree=','+lastThree;const res=other.replace(/\B(?=(?:\d{2})+(?!\d))/g,',')+lastThree;return '₹'+res+'.'+s[1];}
function loadCart(){return JSON.parse(localStorage.getItem('cart_v1')||'{}');}
function saveCart(cart){localStorage.setItem('cart_v1',JSON.stringify(cart||{}));}
function renderCart(){const area=document.getElementById('cart-area');const cart=loadCart();const ids=Object.keys(cart);if(ids.length===0){area.innerHTML='<p>Your cart is empty.</p>';document.getElementById('grand-total').textContent=formatINR(0);return;}let html='<table class="cart-table"><thead><tr><th>Product Image</th><th>Product Title</th><th>Qty</th><th>Unit Price</th><th>Item Total</th><th>Delete</th></tr></thead><tbody>';
  let total=0;ids.forEach(id=>{const it=cart[id];const itemTotal=it.qty*it.price;total+=itemTotal;html+=`<tr data-id="${id}"><td><img src="${it.image}" style="height:70px;object-fit:cover;border-radius:4px"></td><td>${it.title}</td><td><select class="qty-select">${[1,2,3,4,5,6,7,8,9,10].map(q=>`<option value="${q}" ${q==it.qty? 'selected':''}>${q}</option>`).join('')}</select></td><td>${formatINR(it.price)}</td><td class="item-total">${formatINR(itemTotal)}</td><td><button class="btn ghost del">🗑</button></td></tr>`});
  html+='</tbody></table>';area.innerHTML=html;document.getElementById('grand-total').textContent=formatINR(total);
  // attach events
  document.querySelectorAll('.cart-table tbody tr').forEach(tr=>{const id=tr.getAttribute('data-id'); const sel=tr.querySelector('.qty-select'); sel.onchange=()=>{const c=loadCart(); c[id].qty=Number(sel.value); saveCart(c); renderCart();}; tr.querySelector('.del').onclick=()=>{const c=loadCart(); delete c[id]; saveCart(c); renderCart();};});}

document.getElementById('continue').onclick=()=>{window.location.href='index.html';}
document.getElementById('proceed').onclick=()=>{
  // Redirect to external payment or show summary. For now, build order summary and open alert.
  const cart=loadCart();const items=Object.values(cart).map(i=>`${i.title} x${i.qty}`).join(', ');const total=Object.values(cart).reduce((s,i)=>s+i.qty*i.price,0); if(total===0){alert('Your cart is empty');return;} // Replace PAYMENT_LINK with your payment provider link if you want
  const PAYMENT_LINK = 'PAYMENT_LINK';
  if(PAYMENT_LINK==='PAYMENT_LINK'){ alert('Proceed to payment — Replace PAYMENT_LINK in assets/checkout.js with your provider URL.\n\nOrder: '+items+'\nTotal: '+formatINR(total)); return; }
  // example: append amount/items as query
  const url = PAYMENT_LINK + `?amount=${encodeURIComponent(total)}&items=${encodeURIComponent(items)}`;
  window.location.href = url;
}

document.getElementById('year-checkout').textContent=new Date().getFullYear();
renderCart();
