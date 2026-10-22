import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, TrendingUp, AlertCircle, DollarSign, Clock, LayoutGrid, 
  ArrowRightLeft, ArrowUpRight, ArrowDownRight, Activity, Zap, RefreshCw,
  Plus, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, ChevronRight, Boxes,
  Layers, Warehouse, ExternalLink
} from 'lucide-react';
import { 
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

// Custom Tooltip for Chart
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5">
        <p className="font-bold text-slate-300 pb-1 border-b border-slate-800">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between space-x-4">
            <span className="flex items-center space-x-1.5 font-medium text-slate-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span>{item.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">{item.value} units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [movementFilter, setMovementFilter] = useState('ALL'); // ALL | IN | OUT
  const [data, setData] = useState({
    summary: null,
    trends: [],
    distribution: [],
    movements: [],
    alertsLow: [],
    alertsExpiring: []
  });

  const fetchDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setIsRefreshing(true);
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
      setError('Failed to load real-time analytics. Please check backend connection.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <LoadingState message="Aggregating live warehouse analytics..." />;
  if (error) return <ErrorState message={error} onRetry={() => fetchDashboardData(true)} />;

  const { summary, trends, distribution, movements, alertsLow, alertsExpiring } = data;

  const filteredMovements = movements?.filter(mov => {
    if (movementFilter === 'ALL') return true;
    return mov.type === movementFilter;
  }) || [];

  return (
    <div className="space-y-8 pb-12 animate-in select-none">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800/80">
        {/* Ambient Gradient Highlights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Command Center • Live Sync</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit']">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Real-time telemetry across your global inventory, replenishment triggers, and material dispatches.
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchDashboardData(false)}
              disabled={isRefreshing}
              title="Refresh Analytics"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>

            <Link
              to="/stock-in"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <ArrowDownToLine size={16} />
              <span>Stock IN</span>
            </Link>

            <Link
              to="/stock-out"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <ArrowUpFromLine size={16} />
              <span>Stock OUT</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5-Card KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        
        {/* 1. Total Products */}
        <Link to="/inventory" className="block group">
          <div className="h-full rounded-2xl p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20 group-hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                  <Package size={20} />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                  Catalog
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Products</p>
                <div className="flex items-baseline space-x-2 mt-1">
                  <h3 className="text-3xl font-black font-['Outfit'] tracking-tight">{summary?.totalProducts || 0}</h3>
                  <span className="text-xs text-blue-200 font-medium">SKUs</span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* 2. Total Units in Warehouses */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <Layers size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                OnHand
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Total Units</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-3xl font-black font-['Outfit'] tracking-tight">{(summary?.totalUnits || 0).toLocaleString()}</h3>
                <span className="text-xs text-indigo-200 font-medium">units</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Asset Valuation */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 backdrop-blur-md group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
                <DollarSign size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md uppercase tracking-wider">
                Valuation
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Asset Value</p>
              <div className="mt-1">
                <h3 className="text-3xl font-black font-['Outfit'] tracking-tight">
                  ${(summary?.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Low Stock */}
        <div className="rounded-2xl p-5 bg-white border border-amber-200/90 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:border-amber-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                Warning
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-3xl font-black font-['Outfit'] text-amber-600 tracking-tight">{summary?.lowStockCount || 0}</h3>
                <span className="text-xs text-amber-700 font-semibold">reorder items</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Out of Stock */}
        <div className="rounded-2xl p-5 bg-white border border-rose-200/90 shadow-sm relative overflow-hidden group hover:-translate-y-1 hover:border-rose-400 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
                <AlertCircle size={20} />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wider">
                Urgent
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3 className="text-3xl font-black font-['Outfit'] text-rose-600 tracking-tight">{summary?.outOfStockCount || 0}</h3>
                <span className="text-xs text-rose-700 font-semibold">critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Velocity Chart */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-['Outfit']">Stock Velocity</h2>
                <p className="text-xs text-slate-400 font-medium">Daily receive vs dispatch volume</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>IN</span>
                <span className="text-slate-300">|</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>OUT</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full flex-1 min-h-0">
            {trends && trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velocityIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="velocityOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                    dy={8} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="in" 
                    stroke="#3b82f6" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#velocityIn)" 
                    name="Stock Received" 
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#3b82f6' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="out" 
                    stroke="#f43f5e" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#velocityOut)" 
                    name="Stock Dispatched" 
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#f43f5e' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Velocity Data" description="Perform stock movements to generate telemetry." />
            )}
          </div>
        </div>

        {/* Category Allocation Donut Chart */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <LayoutGrid size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-['Outfit']">Capital Distribution</h2>
                <p className="text-xs text-slate-400 font-medium">Asset value grouped by product category</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
              Allocation
            </span>
          </div>

          <div className="h-72 w-full flex-1 min-h-0 flex items-center justify-center">
            {distribution && distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="totalValue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                        className="stroke-white stroke-2 hover:opacity-85 transition-opacity cursor-pointer outline-none" 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [`$${val.toLocaleString()}`, 'Valuation']}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                      fontSize: '12px',
                      fontWeight: 700 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Categories Valued" description="Add inventory categories with item pricing." />
            )}
          </div>

          {/* Clean Legend Chips */}
          {distribution && distribution.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100">
              {distribution.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}></span>
                  <span className="truncate max-w-[90px]">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lower Section: Interactive Activity Feed & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Activity Table */}
        <div className="xl:col-span-2 rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <ArrowRightLeft size={18} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-['Outfit']">Operations Audit Log</h2>
                <p className="text-xs text-slate-400 font-medium">Latest physical product movements</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMovementFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  movementFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setMovementFilter('IN')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  movementFilter === 'IN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Stock IN
              </button>
              <button
                type="button"
                onClick={() => setMovementFilter('OUT')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  movementFilter === 'OUT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Stock OUT
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            {filteredMovements && filteredMovements.length > 0 ? (
              <table className="w-full min-w-[550px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Action & Performer</th>
                    <th className="px-6 py-3.5">Item & SKU</th>
                    <th className="px-6 py-3.5 text-center">Volume</th>
                    <th className="px-6 py-3.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {filteredMovements.slice(0, 6).map((mov) => {
                    const isReceive = mov.type === 'IN';
                    return (
                      <tr key={mov._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isReceive 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                            }`}>
                              {isReceive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs sm:text-sm">
                                {isReceive ? 'Stock Received' : 'Stock Dispatched'}
                              </p>
                              <p className="text-[11px] text-slate-400 font-medium">by {mov.performedBy?.name || 'Admin User'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[180px]">
                            {mov.productId?.name || 'Inventory Item'}
                          </p>
                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {mov.productId?.sku || 'NO-SKU'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center font-black font-mono text-sm px-2.5 py-0.5 rounded-full ${
                            isReceive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isReceive ? '+' : '-'}{mov.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-medium text-slate-400 text-xs">
                          {new Date(mov.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <EmptyState title="No Movements Found" description="Select a different filter or record stock movements." />
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Showing latest {Math.min(filteredMovements.length, 6)} operations</span>
            <Link to="/reports" className="font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View Full Audit Trail</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Actionable Alerts Column */}
        <div className="space-y-6 flex flex-col">
          
          {/* Low Stock Replenishment Card */}
          <div className="rounded-3xl bg-white shadow-sm border border-amber-200/90 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 to-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">Restock Thresholds</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Critical minimum inventory</p>
                </div>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {alertsLow?.length || 0}
              </span>
            </div>

            <div className="p-5 space-y-3.5 flex-1">
              {alertsLow && alertsLow.length > 0 ? (
                alertsLow.slice(0, 4).map((item) => (
                  <div key={item._id} className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100 flex items-center justify-between group hover:border-amber-300 transition-all">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {item.quantity} units left
                        </span>
                        <span className="text-[10px] text-slate-400">Min: {item.minimumStock}</span>
                      </div>
                    </div>

                    <Link
                      to="/stock-in"
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                    >
                      Restock
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  ✨ All items are operating above replenishment thresholds.
                </div>
              )}
            </div>
          </div>

          {/* Expiring Batches Card */}
          <div className="rounded-3xl bg-white shadow-sm border border-indigo-200/90 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit']">Expiring Batches</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Upcoming 30-day expiries</p>
                </div>
              </div>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {alertsExpiring?.length || 0}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1">
              {alertsExpiring && alertsExpiring.length > 0 ? (
                alertsExpiring.slice(0, 4).map((item) => (
                  <div key={item._id} className="p-3 rounded-2xl bg-indigo-50/30 border border-indigo-100 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                        Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {item.quantity} pcs
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  🛡️ No items expiring within the next 30 days.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

