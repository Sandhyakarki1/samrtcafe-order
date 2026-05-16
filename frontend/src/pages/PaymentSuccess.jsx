import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";

const BASE_URL = "https://call-combination-instead-ranging.trycloudflare.com";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { orderId } = useParams(); 
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      //  Get the encrypted data string from eSewa URL (?data=...)
      const encodedData = searchParams.get("data");

      if (encodedData) {
        try {
          //  Send data to Django to decode and mark order as 'Paid'
          await fetch(`${BASE_URL}/api/khalti/verify/`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              data: encodedData, 
              order_id: orderId,
              token: "MOCK_ESEWA_TOKEN" 
            })
          });
          console.log("Database updated: Order is now PAID");
        } catch (err) {
          console.error("Backend verification failed", err);
        }
      }

      setIsVerifying(false);

      //  Wait 4 seconds to show the success message, then move to tracking
      const timer = setTimeout(() => {
        navigate(`/track/${orderId}`);
      }, 4000);

      return () => clearTimeout(timer);
    };

    verifyPayment();
  }, [orderId, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#F0FFF4] flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Visual Success Indicator */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-100 animate-bounce">
          <CheckCircle size={50} className="text-emerald-500" />
        </div>
        {/* Decorative Ring */}
        <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping opacity-20"></div>
      </div>

      <h1 className="text-4xl font-black text-emerald-600 mb-2 tracking-tight uppercase italic">
        Payment Successful! 🎉
      </h1>
      
      <p className="text-emerald-700 font-medium max-w-xs mx-auto leading-relaxed">
        Your transaction for <span className="font-bold">Order #{orderId}</span> was completed successfully.
      </p>

      {/* Loading Progress for Redirect */}
      <div className="mt-12 flex flex-col items-center gap-4">
         <div className="flex items-center gap-2 text-emerald-400">
            {isVerifying ? (
                <Loader2 className="animate-spin" size={16} />
            ) : (
                <div className="w-8 h-1 bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
                </div>
            )}
         </div>
         
         <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
            {isVerifying ? "Verifying with Bank..." : "Opening Real-time Tracking"}
         </p>
      </div>

      {/* Manual Button (Just in case) */}
      {!isVerifying && (
        <button 
            onClick={() => navigate(`/track/${orderId}`)}
            className="mt-8 text-emerald-600 font-bold text-xs border-b-2 border-emerald-600 pb-1 hover:text-emerald-800 transition-colors"
        >
            Click here if not redirected
        </button>
      )}
    </div>
  );
}