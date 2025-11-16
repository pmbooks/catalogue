const BOOKS_URL='books.json';
let books=[];
const catalog=document.getElementById('catalog');
const search=document.getElementById('search');
document.getElementById('year').textContent=new Date().getFullYear();

function render(list){catalog.innerHTML='';list.forEach(b=>{
 const el=document.createElement('div');
 el.className='card';
 el.innerHTML=`<img src="${b.image}"><div class="title">${b.title}</div><div class="author">${b.author}</div><div class="price-box"><div class="price-tag">₹${b.price}</div></div>`;
 catalog.appendChild(el);
});}

fetch(BOOKS_URL).then(r=>r.json()).then(d=>{books=d;render(books)});
search.oninput=()=>{const q=search.value.toLowerCase();render(books.filter(b=>(b.title+b.author).toLowerCase().includes(q)))}

/* ===== books.json sample ===== */
[
 {"title":"Amazing Hanuman","author":"Pranabananda","price":199,"image":"https://via.placeholder.com/400x600?text=Hanuman"},
 {"title":"Hamsa Gita","author":"Paramahamsa","price":150,"image":"https://via.placeholder.com/400x600?text=Gita"},
 {"title":"Navaratri Worship","author":"Paramahamsa","price":120,"image":"https://via.placeholder.com/400x600?text=Navaratri"}
]
