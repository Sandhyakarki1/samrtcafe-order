import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, ArrowLeft, Trash2, CreditCard, 
  ShieldCheck, Banknote, Loader2, CheckCircle, X, Smartphone, Lock
} from "lucide-react";

const BASE_URL = "https://philosophy-serious-grateful-implementation.trycloudflare.com";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true); 
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showEsewaModal, setShowEsewaModal] = useState(false); // eSewa Mock State
  const [finalOrderId, setFinalOrderId] = useState(null);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1";

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // --- MOCK ESEWA VERIFICATION ---
  const completeEsewaPayment = async () => {
    setLoading(true);
    setShowEsewaModal(false);
    
    try {
      // Still talks to REAL Django backend to update the status to 'Paid'
      const response = await fetch(`${BASE_URL}/api/khalti/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            token: "ESEWA_MOCK_SUCCESS_TOKEN", 
            amount: total, 
            order_id: finalOrderId 
        })
      });
      
      if (response.ok) {
        localStorage.removeItem("cart");
        setPaymentSuccess(true);
        // Move to tracking after 4 seconds
        setTimeout(() => navigate(`/track/${finalOrderId}`), 4000);
      }
    } catch (error) {
      alert("Verification error.");
    } finally { setLoading(false); }
  };

  const processCheckout = async (method) => {
    if (cart.length === 0) return alert("Cart is empty!");
    setLoading(true);

    const orderData = {
      table_number: parseInt(table),
      payment_method: method,
      items: cart.map(item => ({ id: item.id, qty: item.quantity || 1 }))
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
        setFinalOrderId(orderId);
        if (method === "esewa") {
          setLoading(false);
          setShowEsewaModal(true); // Open the Green eSewa Mock
        } else {
          localStorage.removeItem("cart");
          setPaymentSuccess(true);
          setTimeout(() => navigate(`/track/${orderId}`), 4000);
        }
      }
    } catch (error) {
      alert("Backend offline.");
      setLoading(false);
    }
  };

  // --- 1. WELCOME SPLASH ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-slate-800">SMART<span className="text-emerald-600">CAFE</span></h1>
        <Loader2 className="animate-spin mt-10 text-slate-200" />
      </div>
    );
  }

  // --- 2. MOCK ESEWA GATEWAY (Green UI) ---
  if (showEsewaModal) {
    return (
      <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          {/* eSewa Header */}
          <div className="bg-[#60bb46] p-6 text-white flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="bg-white p-1 rounded-lg">
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="esewa" className="h-6" />
                </div>
                <span className="font-bold text-sm uppercase tracking-wider">Secure Login</span>
             </div>
             <button onClick={() => setShowEsewaModal(false)}><X size={20}/></button>
          </div>
          
          <div className="p-8">
             <p className="text-center text-slate-500 text-xs mb-6 font-medium">Log in to your eSewa account to pay <span className="font-bold text-slate-800">Rs. {total}</span></p>
             
             <div className="space-y-4">
                <div className="relative">
                    <Smartphone className="absolute left-4 top-4 text-slate-300" size={18}/>
                    <input type="text" className="w-full border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:border-[#60bb46]" placeholder="eSewa ID (Mobile Number)" defaultValue="9841005210" />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-4 text-slate-300" size={18}/>
                    <input type="password" title="password" className="w-full border border-slate-200 p-4 pl-12 rounded-xl outline-none focus:border-[#60bb46]" placeholder="Password / MPIN" defaultValue="****" />
                </div>
                
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <input type="checkbox" checked readOnly className="accent-[#60bb46] w-4 h-4" />
                    <span className="text-[11px] text-slate-500 font-bold uppercase">I am not a robot</span>
                </div>

                <button 
                  onClick={completeEsewaPayment} 
                  className="w-full bg-[#60bb46] hover:bg-[#52a43b] text-white py-4 rounded-xl font-black shadow-lg transition-all active:scale-95 mt-4"
                >
                    LOGIN & PAY
                </button>
             </div>
             <p className="text-center text-[10px] text-slate-400 mt-8 uppercase font-bold tracking-tighter">Powered by eSewa Fonepay Pvt. Ltd.</p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. SUCCESS SCREEN ---
  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-[130] bg-[#F0FFF4] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-emerald-600 mb-2">Payment Successful! 🎉</h1>
        <p className="text-emerald-700 font-medium mb-8">Your order has been placed successfully.</p>
        <div className="w-full max-w-xs flex flex-col gap-3">
            <button onClick={() => navigate(`/track/${finalOrderId}`)} className="bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-xs">Track My Order</button>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest animate-pulse">Redirecting to tracking page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><ArrowLeft size={24}/></button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Review Order</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between items-center shadow-xl">
          <div><p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Table Location</p><h2 className="text-3xl font-black italic">TABLE {table}</h2></div>
          <ShoppingBag size={28} />
        </div>

        <div className="space-y-4 mb-10">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[35px] shadow-sm flex justify-between items-center border border-white">
              <div><h3 className="font-bold text-slate-800">{item.name}</h3><p className="text-emerald-600 font-black text-sm">Rs. {item.price * item.quantity}</p></div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl font-black text-sm">{item.quantity}x</div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-white">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">Rs. {total}</h2>
            <div className="flex flex-col gap-3">
                <button onClick={() => processCheckout("esewa")} disabled={loading} className="w-full bg-[#60bb46] text-white py-6 rounded-[28px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                   <ShieldCheck size={20} /> Pay with eSewa
                </button>
                <button onClick={() => processCheckout("cash")} disabled={loading} className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[28px] font-black uppercase text-xs flex items-center justify-center gap-2">
                   <Banknote size={18} className="text-emerald-500" /> Cash Payment
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}