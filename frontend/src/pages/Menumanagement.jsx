import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Utensils, Image as ImageIcon } from 'lucide-react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Updated state to include stock and image
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Meals', 
    price: '', 
    stock: '', 
    image: null 
  });
  
  const API_URL = "http://127.0.0.1:8000/api/menu/";

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) setMenuItems(await res.json());
    } catch (err) {
      console.error("Failed to fetch menu");
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // IMPORTANT: Use FormData for file uploads instead of JSON
    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    
    // Only append image if a new file was selected
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }

    const url = editingItem ? `${API_URL}${editingItem.id}/` : API_URL;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        // Do NOT set 'Content-Type' header when using FormData
        body: data,
      });

      if (res.ok) {
        fetchMenu();
        setIsModalOpen(false);
      } else {
        const errData = await res.json();
        alert("Error: " + JSON.stringify(errData));
      }
    } catch (error) {
      alert("Failed to connect to server");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchMenu();
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 text-sm">Manage food items, pricing, and stock</p>
        </div>
        <button 
          onClick={() => { 
            setEditingItem(null); 
            setFormData({ name: '', category: 'Meals', price: '', stock: '', image: null }); 
            setIsModalOpen(true); 
          }} 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
            <tr>
              <th className="px-8 py-5">Item Details</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5">Stock</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    {/* Image Preview */}
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img 
                          src={`http://127.0.0.1:8000${item.image}`} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Utensils size={20} />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-gray-700">{item.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  {item.stock > 0 ? (
                    <span className="text-gray-600 font-semibold text-sm">Qty: {item.stock}</span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold">OUT OF STOCK</span>
                  )}
                </td>
                <td className="px-8 py-5 font-bold text-indigo-600">Rs {item.price}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingItem(item); setFormData({ ...item, image: null }); setIsModalOpen(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{editingItem ? 'Edit Item' : 'Add Food Item'}</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in the menu details below</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Food Name</label>
                <input required className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none mt-1" placeholder=" " value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Category</label>
                  <select className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white mt-1" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Meals">Meals</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Price (Rs)</label>
                  <input required type="number" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none mt-1" placeholder=" " value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Available Quantity (Stock)</label>
                <input required type="number" className="w-full border-2 p-3 rounded-xl focus:border-indigo-500 outline-none mt-1" placeholder=" " value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1 flex items-center gap-2">
                   <ImageIcon size={14}/> Food Image
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="w-full border-2 border-dashed p-3 rounded-xl mt-1 text-sm file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                />
              </div>

              <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg mt-4">
                {editingItem ? 'Update Menu Item' : 'Add to Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;