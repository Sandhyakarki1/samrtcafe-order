import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { ShoppingBag, ArrowLeft, Trash2, CreditCard, ShieldCheck, Banknote, Loader2 } from "lucide-react";

// Update this to  current tunnel
const BASE_URL = "https://seller-amazing-stunning-primarily.trycloudflare.com";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1";

  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // ---  WORKING ESEWA LOGIC ---
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
      // eSewa will redirect here after success
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
      items: cart.map(item => ({ id: item.id, qty: item.quantity || 1, instructions: item.note || "" }))
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
          // Cash users go directly to track their food
          navigate(`/track/${orderId}`);
        }
      }
    } catch (error) {
      alert("Backend server offline");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8 text-left">
          <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm"><ArrowLeft size={24}/></button>
          <h1 className="text-xl font-black uppercase">Review Order</h1>
          <button onClick={() => syncCart([])} className="p-3 text-red-400"><Trash2 size={20}/></button>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between items-center shadow-xl text-left">
          <div><p className="text-xs opacity-50 uppercase font-bold">Location</p><h2 className="text-3xl font-black italic">TABLE {table}</h2></div>
          <ShoppingBag size={28} />
        </div>

        <div className="space-y-4 mb-10">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[30px] shadow-sm flex justify-between items-center text-left border border-white">
              <div><h3 className="font-bold text-slate-800">{item.name}</h3><p className="text-indigo-600 font-bold">Rs. {item.price * item.quantity}</p></div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl font-black text-sm">{item.quantity}x</div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-white">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 text-left">Rs. {total}</h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => processCheckout("esewa")} disabled={loading} className="w-full bg-[#60bb46] text-white py-6 rounded-[24px] font-black uppercase flex items-center justify-center gap-2 hover:bg-green-700 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20}/>} Pay with eSewa
              </button>
              <button onClick={() => processCheckout("cash")} disabled={loading} className="w-full bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[24px] font-black uppercase text-xs flex items-center justify-center gap-2">
                <Banknote size={18} className="text-emerald-500" /> Cash Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}