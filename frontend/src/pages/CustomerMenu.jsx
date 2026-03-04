import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = "http://127.0.0.1:8000";

export default function CustomerMenu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Use the table number from URL (e.g., ?table=1)
  const tableNumber = searchParams.get("table") || "1";

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // 1. Always save the table number to localStorage immediately
    localStorage.setItem("table", tableNumber);

    // 2. Load existing cart from localStorage so items don't disappear on refresh
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);

    // 3. Fetch Menu from Django
    fetch(`${BASE_URL}/api/menu/`)
      .then(res => res.json())
      .then(data => setMenu(data))
      .catch(err => console.error("Error fetching menu:", err));
  }, [tableNumber]);

  const addToCart = (item) => {
    if (item.stock === 0) return alert("Out of stock!");

    const existing = cart.find(i => i.id === item.id);
    let updatedCart;

    if (existing) {
      updatedCart = cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updatedCart);
    // 4. Save to localStorage every time the cart changes
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const goToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 min-h-screen pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800">Smart Cafe</h1>
        <p className="text-indigo-600 font-bold uppercase text-xs tracking-widest">Table {tableNumber} Menu</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {menu.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            {item.image ? (
              <img
                src={`${BASE_URL}${item.image}`}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-2xl bg-gray-100"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-bold">No Image</div>
            )}

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{item.name}</h2>
              <p className="text-indigo-600 font-black">Rs. {item.price}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Stock: {item.stock}</p>
            </div>

            <button
              onClick={() => addToCart(item)}
              disabled={item.stock === 0}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                item.stock === 0
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-slate-900 text-white shadow-lg"
              }`}
            >
              <span className="text-2xl font-light">+</span>
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6">
           <button
            onClick={goToCart}
            className="w-full max-w-md mx-auto bg-emerald-600 text-white py-4 rounded-2xl shadow-2xl font-black flex justify-between items-center px-8 animate-in slide-in-from-bottom-4"
          >
            <span>View Cart ({cart.length} Items)</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}