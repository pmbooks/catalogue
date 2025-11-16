const BOOKS_URL="books.json";
let books=[],filtered=[],categories=[];let currentPage=1;const perPage=9;
const catalog=document.getElementById("catalog"),search=document.getElementById("search"),sort=document.getElementById("sort"),catRow=document.getElementById("category-row"),pagination=document.getElementById("pagination")
document.getElementById("year").textContent=new Date().getFullYear()

function paginate(list){return list.slice((currentPage-1)*perPage,currentPage*perPage)}
function renderPagination(list){pagination.innerHTML="";let pages=Math.ceil(list.length/perPage)
 for(let i=1;i<=pages;i++){let b=document.createElement("button");b.className="page-btn"+(i===currentPage?" active":"");b.textContent=i;b.onclick=()=>{currentPage=i;renderAll()};pagination.appendChild(b)}}
function renderCategories(){catRow.innerHTML="";categories.forEach(c=>{let p=document.createElement("div");p.className="category-pill";p.textContent=c;p.onclick=()=>{document.querySelectorAll('.category-pill').forEach(x=>x.classList.remove('active'));p.classList.add('active');filter.value='category';search.value=c;applyFilters();};catRow.appendChild(p)})}
function render(list){catalog.innerHTML="";paginate(list).forEach(b=>{let c=document.createElement("div");c.className="card";c.innerHTML=`<img src="${b.image}"><div class="card-body"><div class="card-title">${b.title}</div><div class="card-author">${b.author||""}</div><div class="price-box"><span class="price">₹${b.price}</span></div><button class="buy-btn" onclick="window.location.href='${b.detail_link}'">Buy Now</button></div>`;catalog.appendChild(c)})}
function applyFilters(){let q=search.value.toLowerCase();filtered=books.filter(b=>(b.title+b.author+(b.category||"")) .toLowerCase().includes(q));if(sort.value==="title")filtered.sort((a,b)=>a.title.localeCompare(b.title));if(sort.value==="price_low")filtered.sort((a,b)=>a.price-b.price);if(sort.value==="price_high")filtered.sort((a,b)=>b.price-a.price);currentPage=1;renderAll()}
function renderAll(){render(filtered);renderPagination(filtered)}

fetch(BOOKS_URL).then(r=>r.json()).then(d=>{books=d;filtered=d;categories=[...new Set(d.map(b=>b.category))];renderCategories();renderAll()})
search.oninput=applyFilters;sort.onchange=applyFilters
