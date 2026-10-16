const products = [
  {id:1,name:'Sérum Glow Vitamina C',category:'skincare',categoryLabel:'Skincare',description:'Luminosidade e viço para todos os dias.',price:89.90,badge:'Mais amado',rating:'4.9',reviews:128,image:'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=85'},
  {id:2,name:'Blush Cremoso Rosé',category:'maquiagem',categoryLabel:'Maquiagem',description:'Um toque de cor com acabamento natural.',price:54.90,badge:'Queridinho',rating:'4.8',reviews:86,image:'https://images.unsplash.com/photo-1583241800698-e8ab01830a5f?auto=format&fit=crop&w=800&q=85'},
  {id:3,name:'Hidratante Nuvem',category:'skincare',categoryLabel:'Skincare',description:'Hidratação leve com toque aveludado.',price:72.00,badge:'',rating:'4.9',reviews:102,image:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85'},
  {id:4,name:'Óleo Corporal Âmbar',category:'corpo',categoryLabel:'Corpo & banho',description:'Nutrição e perfume delicado na pele.',price:64.90,badge:'Novo',rating:'4.7',reviews:54,image:'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=85'},
  {id:5,name:'Bálsamo Labial Cereja',category:'maquiagem',categoryLabel:'Maquiagem',description:'Lábios macios com brilho suave.',price:32.90,badge:'',rating:'4.8',reviews:76,image:'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=85'},
  {id:6,name:'Espuma de Limpeza',category:'skincare',categoryLabel:'Skincare',description:'Limpeza gentil para uma pele fresquinha.',price:49.90,badge:'Essencial',rating:'4.9',reviews:94,image:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=85'},
  {id:7,name:'Creme de Mãos Flor de Algodão',category:'corpo',categoryLabel:'Corpo & banho',description:'Cuidado diário com aroma confortável.',price:39.90,badge:'',rating:'4.7',reviews:43,image:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85'},
  {id:8,name:'Máscara Noite de Seda',category:'skincare',categoryLabel:'Skincare',description:'Um ritual noturno de maciez e conforto.',price:96.00,badge:'Ritual noturno',rating:'5.0',reviews:61,image:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=85'}
];

const money = value => value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
let activeCategory = 'todos';
let searchTerm = '';
let cart = {};
try { cart = JSON.parse(localStorage.getItem('lumiereCart') || '{}') || {}; } catch { cart = {}; }
let toastTimer;

const grid = document.getElementById('productGrid');
const noResults = document.getElementById('noResults');
const searchInput = document.getElementById('searchInput');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');

function renderProducts(){
  let list = products.filter(p => (activeCategory === 'todos' || p.category === activeCategory) && `${p.name} ${p.categoryLabel} ${p.description}`.toLocaleLowerCase('pt-BR').includes(searchTerm.toLocaleLowerCase('pt-BR')));
  const sort = document.getElementById('sortSelect').value;
  if(sort === 'low') list.sort((a,b)=>a.price-b.price);
  else if(sort === 'high') list.sort((a,b)=>b.price-a.price);
  else if(sort === 'name') list.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  grid.innerHTML = list.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'">
        <button class="quick-add" type="button" data-add="${p.id}">＋ Adicionar à sacola</button>
      </div>
      <div class="product-info"><div><div class="product-category">${p.categoryLabel}</div><h3 class="product-name">${p.name}</h3><p class="product-description">${p.description}</p><div class="rating">★★★★★ <span>${p.rating} (${p.reviews})</span></div></div><div class="product-price">${money(p.price)}</div></div>
    </article>`).join('');
  noResults.hidden = list.length > 0;
  grid.hidden = list.length === 0;
}

function saveCart(){
  try { localStorage.setItem('lumiereCart', JSON.stringify(cart)); } catch {}
}
function cartQuantity(){return Object.values(cart).reduce((sum,q)=>sum+q,0);}
function cartTotal(){return Object.entries(cart).reduce((sum,[id,q])=>sum+(products.find(p=>p.id===Number(id))?.price||0)*q,0);}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();renderCart();showToast(`${products.find(p=>p.id===id).name} adicionado à sacola ♡`);}
function updateQuantity(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];saveCart();renderCart();}
function removeFromCart(id){delete cart[id];saveCart();renderCart();showToast('Produto removido da sacola.');}
function renderCart(){
  const qty=cartQuantity(),total=cartTotal();
  document.getElementById('cartCount').textContent=qty;
  document.getElementById('cartTitleCount').textContent=`(${qty})`;
  cartEmpty.style.display=qty===0?'block':'none';
  cartFooter.style.display=qty===0?'none':'block';
  cartItems.style.display=qty===0?'none':'block';
  cartItems.innerHTML=Object.entries(cart).map(([id,q])=>{
    const p=products.find(item=>item.id===Number(id));if(!p)return '';
    return `<div class="cart-line"><img src="${p.image}" alt="${p.name}"><div class="cart-line-info"><strong>${p.name}</strong><small>${p.categoryLabel}</small><div class="quantity-controls"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span>${q}</span><button type="button" data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${p.name}">＋</button></div></div><div class="cart-line-right"><strong>${money(p.price*q)}</strong><button class="remove-item" type="button" data-remove="${p.id}">Remover</button></div></div>`;
  }).join('');
  document.getElementById('cartSubtotal').textContent=money(total);
  const remaining=Math.max(0,199-total);
  document.getElementById('shippingMessage').textContent=remaining===0?'Parabéns! Você ganhou frete grátis ♡':`Faltam ${money(remaining)} para ganhar frete grátis`;
  document.getElementById('shippingProgress').style.width=`${Math.min(100,total/199*100)}%`;
}
function openCart(){cartDrawer.classList.add('open');overlay.classList.add('visible');cartDrawer.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll');document.getElementById('cartClose').focus();}
function closeCart(){cartDrawer.classList.remove('open');overlay.classList.remove('visible');cartDrawer.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll');}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);}
function setCategory(category){activeCategory=category;document.querySelectorAll('.filter-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===category));document.querySelectorAll('[data-category-link]').forEach(link=>link.classList.toggle('active',link.dataset.categoryLink===category));renderProducts();}

grid.addEventListener('click',e=>{const button=e.target.closest('[data-add]');if(button)addToCart(Number(button.dataset.add));});
document.querySelector('.filter-list').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn)setCategory(btn.dataset.filter);});
document.querySelectorAll('[data-category-link]').forEach(link=>link.addEventListener('click',()=>{setCategory(link.dataset.categoryLink);document.getElementById('mainNav').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');}));
searchInput.addEventListener('input',()=>{searchTerm=searchInput.value;renderProducts();});
document.getElementById('searchForm').addEventListener('submit',e=>{e.preventDefault();document.getElementById('produtos').scrollIntoView({behavior:'smooth'});});
document.getElementById('sortSelect').addEventListener('change',renderProducts);
document.getElementById('clearFilters').addEventListener('click',()=>{searchTerm='';searchInput.value='';document.getElementById('sortSelect').value='featured';setCategory('todos');});
document.getElementById('cartOpen').addEventListener('click',openCart);
document.getElementById('cartClose').addEventListener('click',closeCart);
document.getElementById('continueShopping').addEventListener('click',closeCart);
overlay.addEventListener('click',closeCart);
cartItems.addEventListener('click',e=>{const qty=e.target.closest('[data-qty]');const remove=e.target.closest('[data-remove]');if(qty)updateQuantity(Number(qty.dataset.qty),Number(qty.dataset.delta));if(remove)removeFromCart(Number(remove.dataset.remove));});
document.getElementById('checkoutButton').addEventListener('click',()=>{showToast('Demonstração: conecte um meio de pagamento para concluir pedidos.');});
document.getElementById('menuToggle').addEventListener('click',()=>{const nav=document.getElementById('mainNav');const open=nav.classList.toggle('open');document.getElementById('menuToggle').setAttribute('aria-expanded',String(open));document.getElementById('menuToggle').setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
document.getElementById('newsletterForm').addEventListener('submit',e=>{e.preventDefault();const input=document.getElementById('emailInput');if(input.checkValidity()){showToast('Obrigada por fazer parte da comunidade Lumière! ♡');input.value='';}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();document.getElementById('mainNav').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');}});
document.getElementById('currentYear').textContent=new Date().getFullYear();
renderProducts();renderCart();
