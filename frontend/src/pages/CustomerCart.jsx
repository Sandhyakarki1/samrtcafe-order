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
        const newQty = Math.max(1, (item.quantity || 1) + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    syncCart(updated);
  };

  const updateNote = (id, note) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, note } : item
    );
    syncCart(updated);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
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

    //  ALWAYS UNIQUE UUID
    const transaction_uuid = `${orderId}-${Date.now()}`;

    const product_code = "EPAYTEST";
    const total_amount = amount;
    const secret = "8gBm/:&EnhH.1/q";

    const message =
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

    const hash = CryptoJS.HmacSHA256(message, secret);
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const formData = {
      amount: amount,
      tax_amount: 0,
      total_amount: total_amount,
      transaction_uuid: transaction_uuid,
      product_code: product_code,
      product_service_charge: 0,
      product_delivery_charge: 0,

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

        const orderId = data.order_id || data.id;

        if (method === "esewa") {
          handleEsewaPayment(orderId, total);
        } else {
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
            className="p-3 bg-white rounded-2xl shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-xl font-black">
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
        <div className="bg-slate-900 text-white p-6 rounded-[32px] mb-8 flex justify-between">

          <div>
            <p className="text-xs opacity-50">TABLE</p>
            <h2 className="text-3xl font-black">{table}</h2>
          </div>

          <ShoppingBag size={28} />

        </div>

        {/* CART ITEMS */}
        <div className="space-y-4 mb-10">

          {cart.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-[30px]">

              <div className="flex justify-between">

                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-indigo-600 font-bold">
                    Rs. {item.price * (item.quantity || 1)}
                  </p>
                </div>

                <div className="flex gap-2">

                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>

                  <span>{item.quantity}</span>

                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>

                </div>

              </div>

              <input
                className="w-full mt-3 p-2 bg-gray-50 rounded"
                placeholder="Instructions..."
                value={item.note || ""}
                onChange={(e) => updateNote(item.id, e.target.value)}
              />

            </div>
          ))}

        </div>

        {/* PAYMENT */}
        {cart.length > 0 && (
          <div className="bg-white p-6 rounded-[30px]">

            <h2 className="text-3xl font-black mb-5">
              Rs. {total}
            </h2>

            {/* ESEWA */}
            <button
              onClick={() => processCheckout("esewa")}
              disabled={loading}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold"
            >
              <ShieldCheck /> Pay with eSewa
            </button>

            {/* CASH */}
            <button
              onClick={() => processCheckout("cash")}
              disabled={loading}
              className="w-full mt-3 border py-4 rounded-2xl"
            >
              <Banknote /> Cash Payment
            </button>

          </div>
        )}

      </div>

    </div>
  );
}