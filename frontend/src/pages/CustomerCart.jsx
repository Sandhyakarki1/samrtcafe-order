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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleEsewaPayment = (orderId, amount) => {
    const transaction_uuid = `${orderId}-${Date.now()}`;
    const product_code = "EPAYTEST";
    const secret = "8gBm/:&EnhH.1/q";
    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const formData = {
      amount, tax_amount: 0, total_amount: amount,
      transaction_uuid, product_code,
      product_service_charge: 0, product_delivery_charge: 0,
      // Redirect to the success page we created
      success_url: `${window.location.origin}/payment-success/${orderId}`,
      failure_url: `${window.location.origin}/payment-failure`,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    Object.keys(formData).forEach(key => {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = key; input.value = formData[key];
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
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
        localStorage.removeItem("cart");
        if (method === "esewa") {
          handleEsewaPayment(orderId, total);
        } else {
          // Cash users go directly to tracking
          navigate(`/track/${orderId}`);
        }
      }
    } catch (error) {
      alert("Server error");
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center font-sans">
        <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black">SMART<span className="text-emerald-600">CAFE</span></h1>
        <Loader2 className="animate-spin mt-8 text-slate-200" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl"><ArrowLeft size={24}/></button>
          <h1 className="text-xl font-black uppercase">Review Order</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between">
          <div><p className="text-xs opacity-50">TABLE</p><h2 className="text-3xl font-black">{table}</h2></div>
          <ShoppingBag size={28} />
        </div>

        <div className="space-y-4 mb-10">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[30px] flex justify-between items-center shadow-sm">
              <div><h3 className="font-bold">{item.name}</h3><p className="text-emerald-600 font-bold text-sm">Rs. {item.price * item.quantity}</p></div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl font-black text-sm">{item.quantity}x</div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-left">Rs. {total}</h2>
               <CreditCard size={32} className="text-slate-200"/>
            </div>
            <button onClick={() => processCheckout("esewa")} disabled={loading} className="w-full bg-[#60bb46] text-white py-6 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-3 shadow-lg hover:bg-emerald-700 transition-all">
               {loading ? <Loader2 className="animate-spin"/> : <ShieldCheck size={20}/>} Pay with eSewa
            </button>
            <button onClick={() => processCheckout("cash")} disabled={loading} className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[24px] font-black uppercase text-xs flex items-center justify-center gap-2">
               <Banknote size={18} className="text-emerald-500" /> Cash Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}