import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerOrderTracking() {
  const { id } = useParams(); // order ID from URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/orders/${id}/`);
        if (!response.ok) {
          console.error("Order fetch failed:", response.status);
          setOrder(null);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setOrder(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-6">Order Tracking</h1>
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Table Number:</strong> {order.table_number}</p>
      <p><strong>Status:</strong> {order.status}</p>

      <h2 className="mt-4 font-bold">Items:</h2>
      {order.items.map(item => (
        <div key={item.id}>
          {item.menu_item_name} x {item.quantity} — Rs. {item.price * item.quantity}
        </div>
      ))}

      <h2 className="mt-4 font-bold">Total: Rs. {order.total_price}</h2>
    </div>
  );
}
