import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, TrendingUp, AlertCircle, DollarSign, Clock, LayoutGrid, 
  ArrowRightLeft, ArrowUpRight, ArrowDownRight, Activity, Zap 
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0ea5e9'];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: null,
    trends: [],
    distribution: [],
    movements: [],
    alertsLow: [],
    alertsExpiring: []
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendsRes, distRes, movementsRes, lowStockRes, expiringRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/stock-trends'),
        api.get('/dashboard/category-distribution'),
        api.get('/dashboard/recent-movements'),
        api.get('/alerts/low-stock'),
        api.get('/alerts/expiring')
      ]);

      setData({
        summary: summaryRes.data.data,
        trends: trendsRes.data.data,
        distribution: distRes.data.data,
        movements: movementsRes.data.data,
        alertsLow: lowStockRes.data.data,
        alertsExpiring: expiringRes.data.data
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load live dashboard analytics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <LoadingState message="Compiling real-time analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  const { summary, trends, distribution, movements, alertsLow, alertsExpiring } = data;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section with personalized greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold tracking-wide uppercase mb-3">
            <Zap size={14} className="fill-blue-600" />
            <span>Live Overview</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Here is what's happening with your inventory today.</p>
        </div>
      </div>

      {/* Premium Gradient Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg shadow-blue-500/20 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Package size={24} className="text-white" /></div>
              <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">+12%</span>
            </div>
            <p className="text-blue-100 font-semibold mb-1 uppercase tracking-wider text-xs">Total Products</p>
            <h3 className="text-3xl font-black">{summary?.totalProducts || 0}</h3>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white shadow-lg shadow-indigo-500/20 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><LayoutGrid size={24} className="text-white" /></div>
              <span className="flex items-center text-xs font-bold bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">+8%</span>
            </div>
            <p className="text-indigo-100 font-semibold mb-1 uppercase tracking-wider text-xs">Total Units</p>
            <h3 className="text-3xl font-black">{summary?.totalUnits || 0}</h3>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 border-none text-white shadow-lg shadow-emerald-500/20 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><DollarSign size={24} className="text-white" /></div>
            </div>
            <p className="text-emerald-100 font-semibold mb-1 uppercase tracking-wider text-xs">Asset Value</p>
            <h3 className="text-3xl font-black">${(summary?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white border border-amber-200 shadow-lg shadow-amber-500/5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><TrendingUp size={24} /></div>
            </div>
            <p className="text-slate-500 font-semibold mb-1 uppercase tracking-wider text-xs">Low Stock</p>
            <h3 className="text-3xl font-black text-amber-600">{summary?.lowStockCount || 0}</h3>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-white border border-rose-200 shadow-lg shadow-rose-500/5 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 transition-transform"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-rose-100 rounded-xl text-rose-600"><AlertCircle size={24} /></div>
            </div>
            <p className="text-slate-500 font-semibold mb-1 uppercase tracking-wider text-xs">Out of Stock</p>
            <h3 className="text-3xl font-black text-rose-600">{summary?.outOfStockCount || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <Activity size={18} className="mr-2 text-blue-500" /> Movement Velocity
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Last 30 Days</span>
          </div>
          <div className="h-80 w-full flex-1 min-h-0">
            {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="in" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" name="Stock IN" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                  <Area type="monotone" dataKey="out" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" name="Stock OUT" activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Velocity Data" description="Perform stock movements to generate charts." />
            )}
          </div>
        </Card>

        <Card className="flex flex-col shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <LayoutGrid size={18} className="mr-2 text-indigo-500" /> Capital Allocation
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">By Category</span>
          </div>
          <div className="h-80 w-full flex-1 min-h-0">
            {distribution && distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="totalValue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-transparent hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value.toLocaleString()}`} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                  />
                  <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Distribution Data" description="Add valued products to view allocation." />
            )}
          </div>
        </Card>
      </div>

      {/* Lower Section: Data Grid & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Modern Activity Feed / Table */}
        <Card className="xl:col-span-2 shadow-sm border border-slate-100 p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center">
              <ArrowRightLeft size={18} className="mr-2 text-slate-400" /> Activity Log
            </h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            {movements && movements.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-slate-50 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Volume</th>
                    <th className="px-6 py-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {movements.map((mov) => (
                    <tr key={mov._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-sm ${mov.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {mov.type === 'IN' ? <ArrowDownRight size={18} strokeWidth={3} /> : <ArrowUpRight size={18} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{mov.type === 'IN' ? 'Stock Receive' : 'Stock Dispatch'}</p>
                            <p className="text-xs font-medium text-slate-500">by {mov.performedBy?.name || 'System'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{mov.productId?.name || 'Unknown Item'}</p>
                        <p className="text-xs font-mono font-bold text-slate-400">{mov.productId?.sku || 'NO-SKU'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black text-base ${mov.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mov.type === 'IN' ? '+' : '-'}{mov.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(mov.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6"><EmptyState title="No Activity" description="No recent stock operations found." /></div>
            )}
          </div>
        </Card>

        {/* Actionable Alerts Stack */}
        <div className="space-y-6 flex flex-col">
          <Card className="flex-1 shadow-sm border border-amber-100 bg-gradient-to-b from-white to-amber-50/30 p-0 overflow-hidden">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-white">
              <h2 className="text-base font-bold text-slate-800 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <AlertCircle size={16} className="text-amber-600" />
                </div>
                Restock Required
              </h2>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{alertsLow?.length || 0}</span>
            </div>
            <div className="p-5 space-y-4">
              {alertsLow && alertsLow.length > 0 ? (
                alertsLow.slice(0, 4).map((item) => (
                  <div key={item._id} className="flex justify-between items-center group">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{item.quantity} left</span>
                        <span className="text-xs font-medium text-slate-400 ml-2">Min: {item.minimumStock}</span>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg shrink-0">
                      Restock
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState title="Optimal Levels" description="No low stock items." />
              )}
            </div>
          </Card>

          <Card className="flex-1 shadow-sm border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/30 p-0 overflow-hidden">
            <div className="p-5 border-b border-indigo-100 flex items-center justify-between bg-white">
              <h2 className="text-base font-bold text-slate-800 flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Clock size={16} className="text-indigo-600" />
                </div>
                Expiring Soon
              </h2>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">{alertsExpiring?.length || 0}</span>
            </div>
            <div className="p-5 space-y-4">
              {alertsExpiring && alertsExpiring.length > 0 ? (
                alertsExpiring.slice(0, 4).map((item) => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs font-medium text-indigo-600 mt-1">
                        Expires: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="All Fresh" description="No items expiring in 30 days." />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
