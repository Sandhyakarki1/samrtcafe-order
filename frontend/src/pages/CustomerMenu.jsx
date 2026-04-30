import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; 
import { Search, ShoppingBag, Plus, Minus, Utensils, Pizza, Coffee, Check, Flame } from "lucide-react";


const BASE_URL = "https://bless-volleyball-metals-decimal.trycloudflare.com ";

export default function CustomerMenu() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeItemId, setActiveItemId] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const { tableId } = useParams(); 
  const table = tableId || "1"; 
  const navigate = useNavigate();

  const categories = [{ name: "All", icon: <Utensils size={18}/> }, { name: "Meals", icon: <Utensils size={18}/> }, { name: "Snacks", icon: <Pizza size={18}/> }, { name: "Drinks", icon: <Coffee size={18}/> }];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.includes("http")) return imagePath.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, BASE_URL);
    return `${BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    localStorage.setItem("table", table);
    setLoading(true);
    
    fetch(`${BASE_URL}/api/menu/`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
      
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
    
    const closeButtons = () => setActiveItemId(null);
    window.addEventListener('click', closeButtons);
    return () => window.removeEventListener('click', closeButtons);
  }, [table]);

  const handleAddToCart = (e, item) => {
    if (e) e.stopPropagation();
    if (item.stock <= 0) return alert("Out of stock!");
    const existing = cart.find(i => i.id === item.id);
    let updated = existing 
      ? cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...item, quantity: 1, note: "" }];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setActiveItemId(null); 
  };

  const handleRemoveOne = (e, itemId) => {
    if (e) e.stopPropagation();
    const existing = cart.find(i => i.id === itemId);
    let updated = existing.quantity > 1 
      ? cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
      : cart.filter(i => i.id !== itemId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const filteredMenu = menu.filter(i => (activeCategory === "All" || i.category === activeCategory) && i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-[#FFB100] min-h-screen font-sans pb-32">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-3xl font-black">Smart Cafe</h1>
            <p className="text-xs font-bold opacity-80 uppercase tracking-widest text-white/80">Table {table} Menu</p>
          </div>
          <button onClick={() => navigate('/cart')} className="bg-white p-3 rounded-2xl text-orange-500 shadow-xl relative active:scale-95 transition-all">
             <ShoppingBag size={24}/>
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black animate-bounce">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
          </button>
        </div>
        <div className="relative mb-6">
          <input type="text" placeholder="Search delicious food..." className="w-full bg-white/95 p-4 pl-12 rounded-2xl outline-none shadow-inner" value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()}/>
          <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
        </div>
      </div>

      <div className="bg-slate-50 rounded-t-[50px] min-h-screen p-6 shadow-2xl">
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar">
          {categories.map((cat) => (
            <button key={cat.name} onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.name); }} className={`flex flex-col items-center gap-2 min-w-[75px] transition-all ${activeCategory === cat.name ? 'scale-110' : 'opacity-40'}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeCategory === cat.name ? 'bg-[#FFB100] text-white' : 'bg-white text-slate-400'}`}>{cat.icon}</div>
              <span className="text-[10px] font-black uppercase text-slate-600">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5">
          {loading ? <div className="col-span-2 text-center py-10 italic">Loading Menu...</div> : 
           filteredMenu.map((item) => {
            const cartItem = cart.find(c => c.id === item.id);
            const qty = cartItem ? cartItem.quantity : 0;
            return (
            <div key={item.id} className="bg-white rounded-[35px] p-3 shadow-sm border border-white hover:border-orange-100 flex flex-col min-h-[220px] transition-all relative overflow-hidden">
              <div className="w-full aspect-square overflow-hidden rounded-[28px] mb-3 relative">
                <img src={getImageUrl(item.image)} onError={(e) => e.target.src="https://via.placeholder.com/150"} className="w-full h-full object-cover" alt={item.name}/>
                {qty > 0 && <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg">{qty} added</div>}
              </div>
              <h4 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1">{item.name}</h4>
              <p className="text-[9px] text-slate-400 font-medium mb-2 line-clamp-2 h-6">{item.description || "Freshly prepared"}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="font-black text-orange-500 text-xs">Rs {item.price}</span>
                <div className="relative h-9 flex items-center">
                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button onClick={(e) => handleRemoveOne(e, item.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm"><Minus size={14} /></button>
                      <span className="text-xs font-black text-slate-800 w-3 text-center">{qty}</span>
                      <button onClick={(e) => handleAddToCart(e, item)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm"><Plus size={14} /></button>
                    </div>
                  ) : activeItemId === item.id ? (
                    <button onClick={(e) => handleAddToCart(e, item)} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase">Add</button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setActiveItemId(item.id); }} disabled={item.stock === 0} className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center active:scale-90 disabled:bg-gray-200"><Plus size={18}/></button>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
      {cart.length > 0 && <div className="fixed bottom-6 left-0 right-0 px-6 z-50 animate-in slide-in-from-bottom-4"><button
       onClick={() => navigate('/cart')} className="w-full max-w-md mx-auto bg-emerald-600 text-white py-5 rounded-[24px] shadow-2xl font-black flex justify-between items-center px-8 transition-transform active:scale-95">
        <span>{cart.reduce((a,b)=>a+b.quantity, 0)} Items</span><span>View Order →</span></button></div>}
    </div>
  );
}