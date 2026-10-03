import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import api from '../services/api';
import { ArrowDownToLine, PackagePlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const StockIn = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    newUnitCost: '',
    supplierId: '',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, suppRes] = await Promise.all([
          api.get('/products?limit=1000'), 
          api.get('/suppliers').catch(() => ({ data: { data: [] } }))
        ]);
        setProducts(prodRes.data.data.products || prodRes.data.data);
        setSuppliers(suppRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'productId') {
      const prod = products.find(p => p._id === value);
      setSelectedProduct(prod || null);
      if (prod) {
        // Automatically prefill current unit cost
        setFormData(prev => ({ ...prev, newUnitCost: prod.unitCost, supplierId: prod.supplierId?._id || prod.supplierId || '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/stock/in', formData);
      setStatus({ type: 'success', message: 'Stock IN operation recorded successfully!' });
      setFormData({ productId: '', quantity: '', newUnitCost: '', supplierId: '', referenceNumber: '', notes: '' });
      setSelectedProduct(null);
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to record Stock IN' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
          <ArrowDownToLine className="mr-3 text-emerald-600" size={32} strokeWidth={2.5} /> 
          Stock IN
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Receive new inventory into the warehouse securely.</p>
      </div>

      <Card className="border-t-4 border-t-emerald-500 shadow-md">
        {status && (
          <div className={`mb-6 p-4 rounded-xl flex items-center ${status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {status.type === 'success' ? <CheckCircle2 className="mr-3 text-emerald-600 shrink-0" /> : <AlertCircle className="mr-3 text-rose-600 shrink-0" />}
            <span className="font-semibold">{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Select Product <span className="text-rose-500">*</span></label>
            <select 
              name="productId" 
              value={formData.productId} 
              onChange={handleChange} 
              required
              disabled={loading}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-700"
            >
              <option value="">{loading ? 'Loading products...' : '-- Select a Product --'}</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.sku} - {p.name}</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Current Status</p>
                <p className="text-sm font-medium text-slate-700"><span className="font-bold text-slate-900">Stock:</span> {selectedProduct.quantity} units</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700"><span className="font-bold text-slate-900">Current Cost:</span> ${selectedProduct.unitCost}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Quantity to Add <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleChange} 
                required 
                min="1"
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800 text-lg placeholder:text-slate-400 placeholder:font-medium"
                placeholder="e.g. 100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">New Unit Cost ($)</label>
              <input 
                type="number" 
                step="0.01"
                name="newUnitCost" 
                value={formData.newUnitCost} 
                onChange={handleChange} 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800 text-lg placeholder:text-slate-400 placeholder:font-medium"
                placeholder="Cost per unit"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Supplier</label>
              <select 
                name="supplierId" 
                value={formData.supplierId} 
                onChange={handleChange}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-700"
              >
                <option value="">-- Select Supplier (Optional) --</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Reference / Invoice Number <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              name="referenceNumber" 
              value={formData.referenceNumber} 
              onChange={handleChange} 
              required 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="e.g. INV-2023-089"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="3"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="Any additional details..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={submitting || loading}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4"
          >
            {submitting ? 'Processing Transaction...' : <><PackagePlus className="mr-2" strokeWidth={2.5} /> Complete Stock IN</>}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default StockIn;
