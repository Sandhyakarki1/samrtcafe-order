import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2, CheckCircle, CreditCard, MessageSquare, Plus, Minus } from "lucide-react";


const BASE_URL = "https://presence-clarke-collectables-working.trycloudflare.com";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1";

  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateQuantity = (id, delta) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    syncCart(updated);
  };

  const updateNote = (id, note) => {
    const updated = cart.map(item => item.id === id ? { ...item, note } : item);
    syncCart(updated);
  };

  const removeItem = (id) => {
    const updated = cart.filter(item => item.id !== id);
    syncCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    setLoading(true);

    const orderData = {
      table_number: parseInt(table),
      items: cart.map(item => ({
        id: item.id,
        qty: item.quantity || 1,
        instructions: item.note || "" 
      }))
    };

    try {
      
      const response = await fetch(`${BASE_URL}/api/place-order/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("cart"); 
        navigate(`/track/${data.order_id || data.id}`); 
      } else {
        alert("Order failed: " + (data.error || "Stock issue"));
      }
    } catch (error) {
      alert("Backend server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all active:scale-90"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Review Order</h1>
          <button onClick={() => syncCart([])} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
        </div>

        <div className="bg-slate-900 rounded-[32px] p-6 text-white mb-8 flex justify-between items-center shadow-xl">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-1">Your Location</p>
              <h2 className="text-3xl font-black italic">TABLE {table}</h2>
           </div>
           <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><ShoppingBag size={28} /></div>
        </div>

        <div className="space-y-4 mb-10">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100"><p className="text-slate-300 font-bold italic">No items picked yet.</p></div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white rounded-[35px] p-5 shadow-sm border border-white flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-indigo-600 font-black text-sm text-right">Rs. {item.price * (item.quantity || 1)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-slate-500">-</button>
                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-emerald-500">+</button>
                  </div>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Special instructions..." className="w-full bg-slate-50 border-none rounded-xl p-3 pl-10 text-[11px] font-medium outline-none" value={item.note || ""} onChange={(e) => updateNote(item.id, e.target.value)} />
                  <MessageSquare size={14} className="absolute left-3.5 top-3.5 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-white">
            <div className="flex justify-between items-center mb-8">
              <div><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Bill</p><h2 className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {total}</h2></div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><CreditCard size={32}/></div>
            </div>
            <button onClick={placeOrder} disabled={loading} className="w-full bg-[#111] text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-3 text-sm">
              {loading ? "SENDING TO KITCHEN..." : "Place Order Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}