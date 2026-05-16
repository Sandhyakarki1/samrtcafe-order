import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { 
  ShoppingBag, ArrowLeft, Trash2, CreditCard, 
  ShieldCheck, Banknote, Loader2 
} from "lucide-react";


const BASE_URL = "https://philosophy-serious-grateful-implementation.trycloudflare.com";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(true); 
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1";

  // --- WELCOME SPLASH TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // --- ESEWA PAYMENT LOGIC  ---
  const handleEsewaPayment = (orderId, amount) => {
    if (!orderId) return alert("Order ID missing");

    // UNIQUE UUID for every request
    const transaction_uuid = `${orderId}-${Date.now()}`;
    const product_code = "EPAYTEST";
    const secret = "8gBm/:&EnhH.1/q";
    
    // FORMAT: total_amount,transaction_uuid,product_code 
    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const formData = {
      amount: amount,
      tax_amount: 0,
      total_amount: amount,
      transaction_uuid: transaction_uuid,
      product_code: product_code,
      product_service_charge: 0,
      product_delivery_charge: 0,
      // Success will redirect to the PaymentSuccess page
      success_url: `${window.location.origin}/payment-success/${orderId}`,
      failure_url: `${window.location.origin}/payment-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.keys(formData).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // --- CHECKOUT LOGIC ---
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
        localStorage.removeItem("cart"); // Clear local cart
        
        if (method === "esewa") {
          handleEsewaPayment(orderId, total);
        } else {
          // Cash users go directly to live tracking
          alert("Order Placed! Please pay after your meal.");
          navigate(`/track/${orderId}`);
        }
      } else {
        alert("Failed to create order. Check backend console.");
        setLoading(false);
      }
    } catch (error) {
      alert("Backend server connection failed.");
      setLoading(false);
    }
  };

  // --- VIEW 1: WELCOME SCREEN ---
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center font-sans animate-in fade-in duration-500">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-slate-800">SMART<span className="text-emerald-600">CAFE</span></h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Welcome to Table {table}</p>
        <Loader2 className="animate-spin mt-10 text-slate-200" size={20} />
      </div>
    );
  }

  // --- VIEW 2: CART UI ---
  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm text-slate-400 active:scale-90 transition-all"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Review Order</h1>
          <button onClick={() => syncCart([])} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
        </div>

        {/* Table Banner */}
        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between items-center shadow-xl">
          <div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Your Location</p>
            <h2 className="text-3xl font-black italic">TABLE {table}</h2>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner"><ShoppingBag size={28} /></div>
        </div>

        {/* Items List */}
        <div className="space-y-4 mb-10">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-slate-300 font-bold italic text-sm uppercase tracking-widest">Cart is Empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-[35px] shadow-sm border border-white flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-emerald-600 font-black text-sm">Rs. {item.price * (item.quantity || 1)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-slate-400">-</button>
                    <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 bg-white rounded-lg shadow-sm font-bold text-emerald-500">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment */}
        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-white">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Bill</p>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Rs. {total}</h2>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><CreditCard size={32}/></div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                onClick={() => processCheckout("esewa")}
                disabled={loading}
                className="w-full bg-[#60bb46] text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#52a43b] transition-all active:scale-95 disabled:bg-slate-200 flex items-center justify-center gap-2 text-sm"
                >
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <ShieldCheck size={18} />}
                    {loading ? "PROCESSING..." : "Pay with eSewa"}
                </button>

                <button
                onClick={() => processCheckout("cash")}
                disabled={loading}
                className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[28px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                    <Banknote size={18} className="text-emerald-500" /> 
                    Cash Payment
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}