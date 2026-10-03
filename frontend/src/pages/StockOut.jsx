import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import api from '../services/api';
import { ArrowUpFromLine, PackageMinus, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const StockOut = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  
  const [selectedProductData, setSelectedProductData] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    destination: '',
    referenceNumber: '',
    notes: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=1000');
        setProducts(res.data.data.products || res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // When product selection changes, update the selected product details to show available stock
  useEffect(() => {
    if (formData.productId) {
      const prod = products.find(p => p._id === formData.productId);
      setSelectedProductData(prod || null);
    } else {
      setSelectedProductData(null);
    }
  }, [formData.productId, products]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation: Prevent if requested > available
    if (selectedProductData && parseInt(formData.quantity) > selectedProductData.quantity) {
      setStatus({ type: 'error', message: `Insufficient stock! You only have ${selectedProductData.quantity} units available.` });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await api.post('/stock/out', formData);
      setStatus({ type: 'success', message: 'Stock OUT operation recorded successfully!' });
      
      // Update local product quantity so user sees accurate stock immediately
      setProducts(products.map(p => 
        p._id === formData.productId 
          ? { ...p, quantity: p.quantity - parseInt(formData.quantity) } 
          : p
      ));

      setFormData({ productId: '', quantity: '', destination: '', referenceNumber: '', notes: '' });
      setSelectedProductData(null);
      
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to record Stock OUT' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
          <ArrowUpFromLine className="mr-3 text-blue-600" size={32} strokeWidth={2.5} /> 
          Stock OUT
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Issue inventory from the warehouse to a destination.</p>
      </div>

      <Card className="border-t-4 border-t-blue-500 shadow-md">
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
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700"
            >
              <option value="">{loading ? 'Loading products...' : '-- Select a Product --'}</option>
              {products.map(p => (
                <option key={p._id} value={p._id} disabled={p.quantity === 0}>
                  {p.sku} - {p.name} {p.quantity === 0 ? '(Out of Stock)' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedProductData && (
            <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-colors ${parseInt(formData.quantity) > selectedProductData.quantity ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-indigo-50 border-indigo-100 text-indigo-900'}`}>
              <Info className={`mt-0.5 shrink-0 ${parseInt(formData.quantity) > selectedProductData.quantity ? 'text-rose-600' : 'text-indigo-500'}`} size={18} />
              <div>
                <p className="text-sm font-bold">Current Available Stock: <span className="text-lg font-black mx-1">{selectedProductData.quantity}</span> units</p>
                <p className="text-xs mt-1 font-medium opacity-80">You cannot issue more than this amount.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Quantity to Issue <span className="text-rose-500">*</span></label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleChange} 
                required 
                min="1"
                max={selectedProductData?.quantity || undefined}
                className={`w-full p-3.5 bg-slate-50 border ${selectedProductData && parseInt(formData.quantity) > selectedProductData.quantity ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/20 focus:bg-white text-rose-600' : 'border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white'} rounded-xl focus:outline-none transition-all font-bold text-slate-800 text-lg placeholder:text-slate-400 placeholder:font-medium`}
                placeholder="e.g. 5"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Destination <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                name="destination" 
                value={formData.destination} 
                onChange={handleChange} 
                required 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
                placeholder="e.g. Store 4, Client A..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Reference / Order Number <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              name="referenceNumber" 
              value={formData.referenceNumber} 
              onChange={handleChange} 
              required 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="e.g. ORD-2023-112"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows="3"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-700 placeholder:text-slate-400"
              placeholder="Any specific delivery instructions..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={submitting || loading || (selectedProductData && parseInt(formData.quantity) > selectedProductData.quantity)}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-4"
          >
            {submitting ? 'Processing Transaction...' : <><PackageMinus className="mr-2" strokeWidth={2.5} /> Issue Stock OUT</>}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default StockOut;
