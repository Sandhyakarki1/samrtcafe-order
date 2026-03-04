import { useNavigate } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerCart() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const table = localStorage.getItem("table");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0 
  );

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const orderData = {
      table_number: table,
      items: cart.map(item => ({
        id: item.id,
        qty: item.quantity
      }))
    };

    try {
      const response = await fetch(`${BASE_URL}/api/place-order/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const err = await response.json();
        console.error("Order error:", err);
        alert("Order failed! Check console for details.");
        return;
      }

      const data = await response.json();

      localStorage.removeItem("cart"); // clear cart after placing order

      navigate(`/track/${data.id}`); // navigate to tracking page
    } catch (error) {
      console.error("Order request failed:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map(item => (
          <div key={item.id} className="mb-3">
            {item.name} x {item.quantity} — Rs. {item.price * item.quantity}
          </div>
        ))
      )}

      <h2 className="font-bold mt-4">Total: Rs. {total}</h2>

      <button
        onClick={placeOrder}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
        disabled={cart.length === 0}
      >
        Place Order
      </button>
    </div>
  );
}
