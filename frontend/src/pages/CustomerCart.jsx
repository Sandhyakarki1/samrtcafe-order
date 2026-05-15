import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

import {
  ShoppingBag,
  ArrowLeft,
  Trash2,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Banknote
} from "lucide-react";

const BASE_URL = "https://call-combination-instead-ranging.trycloudflare.com";

export default function CustomerCart() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );

  const table = localStorage.getItem("table") || "1";

  // -----------------------------
  // CART FUNCTIONS
  // -----------------------------

  const syncCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const updateQuantity = (id, delta) => {

    const updated = cart.map(item => {

      if (item.id === id) {

        const newQty = Math.max(
          1,
          (item.quantity || 1) + delta
        );

        return {
          ...item,
          quantity: newQty
        };
      }

      return item;
    });

    syncCart(updated);
  };

  const updateNote = (id, note) => {

    const updated = cart.map(item =>
      item.id === id
        ? { ...item, note }
        : item
    );

    syncCart(updated);
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * (item.quantity || 1),
    0
  );

  // -----------------------------
  // ESEWA PAYMENT
  // -----------------------------

  const handleEsewaPayment = (orderId, amount) => {

    if (!orderId) {

      alert("Order ID missing");
      setLoading(false);
      return;
    }

    const transaction_uuid = orderId.toString();

    const product_code = "EPAYTEST";

    const total_amount = amount;

    const secret = "8gBm/:&EnhH.1/q";

    // MESSAGE
    const message =
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    // HASH
    const hash = CryptoJS.HmacSHA256(message, secret);

    // SIGNATURE
    const signature =
      CryptoJS.enc.Base64.stringify(hash);

    const formData = {

      amount: amount,

      tax_amount: 0,

      total_amount: total_amount,

      transaction_uuid: transaction_uuid,

      product_code: product_code,

      product_service_charge: 0,

      product_delivery_charge: 0,

      success_url:
        `${window.location.origin}/payment-success/${orderId}`,

      failure_url:
        `${window.location.origin}/payment-failure`,

      signed_field_names:
        "total_amount,transaction_uuid,product_code",

      signature: signature
    };

    // CREATE FORM
    const form = document.createElement("form");

    form.method = "POST";

    form.action =
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

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

  // -----------------------------
  // CHECKOUT
  // -----------------------------

  const processCheckout = async (method) => {

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

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

      const response = await fetch(
        `${BASE_URL}/api/place-order/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(orderData)
        }
      );

      const data = await response.json();

      if (response.ok) {

        const orderId =
          data.order_id || data.id;

        // ESEWA
        if (method === "esewa") {

          handleEsewaPayment(orderId, total);
        }

        // CASH
        else {

          localStorage.removeItem("cart");

          alert("Cash order placed!");

          navigate(`/track/${orderId}`);
        }

      } else {

        alert("Failed to create order");

        setLoading(false);
      }

    } catch (error) {

      console.error(error);

      alert("Backend server offline");

      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (

    <div className="min-h-screen bg-[#F8F9FB] p-6 font-sans">

      <div className="max-w-xl mx-auto text-left">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-8">

          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow-sm text-slate-400"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            Review Order
          </h1>

          <button
            onClick={() => syncCart([])}
            className="p-3 text-red-400"
          >
            <Trash2 size={20} />
          </button>

        </div>

        {/* TABLE */}

        <div className="bg-slate-900 rounded-[32px] p-6 text-white mb-8 flex justify-between items-center shadow-xl">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-1">
              Your Location
            </p>

            <h2 className="text-3xl font-black italic">
              TABLE {table}
            </h2>

          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">

            <ShoppingBag size={28} />

          </div>

        </div>

        {/* CART ITEMS */}

        <div className="space-y-4 mb-10">

          {cart.map(item => (

            <div
              key={item.id}
              className="bg-white rounded-[35px] p-5 shadow-sm border"
            >

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold text-slate-800">
                    {item.name}
                  </h3>

                  <p className="text-indigo-600 font-black text-sm">

                    Rs.
                    {" "}
                    {item.price * (item.quantity || 1)}

                  </p>

                </div>

                {/* QUANTITY */}

                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl">

                  <button
                    onClick={() =>
                      updateQuantity(item.id, -1)
                    }
                    className="w-8 h-8 bg-white rounded-lg shadow-sm"
                  >
                    -
                  </button>

                  <span className="font-black text-sm w-4 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, 1)
                    }
                    className="w-8 h-8 bg-white rounded-lg shadow-sm"
                  >
                    +
                  </button>

                </div>

              </div>

              {/* NOTE */}

              <div className="relative mt-4">

                <input
                  type="text"
                  placeholder="Instructions..."
                  className="w-full bg-slate-50 rounded-xl p-3 pl-10 text-[11px]"
                  value={item.note || ""}
                  onChange={(e) =>
                    updateNote(item.id, e.target.value)
                  }
                />

                <MessageSquare
                  size={14}
                  className="absolute left-3.5 top-3.5 text-slate-300"
                />

              </div>

            </div>

          ))}

        </div>

        {/* PAYMENT */}

        {cart.length > 0 && (

          <div className="bg-white p-8 rounded-[45px] shadow-2xl border">

            <div className="flex justify-between items-center mb-8">

              <div>

                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                  Total Bill
                </p>

                <h2 className="text-4xl font-black text-slate-900">
                  Rs. {total}
                </h2>

              </div>

              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl">

                <CreditCard size={32} />

              </div>

            </div>

            {/* ESEWA BUTTON */}

            <button
              onClick={() => processCheckout("esewa")}
              disabled={loading}
              className="w-full bg-green-600 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] shadow-2xl"
            >

              <div className="flex items-center justify-center gap-2">

                <ShieldCheck size={18} />

                <span>
                  {loading
                    ? "PROCESSING..."
                    : "Pay with eSewa"}
                </span>

              </div>

            </button>

            {/* CASH BUTTON */}

            <button
              onClick={() => processCheckout("cash")}
              disabled={loading}
              className="w-full mt-3 bg-white border-2 border-slate-100 text-slate-800 py-5 rounded-[28px] font-black uppercase tracking-[0.2em]"
            >

              <div className="flex items-center justify-center gap-2">

                <Banknote
                  size={18}
                  className="text-emerald-500"
                />

                Pay with Cash

              </div>

            </button>

          </div>

        )}

      </div>

    </div>
  );
}