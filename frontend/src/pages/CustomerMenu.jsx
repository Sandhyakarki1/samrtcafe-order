import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingBag, Star, Plus, Minus, Utensils, Pizza, Coffee, Flame, Check, Trash2 } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerMenu() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeItemId, setActiveItemId] = useState(null); 
  const [searchParams] = useSearchParams();
  const table = searchParams.get("table") || "1";
  const navigate = useNavigate();

  const categories = [
    { name: "All", icon: <Utensils size={18}/> },
    { name: "Meals", icon: <Utensils size={18}/> },
    { name: "Snacks", icon: <Pizza size={18}/> },
    { name: "Drinks", icon: <Coffee size={18}/> },
  ];

  useEffect(() => {
    localStorage.setItem("table", table);
    fetch(`${BASE_URL}/api/menu/`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error("Fetch Error:", err));
      
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, [table]);

  // Helper to save cart to state and localStorage
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleAddToCart = (e, item) => {
    if (e) e.stopPropagation();
    if (item.stock <= 0) return alert("Out of stock!");

    const existing = cart.find(i => i.id === item.id);
    let updatedCart;

    if (existing) {
      if (existing.quantity >= item.stock) return alert("No more stock available!");
      updatedCart = cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }
    saveCart(updatedCart);
    setActiveItemId(null); 
  };

  
  const handleRemoveOne = (e, itemId) => {
    if (e) e.stopPropagation();
    const existing = cart.find(i => i.id === itemId);
    
    let updatedCart;
    if (existing.quantity > 1) {
      updatedCart = cart.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    } else {
      updatedCart = cart.filter(i => i.id !== itemId);
    }
    saveCart(updatedCart);
  };

  const filteredMenu = menu.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-[#FFB100] min-h-screen font-sans pb-32" onClick={() => setActiveItemId(null)}>
      {/* 1. HEADER */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <div className="text-white">
            <h1 className="text-3xl font-black leading-tight tracking-tighter">Smart Cafe</h1>
            <p className="text-xs font-bold opacity-90 uppercase tracking-widest text-white/80">Table {table} Menu</p>
          </div>
          <button onClick={() => navigate('/cart')} className="bg-white p-3 rounded-2xl text-orange-500 shadow-xl relative active:scale-95 transition-all">
             <ShoppingBag size={24}/>
             {cartItemCount > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black animate-bounce">
                 {cartItemCount}
               </span>
             )}
          </button>
        </div>

        {/* 2. SEARCH BAR */}
        <div className="relative mb-6">
          <input 
            type="text" placeholder="What are you craving?"
            className="w-full bg-white/95 p-4 pl-12 rounded-2xl outline-none text-slate-800 font-medium shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()} 
          />
          <Search className="absolute left-4 top-4 text-slate-300" size={20}/>
        </div>
      </div>

      {/* WHITE CONTENT AREA */}
      <div className="bg-slate-50 rounded-t-[50px] min-h-screen p-6 shadow-2xl">
        {/* 3. CATEGORIES Slider */}
        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar pt-2">
          {categories.map((cat) => (
            <button 
              key={cat.name} 
              onClick={(e) => { e.stopPropagation(); setActiveCategory(cat.name); }}
              className={`flex flex-col items-center gap-2 min-w-[75px] transition-all ${activeCategory === cat.name ? 'scale-110' : 'opacity-40'}`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${activeCategory === cat.name ? 'bg-[#FFB100] text-white' : 'bg-white text-slate-400'}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* 4. FOOD GRID */}
        <div className="grid grid-cols-2 gap-5">
          {filteredMenu.map((item) => {
            const cartItem = cart.find(i => i.id === item.id);
            const quantityInCart = cartItem ? cartItem.quantity : 0;

            return (
              <div key={item.id} className="bg-white rounded-[35px] p-3 shadow-sm border border-white hover:border-orange-100 transition-all flex flex-col min-h-[220px]">
                
                <div className="w-full aspect-square overflow-hidden rounded-[28px] mb-3 bg-slate-100 shadow-inner relative">
                  <img src={item.image ? `${BASE_URL}${item.image}` : ""} className="w-full h-full object-cover" alt={item.name}/>
                  {quantityInCart > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-in zoom-in">
                      {quantityInCart} added
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1 px-1">{item.name}</h4>
                <p className="text-[9px] text-slate-400 font-medium px-1 mb-2 line-clamp-2 h-6">{item.description || "Freshly prepared"}</p>

                <div className="flex justify-between items-center px-1 mt-auto pb-1">
                  <span className="font-black text-orange-500 text-xs tracking-tighter">Rs {item.price}</span>
                  
                  <div className="relative h-9 flex items-center justify-end">
                    {/* ✅ SHOW COUNTER IF ITEM IS IN CART */}
                    {quantityInCart > 0 ? (
                      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl animate-in fade-in slide-in-from-right-2">
                        <button 
                          onClick={(e) => handleRemoveOne(e, item.id)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 active:scale-90"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-black text-slate-800 w-4 text-center">{quantityInCart}</span>
                        <button 
                          onClick={(e) => handleAddToCart(e, item)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-emerald-600 active:scale-90"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      /* SHOW TRANSFORMING BUTTON IF NOT IN CART */
                      activeItemId === item.id ? (
                        <button 
                          onClick={(e) => handleAddToCart(e, item)}
                          className="bg-emerald-600 text-white px-3 py-2 rounded-xl shadow-lg font-bold text-[9px] uppercase tracking-widest animate-in slide-in-from-right-2 flex items-center gap-1"
                        >
                          Add to Cart <Check size={12} strokeWidth={4}/>
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveItemId(item.id); }}
                          disabled={item.stock === 0}
                          className="w-9 h-9 rounded-xl shadow-lg flex items-center justify-center bg-orange-500 text-white active:scale-90 disabled:bg-gray-200"
                        >
                          <Plus size={18} strokeWidth={3}/>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. FLOATING VIEW CART BUTTON */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-50">
           <button
            onClick={() => navigate('/cart')}
            className="w-full max-w-md mx-auto bg-emerald-600 text-white py-5 rounded-[24px] shadow-2xl font-black flex justify-between items-center px-8 transition-transform active:scale-95"
          >
            <div className="flex items-center gap-3">
               <ShoppingBag size={20}/>
               <div className="text-left leading-tight">
                  <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest">Total Cart</p>
                  <p className="text-sm uppercase tracking-tighter">{cartItemCount} Items</p>
               </div>
            </div>
            <span className="font-black text-xs uppercase tracking-widest">View Order →</span>
          </button>
        </div>
      )}
    </div>
  );
}