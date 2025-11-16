// Main JS for index page: load books, render grid, modal, add-to-cart -> redirect to checkout
const BOOKS_URL = 'books.json';
const PER_PAGE = 9;
let books = [], filtered = [], categories = [], currentPage = 1;
const catalog = document.getElementById('catalog');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const catRow = document.getElementById('category-row');
const pagination = document.getElementById('pagination');
const modal = document.getElementById('product-modal');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalAuthor = document.getElementById('modal-author');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalQty = document.getElementById('modal-qty');
const modalAdd = document.getElementById('modal-add');
const closeModal = document.getElementById('close-modal');

document.getElementById('year').textContent = new Date().getFullYear();

function formatINR(n){
  const s = Number(n).toFixed(2).split('.');
  let intPart = s[0];
  let lastThree = intPart.slice(-3);
  let other = intPart.slice(0, -3);
  if(other !== '') lastThree = ',' + lastThree;
  const res = other.replace(/\B(?=(?:\d{2})+(?!\d))/g, ',') + lastThree;
  return '₹' + res + '.' + s[1];
}

function saveCart(cart){localStorage.setItem('cart_v1',JSON.stringify(cart||{}));}
function loadCart(){return JSON.parse(localStorage.getItem('cart_v1')||'{}');}

function openModal(book){modal.setAttribute('aria-hidden','false');modalImage.src=book.image;modalTitle.textContent=book.title;modalAuthor.textContent=book.author||'';modalDesc.innerHTML='';book.description.split('\n\n').forEach(p=>{const el=document.createElement('p');el.textContent=p;modalDesc.appendChild(el)});modalPrice.textContent=formatINR(book.price);modalQty.value='1';
  modalAdd.onclick = ()=>{addToCart(book,Number(modalQty.value)||1); window.location.href='checkout.html';};
}
closeModal.onclick=()=>{modal.setAttribute('aria-hidden','true');}
modal.onclick=(e)=>{if(e.target===modal) modal.setAttribute('aria-hidden','true');}

function addToCart(book,qty=1){const cart=loadCart(); if(cart[book.id]) cart[book.id].qty += qty; else cart[book.id]={id:book.id,title:book.title,price:book.price,image:book.image,qty:qty}; saveCart(cart); }

function renderPage(list){catalog.innerHTML='';const start=(currentPage-1)*PER_PAGE;const pageItems=list.slice(start,start+PER_PAGE);pageItems.forEach(b=>{const c=document.createElement('div');c.className='card';c.innerHTML=`<img src="${b.image}" data-id="${b.id}" alt="${b.title}">`+`<div class="card-body"><div class="title">${b.title}</div><div class="author">${b.author||''}</div><div class="price-row"><div class="price">${formatINR(b.price)}</div></div><div style="display:flex;gap:.5rem;justify-content:center;margin-top:.6rem"><button class="buy" data-id="${b.id}">Add to Cart</button></div></div>`;catalog.appendChild(c);
    // image click -> open modal
    c.querySelector('img').onclick = ()=>{openModal(b)};
    // add to cart -> direct to checkout
    c.querySelector('.buy').onclick = ()=>{addToCart(b,1); window.location.href='checkout.html';};
  });}

function renderPagination(list){pagination.innerHTML='';const pages=Math.max(1,Math.ceil(list.length/PER_PAGE));for(let i=1;i<=pages;i++){const btn=document.createElement('button');btn.className='page-btn'+(i===currentPage?' active':'');btn.textContent=i;btn.onclick=()=>{currentPage=i; renderPage(filtered); renderPagination(filtered); window.scrollTo({top:0,behavior:'smooth'});};pagination.appendChild(btn);}}

function renderCategories(){catRow.innerHTML='';const all=document.createElement('div');all.className='pill active';all.textContent='All';all.onclick=()=>{document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));all.classList.add('active');searchEl.value='';applyFilters()};catRow.appendChild(all);categories.forEach(c=>{const p=document.createElement('div');p.className='pill';p.textContent=c;p.onclick=()=>{document.querySelectorAll('.pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');searchEl.value=c;applyFilters()};catRow.appendChild(p)});}

function applyFilters(){
  const q = (searchEl.value || '').toLowerCase();
  const lang = document.getElementById('lang').value;

  filtered = books.filter(b => {
    const matchesSearch =
      ((b.title || '') + ' ' + (b.author || '') + ' ' + (b.category || ''))
      .toLowerCase()
      .includes(q);

    const matchesLang =
      (lang === 'all' || (b.language || '').toLowerCase() === lang.toLowerCase());

    return matchesSearch && matchesLang;
  });

  const s = sortEl.value;

  if (s === 'title') filtered.sort((a,b) => a.title.localeCompare(b.title));
  if (s === 'price_low') filtered.sort((a,b) => a.price - b.price);
  if (s === 'price_high') filtered.sort((a,b) => b.price - a.price);

  currentPage = 1;
  renderPage(filtered);
  renderPagination(filtered);
}

fetch(BOOKS_URL).then(r=>{if(!r.ok)throw new Error('books.json load failed');return r.json()}).then(data=>{books=data.map((b,idx)=>({...b,id:b.id||String(idx+1),price:Number(b.price||0)}));categories=[...new Set(books.map(b=>b.category).filter(Boolean))];filtered=[...books];renderCategories();renderPage(filtered);renderPagination(filtered)}).catch(e=>{catalog.innerHTML='<p style="padding:1rem">Failed to load books.json</p>';console.error(e)});

searchEl.addEventListener('input',applyFilters);sortEl.addEventListener('change',applyFilters);document.getElementById('lang').addEventListener('change', applyFilters);


document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.setAttribute('aria-hidden','true')});



