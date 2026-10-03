import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { Truck, Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import GenericFormModal from '../components/common/GenericFormModal';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const supplierFields = [
    { name: 'name', label: 'Supplier Name', required: true, fullWidth: true },
    { name: 'contactPerson', label: 'Contact Person' },
    { name: 'phone', label: 'Phone Number' },
    { name: 'email', label: 'Email Address' },
    { name: 'address', label: 'Physical Address', fullWidth: true, type: 'textarea' },
    { name: 'imageUrl', label: 'Image URL (Optional)', fullWidth: true }
  ];

  const openAddModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to completely remove this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        fetchSuppliers();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting supplier'); }
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center tracking-tight">
            <Truck className="mr-3 text-indigo-600" size={32} strokeWidth={2.5} /> 
            Supplier Management
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage vendor relationships and supply chains.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
          <Plus size={18} className="mr-2" strokeWidth={3} /> Add Supplier
        </button>
      </div>

      <Card className="p-0 overflow-hidden border-t-4 border-t-indigo-500">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
           <div className="flex items-center bg-white rounded-xl px-4 py-2.5 w-[400px] border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
             <Search size={18} className="text-slate-400" />
             <input type="text" placeholder="Search suppliers by name or email..." className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-700" />
           </div>
        </div>

        {loading ? <LoadingState message="Loading supplier directory..." /> : suppliers.length > 0 ? (
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Supplier Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Contact Details</th>
                <th className="px-6 py-4 font-bold tracking-wider">Location</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Products Supplied</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {suppliers.map(s => (
                <tr key={s._id} className="hover:bg-indigo-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={s.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random`} 
                          alt={s.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random` }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">{s.name}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Rep: {s.contactPerson || 'Not provided'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <p className="flex items-center text-slate-600 font-medium"><Phone size={14} className="mr-2 text-indigo-400" /> {s.phone || 'N/A'}</p>
                      <p className="flex items-center text-slate-600 font-medium"><Mail size={14} className="mr-2 text-indigo-400" /> {s.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium flex items-center h-full pt-6"><MapPin size={16} className="mr-2 text-indigo-400 shrink-0" /> <span className="line-clamp-2">{s.address || 'N/A'}</span></td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg font-bold text-xs tracking-wide">
                      {s.productCount || 0} ITEMS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors mx-1"><Edit size={18} strokeWidth={2.5} /></button>
                    <button onClick={() => handleDelete(s._id)} className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors mx-1"><Trash2 size={18} strokeWidth={2.5} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <EmptyState title="No Suppliers Found" description="Register your first vendor to start tracking supply chains." />}
      </Card>

      <GenericFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        fields={supplierFields}
        initialData={editingSupplier}
        endpoint="/suppliers"
        method={editingSupplier ? 'PUT' : 'POST'}
        onSuccess={fetchSuppliers}
      />
    </div>
  );
};
export default Suppliers;
