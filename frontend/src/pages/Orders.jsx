import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Plus, X, ShoppingCart, Utensils, Archive } from 'lucide-react';

//  Use  ngrok link for consistency across all devices
const BASE_URL = "https://nila-irresistible-carmelina.ngrok-free.dev";
const NGROK_HEADER = { "ngrok-skip-browser-warning": "69420" };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState([]);

  useEffect(() => {
    refreshData();
    // Auto-refresh every 10 seconds to see new orders from phones
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const orderRes = await fetch(`${BASE_URL}/api/orders/`, { headers: NGROK_HEADER });
      const orderData = await orderRes.json();
      
      // Sort by ID (Lowest/Oldest first) so first-come is at the top
      const sorted = orderData.sort((a, b) => a.id - b.id);
      setOrders(sorted);

      const menuRes = await fetch(`${BASE_URL}/api/menu/`, { headers: NGROK_HEADER });
      const menuData = await menuRes.json();
      setMenuItems(menuData);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  // Function to move order from Pending to Served
  const handleMarkAsServed = async (orderId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${orderId}/`, {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            ...NGROK_HEADER 
        },
        body: JSON.stringify({ status: "Served" })
      });
      if (res.ok) refreshData();
    } catch (err) {
      alert("Failed to update order status");
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

    const res = await fetch(`${BASE_URL}/api/place-order/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADER },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setIsModalOpen(false);
      setCart([]);
      setTableNumber("");
      refreshData(); 
    }
  };

  // Filter orders for different sections
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const servedOrders = orders.filter(o => o.status === 'Served');

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Live Kitchen Dashboard</h1>
          <p className="text-slate-500 font-medium">Real-time order management</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition-all">
          <Plus size={20} /> New Manual Order
        </button>
      </div>

      {/* --- PENDING ORDERS (Oldest First) --- */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
            <h2 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em]">Live Queue ({pendingOrders.length})</h2>
        </div>
        
        {pendingOrders.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] py-12 text-center text-slate-400 font-bold italic">
                No pending orders. Kitchen is clear!
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pendingOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-[40px] p-8 shadow-sm border-2 border-orange-50 hover:border-orange-200 transition-all relative">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-100">
                            {order.table_number}
                        </div>
                        <div className="text-right">
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {order.status}
                            </span>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase flex items-center justify-end gap-1">
                                <Clock size={12}/> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-3xl p-5 mb-6 border border-slate-100">
                        <p className="text-slate-700 font-bold leading-relaxed italic">
                            {order.items_text || "Items loading..."}
                        </p>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-black text-slate-800">Rs {order.total_price}</div>
                        <button 
                            onClick={() => handleMarkAsServed(order.id)}
                            className="p-3 bg-slate-100 text-slate-300 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all shadow-md active:scale-90"
                            title="Mark as Served"
                        >
                            <CheckCircle size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* --- SERVED HISTORY --- */}
      <div>
        <div className="flex items-center gap-2 mb-6">
            <Archive size={16} className="text-slate-400"/>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recently Served</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-60">
            {servedOrders.slice(0, 8).map(order => (
                <div key={order.id} className="bg-white p-4 rounded-[24px] border border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="font-black text-slate-800 text-sm">Table {order.table_number}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">#{order.id} • Served</p>
                    </div>
                    <div className="text-emerald-500 bg-emerald-50 p-2 rounded-xl">
                        <CheckCircle size={18} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODAL FOR MANUAL ORDER  */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[85vh] flex shadow-2xl relative overflow-hidden">
             <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 z-10"><X size={24}/></button>
             <div className="flex-[1.5] p-8 overflow-y-auto border-r border-slate-100">
               <h2 className="text-xl font-bold mb-6 italic underline decoration-indigo-200">Kitchen Menu</h2>
               <div className="grid grid-cols-2 gap-4">
                 {menuItems.map(item => (
                   <button 
                    key={item.id} onClick={() => addToCart(item)} disabled={item.stock <= 0}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${item.stock <= 0 ? 'bg-slate-50 opacity-40' : 'hover:border-indigo-500 bg-white shadow-sm'}`}
                   >
                     <div className="font-black text-slate-800 uppercase text-xs">{item.name}</div>
                     <div className="text-indigo-600 font-black text-sm mt-1">Rs {item.price}</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase mt-2">Stock: {item.stock}</div>
                   </button>
                 ))}
               </div>
             </div>
             <div className="flex-1 p-8 bg-slate-50 flex flex-col">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 tracking-tighter"><ShoppingCart size={20}/> CHECKOUT</h2>
               <select 
                className="w-full border-2 p-3 rounded-xl mb-6 outline-none focus:border-indigo-500 bg-white font-bold text-sm"
                value={tableNumber} onChange={e => setTableNumber(e.target.value)}
               >
                 <option value="">Select Table...</option>
                 {[1,2,3,4,5].map(n => <option key={n} value={n}>Table {n}</option>)}
               </select>
               <div className="flex-1 overflow-y-auto space-y-3 mb-6">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                     <div className="text-xs font-black text-slate-700 uppercase">{item.name} <span className="text-indigo-500 ml-1">x{item.qty}</span></div>
                     <div className="font-black text-slate-800 text-xs">Rs {item.price * item.qty}</div>
                   </div>
                 ))}
               </div>
               <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 font-black text-[10px] tracking-widest">SUBTOTAL</span>
                    <span className="text-2xl font-black text-slate-800">Rs {cart.reduce((s, i) => s + (i.price * i.qty), 0)}</span>
                  </div>
                  <button onClick={handlePlaceOrder} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all">Store Order</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;