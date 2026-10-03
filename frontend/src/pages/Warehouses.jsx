import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { Warehouse, Plus, Search, Edit, Trash2, Map, Maximize, Box } from 'lucide-react';
import GenericFormModal from '../components/common/GenericFormModal';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

  const warehouseFields = [
    { name: 'name', label: 'Warehouse Name', required: true, fullWidth: true },
    { name: 'code', label: 'Unique Code', required: true },
    { name: 'capacity', label: 'Max Capacity (Units)', type: 'number' },
    { name: 'location', label: 'Physical Location', fullWidth: true, type: 'textarea' },
    { name: 'imageUrl', label: 'Image URL (Optional)', fullWidth: true }
  ];

  const openAddModal = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Delete this warehouse? This cannot be undone.')) {
      try {
        await api.delete(`/warehouses/${id}`);
        fetchWarehouses();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting warehouse'); }
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center tracking-tight">
            <Warehouse className="mr-3 text-emerald-600" size={32} strokeWidth={2.5} /> 
            Warehouse Facilities
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage physical storage locations and track capacities.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all">
          <Plus size={18} className="mr-2" strokeWidth={3} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full"><LoadingState message="Scanning global facilities..." /></div>
        ) : warehouses.length > 0 ? (
          warehouses.map(w => {
            const capacityPercentage = w.capacity ? Math.min(100, Math.round((w.totalUnits / w.capacity) * 100)) : 0;
            const isFull = capacityPercentage >= 95;

            return (
              <Card key={w._id} className="hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500 flex flex-col p-0 group overflow-hidden">
                <div className="h-32 w-full bg-slate-100 border-b border-slate-200 relative">
                  <img 
                    src={w.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=random&size=400`} 
                    alt={w.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=random&size=400` }}
                  />
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                    <button onClick={() => openEditModal(w)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit size={16} strokeWidth={2.5} /></button>
                    <button onClick={() => handleDelete(w._id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"><Trash2 size={16} strokeWidth={2.5} /></button>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="font-bold text-xl text-slate-800 tracking-tight">{w.name}</h3>
                    <p className="text-xs font-mono font-bold text-emerald-600 mt-1 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded inline-block">CODE: {w.code}</p>
                  </div>

                </div>
                
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-medium flex items-center text-slate-600"><Map size={16} className="mr-2 text-slate-400 shrink-0" /> <span className="line-clamp-2">{w.location}</span></p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-sm font-bold text-slate-700"><Box size={16} className="mr-2 text-blue-500" /> Active SKUs</div>
                      <span className="font-black text-slate-800">{w.itemCount || 0}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isFull ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className={`flex items-center text-sm font-bold ${isFull ? 'text-rose-800' : 'text-emerald-800'}`}>
                        <Maximize size={16} className="mr-2" /> Storage Volume
                      </div>
                      <span className={`font-black ${isFull ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {w.totalUnits || 0} <span className="text-xs font-semibold opacity-70">/ {w.capacity || '∞'}</span>
                      </span>
                    </div>
                    
                    {w.capacity && (
                      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${capacityPercentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full"><EmptyState title="No Warehouses Found" description="Register a physical storage location to begin tracking capacity." /></div>
        )}
      </div>

      <GenericFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
        fields={warehouseFields}
        initialData={editingWarehouse}
        endpoint="/warehouses"
        method={editingWarehouse ? 'PUT' : 'POST'}
        onSuccess={fetchWarehouses}
      />
    </div>
  );
};
export default Warehouses;
