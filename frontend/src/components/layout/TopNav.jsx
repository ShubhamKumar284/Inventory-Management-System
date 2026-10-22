import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, Search, Shield, Zap, Sparkles, User, Settings, 
  LogOut, ChevronDown, CheckCircle2, ShieldCheck, ArrowRight,
  AlertTriangle, AlertCircle, Clock, ArrowDownToLine, ArrowUpFromLine,
  Check, X, RefreshCw, ExternalLink, Menu, Loader2, Package, Truck,
  Warehouse, FileText, CornerDownLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const TopNav = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState('all'); // 'all' | 'alerts' | 'activity'
  
  // Global Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Quick Action Navigation Items
  const quickActions = [
    { title: 'Inventory Catalog', path: '/inventory', icon: Package, badge: 'Stock List', keywords: ['inventory', 'product', 'items', 'catalog', 'sku'] },
    { title: 'Stock IN (Receive Material)', path: '/stock-in', icon: ArrowDownToLine, badge: 'Inbound', keywords: ['stock in', 'receive', 'inbound', 'add stock'] },
    { title: 'Stock OUT (Dispatch Material)', path: '/stock-out', icon: ArrowUpFromLine, badge: 'Outbound', keywords: ['stock out', 'dispatch', 'outbound', 'ship', 'order'] },
    { title: 'Supplier Directory', path: '/suppliers', icon: Truck, badge: 'Vendors', keywords: ['supplier', 'vendor', 'partners', 'contacts'] },
    { title: 'Warehouse Storage Facilities', path: '/warehouses', icon: Warehouse, badge: 'Locations', keywords: ['warehouse', 'facilities', 'storage', 'depot'] },
    { title: 'Reports & Compliance Audit', path: '/reports', icon: FileText, badge: 'Analytics', keywords: ['reports', 'analytics', 'audit', 'export', 'csv'] },
    { title: 'User Profile & Settings', path: '/profile', icon: User, badge: 'Account', keywords: ['profile', 'user', 'settings', 'account', 'password'] },
  ];

  const filteredActions = quickActions.filter(action => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (action.title.toLowerCase().includes(q)) return true;
    return action.keywords.some(k => k.includes(q));
  });

  // Live Notification Items
  const [notifications, setNotifications] = useState([
    {
      id: 'sys-1',
      type: 'SECURITY',
      title: 'Active Session Authenticated',
      description: 'You are signed in with Enterprise Administrator privileges.',
      time: 'Just now',
      read: false,
      link: '/profile'
    },
    {
      id: 'stock-1',
      type: 'LOW_STOCK',
      title: 'Low Stock Threshold Reached',
      description: 'Key stock items are operating near or below reorder levels.',
      time: '12m ago',
      read: false,
      link: '/stock-in'
    },
    {
      id: 'mov-1',
      type: 'ACTIVITY',
      title: 'Warehouse Telemetry Synchronized',
      description: 'Real-time database connection established with 100% health.',
      time: '24m ago',
      read: false,
      link: '/'
    }
  ]);

  // Fetch real alerts to enrich notification list
  useEffect(() => {
    const fetchLiveAlerts = async () => {
      try {
        const [lowRes, outRes] = await Promise.allSettled([
          api.get('/alerts/low-stock'),
          api.get('/alerts/out-of-stock')
        ]);

        const fetched = [];
        
        if (outRes.status === 'fulfilled' && outRes.value.data?.data) {
          outRes.value.data.data.slice(0, 3).forEach((item) => {
            fetched.push({
              id: `out-${item._id}`,
              type: 'OUT_OF_STOCK',
              title: `Critical Out of Stock: ${item.name}`,
              description: `Zero units remaining in warehouse. Immediate replenishment recommended.`,
              time: 'Recent',
              read: false,
              link: '/stock-in'
            });
          });
        }

        if (lowRes.status === 'fulfilled' && lowRes.data?.data || lowRes.value?.data?.data) {
          const items = lowRes.value?.data?.data || [];
          items.slice(0, 3).forEach((item) => {
            fetched.push({
              id: `low-${item._id}`,
              type: 'LOW_STOCK',
              title: `Restock Alert: ${item.name}`,
              description: `Only ${item.quantity} units remaining (Minimum threshold: ${item.minimumStock}).`,
              time: 'Recent',
              read: false,
              link: '/stock-in'
            });
          });
        }

        if (fetched.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newItems = fetched.filter(f => !existingIds.has(f.id));
            return [...newItems, ...prev];
          });
        }
      } catch (err) {
        // Fallback gracefully to default alerts
      }
    };

    fetchLiveAlerts();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K to focus, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns and search on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live debounced product search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/products?limit=6&search=${encodeURIComponent(trimmed)}`);
        const items = res.data?.data?.products || res.data?.data || [];
        setSearchResults(items);
      } catch (err) {
        console.error('Failed to search products:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleSelectProduct = (product) => {
    navigate(`/inventory?search=${encodeURIComponent(product.sku || product.name)}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSelectAction = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
  };

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    if (notificationTab === 'alerts') return n.type === 'LOW_STOCK' || n.type === 'OUT_OF_STOCK';
    if (notificationTab === 'activity') return n.type === 'ACTIVITY' || n.type === 'SECURITY';
    return true;
  });

  // Helper to format role text
  const formatRole = (role) => {
    if (!role) return 'Admin';
    return role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 shrink-0 transition-all">
      {/* Left: Mobile Menu Toggle + Search Bar with Command Palette */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0 pr-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle mobile menu"
          title="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Input & Dropdown Container */}
        <div className="relative flex-1 max-w-[210px] xs:max-w-xs sm:max-w-sm md:w-80 lg:w-[420px]" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className={`flex items-center rounded-xl px-3 sm:px-3.5 py-2 w-full border transition-all shadow-xs ${
              searchOpen 
                ? 'bg-white border-blue-500 ring-4 ring-blue-500/10' 
                : 'bg-slate-100/80 hover:bg-slate-100 border-slate-200/60'
            }`}>
              <Search size={16} className={`shrink-0 transition-colors ${searchOpen ? 'text-blue-600' : 'text-slate-400'}`} />
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products, SKUs, actions..."
                className="bg-transparent border-none outline-none ml-2 w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium truncate"
              />
              
              {searchLoading && (
                <Loader2 size={15} className="animate-spin text-blue-500 shrink-0 ml-1" />
              )}

              {searchQuery && !searchLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors shrink-0"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              <kbd 
                onClick={() => {
                  searchInputRef.current?.focus();
                  setSearchOpen(true);
                }}
                className="hidden md:inline-flex items-center space-x-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-white rounded border border-slate-200 shadow-2xs shrink-0 ml-1 cursor-pointer hover:bg-slate-50 hover:text-slate-600 transition-colors"
                title="Press Ctrl+K to search"
              >
                <span>Ctrl</span>
                <span>K</span>
              </kbd>
            </div>
          </form>

          {/* Live Search Results Dropdown Panel */}
          {searchOpen && (
            <div className="fixed inset-x-3 top-18 sm:absolute sm:inset-auto sm:left-0 sm:top-full sm:mt-2 w-auto sm:w-[480px] md:w-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in divide-y divide-slate-100">
              
              {/* Header Info */}
              <div className="px-4 py-2.5 bg-slate-50/80 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center space-x-1.5 font-['Outfit']">
                  <Sparkles size={13} className="text-blue-500" />
                  <span>
                    {searchQuery.trim() 
                      ? `Search Results for "${searchQuery.trim()}"` 
                      : 'Quick System Actions & Catalog'}
                  </span>
                </span>
                {searchQuery && searchResults.length > 0 && (
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                  </span>
                )}
              </div>

              {/* Matched Products List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100/80">
                {searchLoading ? (
                  <div className="py-8 px-4 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <Loader2 size={24} className="animate-spin text-blue-600" />
                    <span className="text-xs font-medium">Scanning catalog & stock inventory...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <p className="px-2.5 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Products ({searchResults.length})
                    </p>
                    {searchResults.map((product) => {
                      const isOutOfStock = product.quantity === 0;
                      const isLowStock = product.quantity <= (product.minimumStock || 5) && !isOutOfStock;

                      return (
                        <div
                          key={product._id}
                          onClick={() => handleSelectProduct(product)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/80 cursor-pointer group transition-all"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`; }}
                                />
                              ) : (
                                <Package size={18} className="text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                {product.name}
                              </p>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {product.sku}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  {product.categoryId?.name || 'Item'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-3">
                            <p className="font-bold text-xs sm:text-sm text-slate-900 font-mono">
                              ${product.unitCost?.toFixed(2)}
                            </p>
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 ${
                              isOutOfStock 
                                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                : isLowStock 
                                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isOutOfStock ? 'Out of stock' : `${product.quantity} in stock`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-8 px-4 text-center">
                    <p className="text-xs text-slate-600 font-bold">No product match found for "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">Press Enter to view all inventory or explore quick links below.</p>
                  </div>
                ) : null}

                {/* Quick System Navigation Actions */}
                {filteredActions.length > 0 && (
                  <div className="p-2 space-y-1 bg-slate-50/40">
                    <p className="px-2.5 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Quick Navigation
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {filteredActions.slice(0, 4).map((action) => {
                        const Icon = action.icon;
                        return (
                          <div
                            key={action.path}
                            onClick={() => handleSelectAction(action.path)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200/80 cursor-pointer group transition-all"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                <Icon size={14} />
                              </div>
                              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors truncate">
                                {action.title}
                              </span>
                            </div>
                            <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 flex items-center justify-between text-[11px] font-medium text-slate-500">
                <div className="flex items-center space-x-3">
                  <span className="hidden sm:inline-flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200">↵</kbd>
                    <span>to search catalog</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-200">Esc</kbd>
                    <span>to dismiss</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/inventory?search=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 hover:underline ml-auto cursor-pointer"
                >
                  <span>Open in Inventory</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Real-time Status Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync</span>
        </div>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notificationsRef}>
          <button 
            id="notification-bell-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setNotificationsOpen(prev => !prev);
              setDropdownOpen(false);
            }}
            title="System Notifications"
            aria-label="Toggle notifications panel"
            className={`relative p-2.5 rounded-xl transition-all border active:scale-95 cursor-pointer select-none ${
              notificationsOpen 
                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs ring-2 ring-blue-500/20' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 border-2 border-white"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="fixed inset-x-3 top-18 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-96 max-w-sm sm:max-w-md mx-auto sm:mx-0 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-slate-900 font-['Outfit']">Notifications</span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px]">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px]">
                      Caught up
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Check size={12} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex px-3 pt-2 bg-slate-50/40 border-b border-slate-100 space-x-1">
                <button
                  type="button"
                  onClick={() => setNotificationTab('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    notificationTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationTab('alerts')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    notificationTab === 'alerts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Alerts
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationTab('activity')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    notificationTab === 'activity' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif) => {
                    const isOutOfStock = notif.type === 'OUT_OF_STOCK';
                    const isLowStock = notif.type === 'LOW_STOCK';
                    const isSecurity = notif.type === 'SECURITY';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => markSingleAsRead(notif.id)}
                        className={`p-3.5 flex items-start space-x-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isOutOfStock ? 'bg-rose-100 text-rose-600' :
                          isLowStock ? 'bg-amber-100 text-amber-600' :
                          isSecurity ? 'bg-indigo-100 text-indigo-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {isOutOfStock ? <AlertCircle size={16} /> :
                           isLowStock ? <AlertTriangle size={16} /> :
                           isSecurity ? <ShieldCheck size={16} /> :
                           <Zap size={16} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.description}</p>
                          
                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={() => setNotificationsOpen(false)}
                              className="inline-flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 mt-1.5"
                            >
                              <span>{isLowStock || isOutOfStock ? 'Restock Stock →' : 'View Details →'}</span>
                            </Link>
                          )}
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-medium">
                    No notifications in this view.
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 text-center">
                <Link
                  to="/inventory"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center space-x-1"
                >
                  <span>View All Inventory Telemetry</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Container with Dropdown Menu */}
        <div className="relative pl-3 sm:pl-4 border-l border-slate-200/80" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotificationsOpen(false);
            }}
            type="button"
            className="flex items-center space-x-3 text-left focus:outline-none p-1.5 rounded-2xl hover:bg-slate-100/80 transition-all cursor-pointer group"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/25 ring-2 ring-white group-hover:scale-105 transition-transform">
                {getInitials(user?.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="hidden sm:block">
              <p className="font-bold text-xs text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                {formatRole(user?.role)}
              </p>
            </div>

            <ChevronDown size={14} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Modern Profile Dropdown Card */}
          {dropdownOpen && (
            <div className="fixed inset-x-3 top-18 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-72 max-w-sm mx-auto sm:mx-0 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 text-slate-800 z-50 animate-in">
              {/* User Overview Header */}
              <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-100 mb-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25 shrink-0">
                    {getInitials(user?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@example.com'}</p>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase tracking-wider mt-1">
                      <ShieldCheck size={10} />
                      <span>{formatRole(user?.role)}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-0.5 py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <User size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>View Profile & Account</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Settings size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>Security & Permissions</span>
                  </div>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-1 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;


