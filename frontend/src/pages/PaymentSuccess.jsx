import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams(); 

  useEffect(() => {
    // Show success for 4 seconds, then move to live tracking
    const timer = setTimeout(() => {
      navigate(`/track/${orderId}`);
    }, 4000);
    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-[#F0FFF4] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce">
        <CheckCircle size={50} className="text-white" />
      </div>
      <h1 className="text-4xl font-black text-emerald-600 mb-2 italic">Payment Successful! 🎉</h1>
      <p className="text-emerald-700 font-medium">Your order has been placed successfully.</p>
      <div className="mt-12 flex flex-col items-center gap-2">
         <Loader2 className="animate-spin text-emerald-300" size={20} />
         <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Opening Tracking Page...</p>
      </div>
    </div>
  );
}