/*
 - BOOKS_URL: change this to your github-hosted books.json or published Google Sheets JSON URL
 - The code loads the JSON, extracts categories, renders category pills, supports search, sort, pagination
 - Buy Now button navigates to book.detail_link (you can replace with payment link)
 - Prices are formatted using Indian number grouping
*/

const BOOKS_URL = 'books.json'; // replace with your published Google Sheets JSON if needed
const PER_PAGE = 9;
let books = [], filtered = [], categories = [], currentPage = 1;

const catalog = document.getElementById('catalog');
const searchEl = document.getElementById('search');
const sortEl = document.getElementById('sort');
const catRow = document.getElementById('category-row');
const pagination = document.getElementById('pagination');

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

function renderCards(list){
  catalog.innerHTML = '';
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = list.slice(start, start + PER_PAGE);
  pageItems.forEach(b => {
    const div = document.createElement('div'); div.className = 'card';
    div.innerHTML = '<img src="'+(b.image||'https://via.placeholder.com/400x600?text=No+Image')+'" alt="'+(b.title||'')+'">'
      + '<div class="card-body">'
      + '<div class="title">'+(b.title||'Untitled')+'</div>'
      + '<div class="author">'+(b.author||'')+'</div>'
      + '<div class="price-row">'
      + '<div class="price">'+formatINR(b.price||0)+'</div>'
      + '<button class="buy" onclick="window.location.href=\''+(b.detail_link||'#')+'\'">Buy Now</button>'
      + '</div></div>';
    catalog.appendChild(div);
  });
}

function renderPagination(list){
  pagination.innerHTML = '';
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  for(let i = 1; i <= pages; i++){
    const b = document.createElement('button');
    b.className = 'page-btn' + (i === currentPage ? ' active' : '');
    b.textContent = i; b.onclick = () => { currentPage = i; renderCards(filtered); renderPagination(filtered); window.scrollTo({top:0,behavior:'smooth'}); };
    pagination.appendChild(b);
  }
}

function renderCategories(){
  catRow.innerHTML = '';
  const allPill = document.createElement('div'); allPill.className = 'pill active'; allPill.textContent = 'All';
  allPill.onclick = () => { document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active')); allPill.classList.add('active'); searchEl.value=''; applyFilters(); };
  catRow.appendChild(allPill);
  categories.forEach(c => {
    const p = document.createElement('div'); p.className = 'pill'; p.textContent = c || 'Uncategorized';
    p.onclick = () => { document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active')); p.classList.add('active'); searchEl.value = c; applyFilters(); };
    catRow.appendChild(p);
  });
}

function applyFilters(){
  const q = (searchEl.value || '').toLowerCase();
  filtered = books.filter(b => ((b.title||'') + ' ' + (b.author||'') + ' ' + (b.category||'')).toLowerCase().includes(q));
  const sortVal = sortEl.value;
  if(sortVal === 'title') filtered.sort((a,b) => (a.title||'').localeCompare(b.title||''));
  if(sortVal === 'price_low') filtered.sort((a,b) => (a.price||0) - (b.price||0));
  if(sortVal === 'price_high') filtered.sort((a,b) => (b.price||0) - (a.price||0));
  currentPage = 1; renderCards(filtered); renderPagination(filtered);
}

fetch(BOOKS_URL).then(r => { if(!r.ok) throw new Error('Failed to load books.json'); return r.json(); }).then(data => {
  books = data.map((b, idx) => ({ id: b.id || idx+1, title: b.title || 'Untitled', author: b.author || '', category: b.category || '', price: Number(b.price) || 0, image: b.image || 'https://via.placeholder.com/400x600?text=No+Image', detail_link: b.detail_link || '#' }));
  categories = [...new Set(books.map(b => b.category).filter(Boolean))];
  filtered = [...books]; renderCategories(); renderCards(filtered); renderPagination(filtered);
}).catch(err => { console.error(err); catalog.innerHTML = '<p style="padding:1rem">Failed to load book data. Please check books.json or BOOKS_URL.</p>'; });

searchEl.addEventListener('input', () => { applyFilters(); });
sortEl.addEventListener('change', () => { applyFilters(); });
