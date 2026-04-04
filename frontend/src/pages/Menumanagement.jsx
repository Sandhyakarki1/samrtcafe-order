import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Utensils, Image as ImageIcon, Loader2, Save } from 'lucide-react';

const BASE_URL = "https://presence-clarke-collectables-working.trycloudflare.com";
const API_URL = `${BASE_URL}/api/menu/`;

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  
  const [formData, setFormData] = useState({ 
    name: '', category: 'Meals', price: '', stock: '', image: null, description: '' 
  });

  const [preview, setPreview] = useState(null); 
 
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (typeof imagePath !== 'string') return null;

    const cleanPath = imagePath.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, "");
    
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${BASE_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch menu");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('price', formData.price);
    data.append('stock', formData.stock);
    data.append('description', formData.description || ""); 
    
    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }

    const url = editingItem ? `${API_URL}${editingItem.id}/` : API_URL;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: data,
        
      });

      if (res.ok) {
        fetchMenu();
        setIsModalOpen(false);
        setPreview(null);
      } else {
        const errData = await res.json();
        alert("Error: " + JSON.stringify(errData));
      }
    } catch (error) {
      alert("Failed to connect to server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
      fetchMenu();
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item, image: null }); 
      setPreview(getFullImageUrl(item.image)); 
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: 'Meals', price: '', stock: '', image: null, description: '' });
      setPreview(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Menu Management</h1>
          <p className="text-slate-400 font-medium text-sm">Update prices, images, and inventory</p>
        </div>
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
          <Plus size={20} /> Add New Item
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="animate-spin mb-3" size={40} />
                <p className="font-black uppercase text-[10px] tracking-widest">Syncing Menu...</p>
            </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-5">Item Details</th>
              <th className="px-8 py-5">Category</th>
              <th className="px-8 py-5">Stock</th>
              <th className="px-8 py-5">Price</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 flex-shrink-0 shadow-sm">
                      <img 
                        src={getFullImageUrl(item.image)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src="https://via.placeholder.com/150"; }}
                      />
                    </div>
                    <div>
                        <span className="font-black text-slate-800 block text-sm italic">{item.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 max-w-[180px] font-medium">{item.description || "Freshly made"}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="bg-white border border-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">
                    {item.category}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <span className={`text-sm font-bold ${item.stock < 5 ? 'text-red-500' : 'text-slate-600'}`}>
                    {item.stock > 0 ? `Qty: ${item.stock}` : "Sold Out"}
                  </span>
                </td>
                <td className="px-8 py-5 font-black text-indigo-600">Rs {item.price}</td>
                <td className="px-8 py-5 text-center">
                  <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(item)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">

        </div>
      )}
    </div>
  );
};

export default MenuManagement;