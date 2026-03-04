import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, Plus, Minus, X, ShoppingCart, Utensils } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState([]);

  // This runs every time you open the page
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      // 1. Fetching the "Stored" orders from Django
      const orderRes = await fetch("http://127.0.0.1:8000/api/orders/");
      const orderData = await orderRes.json();
      setOrders(orderData); // This updates your screen with backend data

      // 2. Fetching latest Menu (to check stock)
      const menuRes = await fetch("http://127.0.0.1:8000/api/menu/");
      const menuData = await menuRes.json();
      setMenuItems(menuData);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      if (existing.qty >= item.stock) return alert("Out of stock!");
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      if (item.stock <= 0) return alert("Out of stock!");
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!tableNumber || cart.length === 0) return alert("Select table and items!");

    const payload = {
      table_number: parseInt(tableNumber),
      items: cart.map(i => ({ id: i.id, qty: i.qty }))
    };

    const res = await fetch("http://127.0.0.1:8000/api/place-order/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Order Stored in Backend!");
      setIsModalOpen(false);
      setCart([]);
      setTableNumber("");
      refreshData(); // 🔥 IMPORTANT: This tells React to go get the new data from Django
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Orders</h1>
          <p className="text-gray-500 text-sm">Showing data synced from Django Database</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-100 transition-transform active:scale-95">
          <Plus size={20} /> Take New Order
        </button>
      </div>

      {/* THE LIVE LIST (Fetched from Backend) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:border-indigo-500 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">
                  {order.table_number}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Order #{order.id}</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase">
                    <Clock size={10}/> {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {order.status}
              </span>
            </div>

            {/* HERE IS THE QUANTITY DATA STORED FROM BACKEND */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Items Summary</p>
              <p className="text-sm text-slate-700 font-bold leading-relaxed text-center italic">
                {order.items_text || "No items recorded"}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="text-2xl font-black text-slate-800">Rs {order.total_price}</div>
              <button className="p-2 text-slate-200 hover:text-emerald-500 transition-colors">
                <CheckCircle size={28} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FOR NEW ORDER */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[85vh] flex shadow-2xl relative overflow-hidden">
             <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10"><X size={24}/></button>
             
             {/* LEFT SIDE: MENU */}
             <div className="flex-[1.5] p-8 overflow-y-auto border-r border-slate-100">
               <h2 className="text-xl font-bold mb-6">Choose Items</h2>
               <div className="grid grid-cols-2 gap-4">
                 {menuItems.map(item => (
                   <button 
                    key={item.id} onClick={() => addToCart(item)} disabled={item.stock <= 0}
                    className={`p-4 rounded-2xl border text-left transition-all ${item.stock <= 0 ? 'bg-slate-50 opacity-40' : 'hover:border-indigo-500 bg-white shadow-sm'}`}
                   >
                     <div className="font-bold text-slate-800">{item.name}</div>
                     <div className="text-indigo-600 font-bold text-sm">Rs {item.price}</div>
                     <div className="text-[10px] text-slate-400 uppercase mt-1">Available: {item.stock}</div>
                   </button>
                 ))}
               </div>
             </div>

             {/* RIGHT SIDE: TABLE & CART */}
             <div className="flex-1 p-8 bg-slate-50 flex flex-col">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ShoppingCart size={20}/> Checkout</h2>
               
               {/* RESTRICTED TO 5 TABLES */}
               <label className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-1">Select Table</label>
               <select 
                className="w-full border-2 p-3 rounded-xl mb-6 outline-none focus:border-indigo-500 bg-white font-bold"
                value={tableNumber} onChange={e => setTableNumber(e.target.value)}
               >
                 <option value="">Choose...</option>
                 {[1,2,3,4,5].map(n => <option key={n} value={n}>Table {n}</option>)}
               </select>

               {/* CART ITEMS WITH QUANTITIES */}
               <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                     <div className="text-sm font-bold text-slate-700">{item.name} <span className="text-indigo-500 ml-1">x{item.qty}</span></div>
                     <div className="font-bold text-slate-800">Rs {item.price * item.qty}</div>
                   </div>
                 ))}
               </div>

               <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 font-bold text-xs">TOTAL</span>
                    <span className="text-2xl font-black text-slate-800">Rs {cart.reduce((s, i) => s + (i.price * i.qty), 0)}</span>
                  </div>
                  <button onClick={handlePlaceOrder} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-50 hover:bg-emerald-700 transition-all">Confirm Order</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;