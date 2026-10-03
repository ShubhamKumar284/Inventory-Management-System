import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { Search, Plus, Edit, Trash2, Eye, Filter, RefreshCw, Download, Printer, QrCode } from 'lucide-react';
import GenericFormModal from '../components/common/GenericFormModal';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const productFields = [
    { name: 'sku', label: 'SKU', required: true },
    { name: 'name', label: 'Product Name', required: true },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categories.map(c => ({ value: c._id, label: c.name })) },
    { name: 'unitCost', label: 'Unit Cost ($)', type: 'number', required: true },
    { name: 'quantity', label: 'Current Stock Quantity', type: 'number', required: true },
    { name: 'minimumStock', label: 'Minimum Stock Alert', type: 'number' },
    { name: 'supplierId', label: 'Supplier', type: 'select', options: suppliers.map(s => ({ value: s._id, label: s.name })) },
    { name: 'warehouseId', label: 'Warehouse', type: 'select', options: warehouses.map(w => ({ value: w._id, label: w.name })) },
    { name: 'imageUrl', label: 'Image URL (Optional)', fullWidth: true },
  ];

  const openAddModal = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    const editData = { ...product };
    if (product.categoryId) editData.categoryId = product.categoryId._id || product.categoryId;
    if (product.supplierId) editData.supplierId = product.supplierId._id || product.supplierId;
    if (product.warehouseId) editData.warehouseId = product.warehouseId._id || product.warehouseId;
    setEditingProduct(editData);
    setIsFormOpen(true);
  };
  
  // Modals state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=50');
      setProducts(res.data.data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const fetchDependencies = async () => {
      try {
        const [catRes, supRes, warRes] = await Promise.all([
          api.get('/categories'),
          api.get('/suppliers'),
          api.get('/warehouses')
        ]);
        setCategories(catRes.data.data || []);
        setSuppliers(supRes.data.data || []);
        setWarehouses(warRes.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchDependencies();
  }, []);

  const getStockBadge = (product) => {
    const baseClass = "w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border shadow-[0_0_12px_2px]";
    
    if (product.quantity === 0) return <div title="Out of Stock" className={`${baseClass} bg-rose-500 border-rose-400 shadow-rose-500`}></div>;
    if (product.quantity <= product.minimumStock) return <div title="Low Stock" className={`${baseClass} bg-amber-500 border-amber-400 shadow-amber-500 animate-pulse`}></div>;
    
    if (product.expiryDate) {
      const expiry = new Date(product.expiryDate);
      const today = new Date();
      if (expiry < today) return <div title="Expired" className={`${baseClass} bg-rose-500 border-rose-400 shadow-rose-500`}></div>;
    }
    
    return <div title="Available" className={`${baseClass} bg-emerald-500 border-emerald-400 shadow-emerald-500`}></div>;
  };

  const openDetails = async (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
    try {
      const res = await api.get(`/products/${product._id}`);
      setSelectedProduct(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['SKU', 'Name', 'Quantity', 'Min Stock', 'Unit Cost', 'Location'];
    const csvData = products.map(p => [
      p.sku, 
      `"${p.name}"`, 
      p.quantity, 
      p.minimumStock, 
      p.unitCost, 
      p.location || ''
    ].join(','));
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-1">Manage your warehouse stock, pricing, and locations.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 hover:shadow-md transition-all active:scale-95">
          <Plus size={18} strokeWidth={3} className="mr-2" /> Add Item
        </button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2.5 w-full md:w-96 border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text"
              placeholder="Search by SKU or Name..."
              className="bg-transparent border-none outline-none ml-3 w-full text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <Filter size={16} className="mr-2 text-slate-500" /> Filters
            </button>
            <button onClick={fetchProducts} className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
              <RefreshCw size={16} className="mr-2 text-slate-500" /> Refresh
            </button>
            <button onClick={exportToCSV} className="flex items-center px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors shadow-sm">
              <Download size={16} className="mr-2" /> Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading inventory data..." />
        ) : products.length > 0 ? (
          <div className="p-4 md:p-6 bg-slate-50/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
              {products.map((product, index) => {
                const isLowStock = product.quantity <= product.minimumStock && product.quantity > 0;
                const isOutOfStock = product.quantity === 0;

                return (
                  <div 
                    key={product._id} 
                    className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 border border-slate-200 flex flex-col hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                    style={{ animationDuration: '600ms', animationDelay: `${index * 50}ms` }}
                  >
                    {/* IMAGE HERO */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img 
                        src={product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&size=400`} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random&size=400` }}
                      />
                      {/* Overlays */}
                      <div className="absolute top-0 left-0 w-full p-2 md:p-3 flex justify-between items-start z-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent h-20 md:h-24 pointer-events-none">
                        <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-black/50 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold tracking-widest rounded md:rounded-md uppercase border border-white/20 shadow-sm shrink-0">
                          {product.sku}
                        </span>
                        <div className="mt-1 mr-1">{getStockBadge(product)}</div>
                      </div>
                      
                      {/* Hover Actions Panel */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-20">
                        <button onClick={() => openDetails(product)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-blue-600 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-xl" title="View Details">
                          <Eye size={20} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => openEditModal(product)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-emerald-500 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-xl" title="Edit">
                          <Edit size={20} strokeWidth={2.5} />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="w-12 h-12 rounded-full bg-white/10 hover:bg-rose-500 text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 shadow-xl" title="Delete">
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* DETAILS INFO */}
                    <div className="p-3 md:p-4 flex flex-col flex-1 relative bg-white">
                      <p className="text-[9px] md:text-[10px] font-bold text-blue-600 mb-1 md:mb-1.5 tracking-wider uppercase truncate">{product.categoryId?.name || 'Uncategorized'}</p>
                      <h3 className="font-extrabold text-slate-800 text-lg leading-tight mb-4 line-clamp-2">{product.name}</h3>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Stock</p>
                          <p className={`font-black text-base md:text-lg ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-500' : 'text-slate-800'}`}>
                            {product.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Cost</p>
                          <p className="font-bold text-emerald-600 text-sm md:text-base">${product.unitCost?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Indicator */}
                    <div className={`h-1.5 w-full ${isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-400' : 'bg-transparent'}`}></div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState title="Inventory is empty" description="Start by adding your first product to the system." />
        )}
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-800">{products.length}</span> items</p>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">Previous</button>
            <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Product Details" size="lg">
        {selectedProduct ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Basic Information</h3>
                <div className="space-y-4 text-sm">
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">SKU:</span> <span className="px-2 py-1 bg-slate-100 rounded-md font-mono font-bold text-slate-700 text-xs">{selectedProduct.sku}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Name:</span> <span className="font-bold text-slate-800 text-base">{selectedProduct.name}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Category:</span> <span className="font-semibold text-slate-700">{selectedProduct.categoryId?.name || '-'}</span></p>
                  <p className="flex justify-between items-start"><span className="text-slate-500 font-medium">Description:</span> <span className="text-slate-700 text-right w-2/3">{selectedProduct.description || 'No description provided.'}</span></p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Stock & Valuation</h3>
                <div className="space-y-4 text-sm">
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Status:</span> {getStockBadge(selectedProduct)}</p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Current Stock:</span> <span className="font-bold text-slate-800 text-lg">{selectedProduct.quantity} units</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Minimum Stock:</span> <span className="font-semibold text-slate-700">{selectedProduct.minimumStock} units</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500 font-medium">Unit Cost:</span> <span className="font-bold text-slate-700">${selectedProduct.unitCost?.toFixed(2)}</span></p>
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <p className="flex justify-between items-center"><span className="text-slate-600 font-bold">Total Value:</span> <span className="font-black text-emerald-600 text-xl">${(selectedProduct.quantity * selectedProduct.unitCost).toFixed(2)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics & Storage</h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Supplier</p>
                    {selectedProduct.supplierId ? (
                      <>
                        <p className="font-semibold text-indigo-900">{selectedProduct.supplierId.name}</p>
                        <p className="text-indigo-700 font-medium text-xs mt-1">{selectedProduct.supplierId.email || selectedProduct.supplierId.phone}</p>
                      </>
                    ) : <p className="text-slate-500 italic">No supplier assigned</p>}
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start space-x-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Warehouse Location</p>
                    {selectedProduct.warehouseId ? (
                      <>
                        <p className="font-semibold text-blue-900">{selectedProduct.warehouseId.name}</p>
                        <p className="text-blue-700 font-medium text-xs mt-1">Aisle: {selectedProduct.location || 'Unassigned'}</p>
                      </>
                    ) : <p className="text-slate-500 italic">No warehouse assigned</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Generation Section */}
            <div className="pt-6 mt-6 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inventory Tracking Label</h3>
                  <div className="bg-white border-2 border-dashed border-slate-300 p-4 rounded-xl flex flex-col items-center justify-center w-64">
                    <div className="h-12 w-full flex items-end justify-center mb-1 overflow-hidden opacity-80">
                      {selectedProduct.sku.split('').map((char, i) => (
                        <React.Fragment key={i}>
                          <div className={`h-full bg-slate-800 ${char.charCodeAt(0) % 2 === 0 ? 'w-1' : 'w-2'} mr-[1px]`}></div>
                          <div className={`h-full ${char.charCodeAt(0) % 3 === 0 ? 'w-1' : 'w-2'} mr-[1px]`}></div>
                          <div className={`h-full bg-slate-800 ${char.charCodeAt(0) % 4 === 0 ? 'w-1.5' : 'w-0.5'} mr-[1px]`}></div>
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="font-mono text-xs font-bold tracking-[0.2em] text-slate-600">{selectedProduct.sku}</p>
                  </div>
                </div>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm">
                  <Printer size={16} className="mr-2" /> Print Label
                </button>
              </div>
            </div>
            
          </div>
        ) : (
          <LoadingState message="Loading detailed product data..." />
        )}
      </Modal>

      <GenericFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        fields={productFields}
        initialData={editingProduct}
        endpoint="/products"
        method={editingProduct ? 'PUT' : 'POST'}
        onSuccess={fetchProducts}
      />
    </div>
  );
};

export default Inventory;
