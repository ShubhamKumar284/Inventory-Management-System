import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { FileText, Download, Filter, BarChart } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState('inventory'); // 'inventory' or 'movements'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    supplier: '',
    warehouse: '',
    category: '', // for inventory
    lowStock: false, // for inventory
    type: '', // IN or OUT for movements
    startDate: '',
    endDate: ''
  });

  const [metadata, setMetadata] = useState({ suppliers: [], warehouses: [], categories: [] });

  // Fetch filter options once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [sup, war, cat] = await Promise.all([
          api.get('/suppliers').catch(() => ({ data: { data: [] }})),
          api.get('/warehouses').catch(() => ({ data: { data: [] }})),
          api.get('/categories').catch(() => ({ data: { data: [] }})) // Optional if categories exist
        ]);
        setMetadata({
          suppliers: sup.data.data || [],
          warehouses: war.data.data || [],
          categories: cat.data.data || []
        });
      } catch (err) { console.error(err); }
    };
    fetchMetadata();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'inventory') {
        const query = new URLSearchParams();
        query.append('limit', '1000');
        if (filters.supplier) query.append('supplier', filters.supplier);
        if (filters.warehouse) query.append('warehouse', filters.warehouse);
        if (filters.category) query.append('category', filters.category);
        if (filters.lowStock) query.append('lowStock', 'true');
        
        const res = await api.get(`/products?${query.toString()}`);
        setData(res.data.data.products);
      } else {
        const query = new URLSearchParams();
        query.append('limit', '1000');
        if (filters.type) query.append('type', filters.type);
        if (filters.startDate) query.append('startDate', filters.startDate);
        if (filters.endDate) query.append('endDate', filters.endDate);
        
        const res = await api.get(`/stock/movements?${query.toString()}`);
        setData(res.data.data.movements || res.data.data); // depending on how API is structured
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch automatically on mount and when reportType changes
  useEffect(() => {
    // Reset relevant filters when switching
    if (reportType === 'inventory') {
      setFilters(prev => ({ ...prev, type: '', startDate: '', endDate: '' }));
    } else {
      setFilters(prev => ({ ...prev, supplier: '', warehouse: '', category: '', lowStock: false }));
    }
    fetchReport();
  }, [reportType]);

  const handleFilterChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFilters({ ...filters, [e.target.name]: value });
  };

  const exportCSV = () => {
    if (!data.length) return;
    
    let csv = '';
    
    if (reportType === 'inventory') {
      const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Min Stock', 'Unit Cost', 'Total Value', 'Warehouse', 'Supplier'];
      csv += headers.join(',') + '\n';
      data.forEach(row => {
        csv += [
          row.sku,
          `"${row.name}"`, // Quote strings that might contain commas
          row.categoryId?.name || '-',
          row.quantity,
          row.minimumStock,
          row.unitCost,
          (row.quantity * row.unitCost).toFixed(2),
          `"${row.warehouseId?.name || '-'}"`,
          `"${row.supplierId?.name || '-'}"`
        ].join(',') + '\n';
      });
    } else {
      const headers = ['Date', 'Time', 'Type', 'Product', 'Quantity', 'Performed By', 'Reference'];
      csv += headers.join(',') + '\n';
      data.forEach(row => {
        const dateObj = new Date(row.timestamp);
        csv += [
          dateObj.toLocaleDateString(),
          dateObj.toLocaleTimeString(),
          row.type,
          `"${row.productId?.name || '-'}"`,
          row.quantity,
          `"${row.performedBy?.name || '-'}"`,
          `"${row.referenceNumber || '-'}"`
        ].join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_inventory_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Quick stats calculations
  const totalValue = reportType === 'inventory' 
    ? data.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0)
    : null;
    
  const totalItems = reportType === 'inventory' 
    ? data.reduce((acc, curr) => acc + curr.quantity, 0)
    : data.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center tracking-tight">
            <BarChart className="mr-3 text-purple-600" size={32} strokeWidth={2.5} /> 
            Analytics & Reports
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Generate custom reports, apply filters, and export data.</p>
        </div>
        <button 
          onClick={exportCSV}
          disabled={loading || data.length === 0}
          className="flex items-center justify-center px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold shadow-sm shadow-slate-300 hover:bg-slate-900 hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} className="mr-2" strokeWidth={2.5} /> Export CSV
        </button>
      </div>

      <Card className="p-0 overflow-hidden border-t-4 border-t-purple-500 shadow-md flex flex-col">
        {/* Report Type Selector */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex space-x-3">
            <button 
              onClick={() => setReportType('inventory')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${reportType === 'inventory' ? 'bg-purple-100 text-purple-800 shadow-sm border border-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Inventory Balances
            </button>
            <button 
              onClick={() => setReportType('movements')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${reportType === 'movements' ? 'bg-purple-100 text-purple-800 shadow-sm border border-purple-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Stock Movements & Audit
            </button>
          </div>
        </div>

        {/* Dynamic Filters Panel */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-end">
          {reportType === 'inventory' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Warehouse</label>
                <select name="warehouse" value={filters.warehouse} onChange={handleFilterChange} className="block w-48 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">All Warehouses</option>
                  {metadata.warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier</label>
                <select name="supplier" value={filters.supplier} onChange={handleFilterChange} className="block w-48 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">All Suppliers</option>
                  {metadata.suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select name="category" value={filters.category} onChange={handleFilterChange} className="block w-48 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">All Categories</option>
                  {metadata.categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-2 h-[42px] px-2">
                <input type="checkbox" id="lowStock" name="lowStock" checked={filters.lowStock} onChange={handleFilterChange} className="rounded text-purple-600 w-4 h-4 focus:ring-purple-500" />
                <label htmlFor="lowStock" className="text-sm font-bold text-slate-700 cursor-pointer">Low Stock Only</label>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="block w-40 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none">
                  <option value="">All Movements</option>
                  <option value="IN">Stock IN</option>
                  <option value="OUT">Stock OUT</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="block w-40 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="block w-40 p-2.5 text-sm font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>
            </>
          )}
          
          <button onClick={fetchReport} className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 h-[42px] flex items-center shadow-sm transition-colors ml-auto md:ml-0">
            <Filter size={16} className="mr-2" /> Run Report
          </button>
        </div>
        
        {/* Quick Stats Bar */}
        {!loading && data.length > 0 && (
          <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100 flex gap-8">
             <p className="text-sm font-medium text-slate-600">Total Rows: <span className="font-bold text-slate-800 ml-1">{data.length}</span></p>
             <p className="text-sm font-medium text-slate-600">Total Units: <span className="font-bold text-slate-800 ml-1">{totalItems.toLocaleString()}</span></p>
             {totalValue !== null && (
               <p className="text-sm font-medium text-slate-600">Total Valuation: <span className="font-bold text-emerald-600 ml-1">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></p>
             )}
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? <LoadingState message="Querying database..." /> : data.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white uppercase border-b border-slate-200">
                {reportType === 'inventory' ? (
                  <tr>
                    <th className="px-6 py-4 font-bold">SKU & Item</th>
                    <th className="px-6 py-4 font-bold">Category</th>
                    <th className="px-6 py-4 font-bold text-right">Quantity</th>
                    <th className="px-6 py-4 font-bold text-right">Total Value</th>
                    <th className="px-6 py-4 font-bold">Warehouse</th>
                    <th className="px-6 py-4 font-bold">Supplier</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 font-bold">Date & Time</th>
                    <th className="px-6 py-4 font-bold text-center">Type</th>
                    <th className="px-6 py-4 font-bold">Product</th>
                    <th className="px-6 py-4 font-bold text-right">Qty</th>
                    <th className="px-6 py-4 font-bold">Performed By</th>
                    <th className="px-6 py-4 font-bold">Reference</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reportType === 'inventory' ? data.map(item => (
                  <tr key={item._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs font-mono font-medium text-slate-400 mt-0.5">{item.sku}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-600 font-medium">{item.categoryId?.name || '-'}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`font-bold text-base ${item.quantity <= item.minimumStock ? 'text-rose-600' : 'text-slate-800'}`}>{item.quantity}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-600">${(item.quantity * item.unitCost).toFixed(2)}</td>
                    <td className="px-6 py-3 text-slate-600 font-medium">{item.warehouseId?.name || '-'}</td>
                    <td className="px-6 py-3 text-slate-600 font-medium">{item.supplierId?.name || '-'}</td>
                  </tr>
                )) : data.map(mov => (
                  <tr key={mov._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-slate-700">{new Date(mov.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{new Date(mov.timestamp).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest ${mov.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-800">{mov.productId?.name || 'Unknown Item'}</td>
                    <td className="px-6 py-3 text-right font-bold text-slate-800 text-base">{mov.quantity}</td>
                    <td className="px-6 py-3 text-slate-600 font-medium">{mov.performedBy?.name || '-'}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{mov.referenceNumber || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState title="No Data Found" description="Try adjusting your filters or date ranges." />}
        </div>
      </Card>
    </div>
  );
};
export default Reports;
