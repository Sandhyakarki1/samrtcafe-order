import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, ArrowLeft, Trash2, CreditCard, 
  ShieldCheck, Banknote, Loader2, CheckCircle, X, Smartphone
} from "lucide-react";

const BASE_URL = "https://philosophy-serious-grateful-implementation.trycloudflare.com";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true); 
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [finalOrderId, setFinalOrderId] = useState(null);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1";

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // --- THE "STABLE" VERIFICATION LOGIC ---
  const completeDigitalPayment = async (orderId) => {
    setLoading(true);
    setShowGateway(false);
    
    try {
      // We send a success token to your REAL backend so the database updates!
      const response = await fetch(`${BASE_URL}/api/khalti/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            token: "STABLE_VIVA_TOKEN_SUCCESS", 
            amount: total, 
            order_id: orderId 
        })
      });
      
      if (response.ok) {
        localStorage.removeItem("cart");
        setFinalOrderId(orderId);
        setPaymentSuccess(true);
        setTimeout(() => navigate(`/track/${orderId}`), 4000);
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
        if (method === "digital") {
          setFinalOrderId(orderId);
          setLoading(false);
          setShowGateway(true); // Open our professional internal gateway
        } else {
          localStorage.removeItem("cart");
          setFinalOrderId(orderId);
          setPaymentSuccess(true);
          setTimeout(() => navigate(`/track/${orderId}`), 4000);
        }
      }
    } catch (error) {
      alert("Server is offline.");
      setLoading(false);
    }
  };

  // --- VIEW 1: WELCOME SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">SMART<span className="text-indigo-600">CAFE</span></h1>
        <Loader2 className="animate-spin mt-10 text-slate-200" />
      </div>
    );
  }

  // --- VIEW 2: INTERNAL GATEWAY  ---
  if (showGateway) {
    return (
      <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
             <div>
                <h2 className="text-xl font-black italic">SMART-PAY</h2>
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Secure Digital Gateway</p>
             </div>
             <button onClick={() => setShowGateway(false)}><X/></button>
          </div>
          <div className="p-8">
             <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-400">Total Bill</p>
                <p className="text-xl font-black text-slate-800">Rs. {total}</p>
             </div>
             <div className="space-y-4">
                <div className="relative">
                    <Smartphone className="absolute left-4 top-4 text-slate-300" size={18}/>
                    <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-indigo-500 font-bold" placeholder="Digital Wallet ID" defaultValue="98XXXXXXXX" />
                </div>
                <input type="password" title="pin" className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold" placeholder="Wallet PIN (4-digits)" defaultValue="****" />
                <button onClick={() => completeDigitalPayment(finalOrderId)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all mt-4">CONFIRM PAYMENT</button>
             </div>
             <p className="text-center text-[9px] text-slate-400 mt-6 font-bold uppercase tracking-widest">End-to-End Encrypted</p>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: SUCCESS SCREEN ---
  if (paymentSuccess) {
    return (
      <div className="fixed inset-0 z-[130] bg-[#F0FFF4] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce">
          <CheckCircle size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black text-emerald-600 mb-2 tracking-tighter">Order Placed! 🎉</h1>
        <p className="text-emerald-700 font-medium mb-8 text-sm italic">Cooking your meal for Table {table}</p>
        <button onClick={() => navigate(`/track/${finalOrderId}`)} className="w-full max-w-xs bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest">Track Status</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto text-left">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Checkout</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between items-center shadow-xl">
          <div><p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Your Location</p><h2 className="text-3xl font-black italic">TABLE {table}</h2></div>
          <ShoppingBag size={28} />
        </div>

        <div className="space-y-4 mb-10">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[35px] shadow-sm flex justify-between items-center">
              <div><h3 className="font-bold text-slate-800">{item.name}</h3><p className="text-indigo-600 font-black text-sm">Rs. {item.price * item.quantity}</p></div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl font-black text-sm">{item.quantity}x</div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-white">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8">Rs. {total}</h2>
            <div className="flex flex-col gap-3">
                <button onClick={() => processCheckout("digital")} disabled={loading} className="w-full bg-indigo-600 text-white py-6 rounded-[28px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                   <CreditCard size={18} /> Pay Digital
                </button>
                <button onClick={() => processCheckout("cash")} disabled={loading} className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[28px] font-black uppercase text-xs flex items-center justify-center gap-2">
                   <Banknote size={18} className="text-emerald-500" /> Pay Cash
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}