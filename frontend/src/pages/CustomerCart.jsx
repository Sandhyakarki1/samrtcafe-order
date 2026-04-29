import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2, CheckCircle, CreditCard, MessageSquare, Plus, Minus, ShieldCheck, Banknote } from "lucide-react";

const BASE_URL = "https://sorry-moves-characters-genres.trycloudflare.com";

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

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);


  const handleKhaltiPayment = (orderId, amount) => {
  
    const khaltiPaisa = Math.round(amount * 100);

    const config = {
      "publicKey": "test_public_key_dc74e543469e40608040b284e3630f57",
      "productIdentity": orderId.toString(),
      "productName": `SmartCafe Table ${table}`,
      "productUrl": window.location.origin,
      "paymentPreference": ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS"],
      "eventHandler": {
        onSuccess(payload) {
          console.log("Khalti Success:", payload);
          verifyPaymentOnBackend(payload, orderId);
        },
        onError(error) {
          console.error("Khalti Error:", error);
          alert("Khalti Payment Failed. Please check your credentials.");
          setLoading(false);
        },
        onClose() { 
            setLoading(false); 
        }
      }
    };
    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: khaltiPaisa });
  };

  const verifyPaymentOnBackend = async (payload, orderId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/khalti/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            token: payload.token, 
            amount: payload.amount, 
            order_id: orderId 
        })
      });
      if (response.ok) {
        localStorage.removeItem("cart");
        navigate(`/track/${orderId}`);
      } else {
          alert("Server failed to verify payment. Please show your Khalti receipt to staff.");
      }
    } catch (error) { 
        alert("Connection to server lost during verification."); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- COMBINED CHECKOUT LOGIC ---
  const processCheckout = async (method) => {
    if (cart.length === 0) return alert("Your cart is empty!");
    setLoading(true);

    const orderData = {
      table_number: parseInt(table),
      payment_method: method, 
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
        const orderId = data.order_id || data.id;
        
        if (method === 'khalti') {
          handleKhaltiPayment(orderId, total);
        } else {
          // Cash logic
          localStorage.removeItem("cart");
          alert("Order Placed! Please pay Rs. " + total + " at the counter after eating.");
          navigate(`/track/${orderId}`);
        }
      } else {
        alert("Order failed: " + (data.error || "Internal Error"));
        setLoading(false);
      }
    } catch (error) {
      alert("Backend server connection failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all active:scale-90"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Review Order</h1>
          <button onClick={() => syncCart([])} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
        </div>

        {/* Table Banner */}
        <div className="bg-slate-900 rounded-[32px] p-6 text-white mb-8 flex justify-between items-center shadow-xl">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-1 text-left">Your Location</p>
              <h2 className="text-3xl font-black italic">TABLE {table}</h2>
           </div>
           <div className="bg-white/10 p-4 rounded-2xl border border-white/10"><ShoppingBag size={28} /></div>
        </div>

        {/* Cart Items List */}
        <div className="space-y-4 mb-10">
          {cart.map(item => (
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
          ))}
        </div>

        {/* Payment Summary & Buttons */}
        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-white">
            <div className="flex justify-between items-center mb-8 text-left">
              <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Bill</p>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-left">Rs. {total}</h2>
              </div>
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl"><CreditCard size={32}/></div>
            </div>
            
            <div className="flex flex-col gap-3">
                {/* PRIMARY: KHALTI */}
                <button 
                onClick={() => processCheckout('khalti')} 
                disabled={loading} 
                className="w-full bg-[#5C2D91] text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#4a2475] transition-all active:scale-95 disabled:bg-slate-200 flex flex-col items-center justify-center gap-1 text-sm"
                >
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>{loading ? "CHECKING OUT..." : "Pay with Khalti"}</span>
                </div>
                {!loading && <span className="text-[10px] opacity-60 font-medium">Fast Digital Payment</span>}
                </button>

                {/* SECONDARY: CASH */}
                <button 
                onClick={() => processCheckout('cash')} 
                disabled={loading} 
                className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[28px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                <Banknote size={18} className="text-emerald-500" />
                Pay with Cash
                </button>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">SmartCafe Checkout System</p>
          </div>
        )}
      </div>
    </div>
  );
}