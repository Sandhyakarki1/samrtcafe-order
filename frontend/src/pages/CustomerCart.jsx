import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Trash2, CheckCircle, CreditCard } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerCart() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get cart and table from storage
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const table = localStorage.getItem("table") || "1"; // Default to Table 1 for testing

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0 
  );

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart([]);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    setLoading(true);

    const orderData = {
      table_number: parseInt(table),
      items: cart.map(item => ({
        id: item.id,
        qty: item.quantity || 1
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
        alert("Order sent to kitchen!");
        localStorage.removeItem("cart"); 
        // Navigates to  tracking page with the specific order ID
        navigate(`/track/${data.id}`); 
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/menu" className="p-2 bg-white rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-indigo-600" /> Your Order
          </h1>
          <button onClick={clearCart} className="text-red-400 hover:text-red-600 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        {/* Table Number Indicator */}
        <div className="bg-indigo-600 text-white p-4 rounded-2xl mb-6 flex justify-between items-center shadow-lg shadow-indigo-100">
           <span className="font-bold uppercase text-xs tracking-widest opacity-80">Assigned Table</span>
           <span className="text-2xl font-black italic">TABLE {table}</span>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 mb-8">
          {cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-300 font-bold italic">Your cart is currently empty.</p>
              <Link to="/menu" className="mt-4 inline-block text-indigo-600 font-black text-sm uppercase">Browse Menu</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-black text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-lg font-black text-slate-800 italic">Rs. {item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total & Place Order */}
        {cart.length > 0 && (
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Grand Total</p>
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter">Rs. {total}</h2>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl">
                <CreditCard size={32}/>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? "SENDING TO KITCHEN..." : <><CheckCircle size={20}/> Place Order Now</>}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">Payment will be handled at the counter</p>
          </div>
        )}
      </div>
    </div>
  );
}