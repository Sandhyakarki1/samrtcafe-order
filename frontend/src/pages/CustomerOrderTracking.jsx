import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { Clock, CheckCircle, ChefHat, Bell, Star, Send, MessageSquare, Utensils } from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerOrderTracking() {
  const { id } = useParams(); 
  const navigate = useNavigate(); // For smoother page transitions
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Feedback States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/orders/${id}/`);
      if (!response.ok) throw new Error("Order not found");
      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Order not found. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      // 🛑 Stop polling if order is served/paid OR if feedback was just submitted
      if (order?.status === 'Served' || order?.status === 'Paid' || submitted) {
        clearInterval(interval);
      } else {
        fetchOrder();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, order?.status, submitted]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/feedback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: id,
          rating: rating,
          comment: comment
        })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errData = await response.json();
        alert(errData.error || "Failed to submit feedback.");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Utensils size={40} className="animate-spin text-indigo-200 mx-auto mb-4" />
        <p className="font-bold text-slate-400 uppercase text-xs tracking-widest">Connecting to Kitchen...</p>
      </div>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md">
        <h2 className="text-red-500 font-black text-2xl mb-2 text-center">Oops!</h2>
        <p className="text-slate-500 font-medium mb-6 text-center">{error}</p>
        <button onClick={() => navigate('/menu')} className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">Back to Menu</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* CASE 1: TRACKING (Pending, Preparing, or Ready) */}
      {order.status !== 'Served' && order.status !== 'Paid' && !submitted && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 text-center animate-in zoom-in duration-500">
          <h1 className="text-2xl font-black text-slate-800 mb-2">Order Tracking</h1>
          <p className="text-indigo-600 font-bold mb-8 italic">Order ID: #{order.id}</p>

          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
              {order.status === 'Pending' && <Clock size={48} className="animate-pulse" />}
              {order.status === 'Preparing' && <ChefHat size={48} className="animate-bounce" />}
              {order.status === 'Ready' && <Bell size={48} className="animate-bounce text-emerald-500" />}
            </div>
          </div>

          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">
            {order.status}
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-8">
            Table {order.table_number} • {order.status === 'Ready' ? 'Pick up at counter' : 'Preparing your meal'}
          </p>

          <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Order Items</p>
            <p className="font-bold text-slate-700 italic leading-relaxed text-sm">
              {order.items_text || "Checking details..."}
            </p>
          </div>
        </div>
      )}

      {/* CASE 2: FEEDBACK (Triggered when Status is 'Served') */}
      {(order.status === 'Served' || order.status === 'Paid') && !submitted && (
        <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100 animate-in slide-in-from-bottom duration-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Enjoy your meal!</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium italic">How was everything at Table {order.table_number}?</p>
          </div>

          <form onSubmit={handleFeedbackSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((num) => (
                <button type="button" key={num} onClick={() => setRating(num)}>
                  <Star 
                    size={36} 
                    fill={num <= rating ? "#fbbf24" : "none"} 
                    stroke={num <= rating ? "#fbbf24" : "#cbd5e1"} 
                    className="transition-transform active:scale-125 hover:scale-110"
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1 block tracking-widest">Share your thoughts</label>
              <textarea 
                className="w-full border-2 border-slate-50 bg-slate-50 rounded-[24px] p-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none transition-all focus:bg-white"
                placeholder="The food was delicious! Service was great..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Send size={18} /> Submit Review
            </button>
          </form>
        </div>
      )}

      {/* CASE 3: SUCCESS */}
      {submitted && (
        <div className="text-center animate-in fade-in zoom-in duration-500">
           <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100 border-2 border-white">
              <MessageSquare size={40}/>
           </div>
           <h1 className="text-3xl font-black text-slate-800">Thank You!</h1>
           <p className="text-slate-500 mt-2 font-medium max-w-xs mx-auto italic">
             "Your feedback helps us make Smart-Cafe even better. We hope to see you again soon!"
           </p>
           <button 
            onClick={() => navigate(`/menu/${order.table_number}`)}
            className="mt-10 text-indigo-600 font-black border-b-4 border-indigo-100 hover:border-indigo-600 transition-all pb-1 uppercase text-xs tracking-widest"
           >
             Order Something Else?
           </button>
        </div>
      )}
    </div>
  );
}