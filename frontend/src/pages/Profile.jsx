import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Phone, Building2, Shield, ShieldCheck, KeyRound, 
  Clock, Calendar, CheckCircle2, AlertCircle, Copy, Check, Save, 
  Sparkles, Lock, ArrowLeft, ExternalLink, Laptop, MapPin, Eye, EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, updateUserProfile, fetchCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'permissions' | 'security'
  
  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (fetchCurrentUser) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setDepartment(user.department || 'Warehouse Operations & Logistics');
      setBio(user.bio || 'Managing inventory velocity and cross-docking operations.');
    }
  }, [user]);

  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const payload = {
        name,
        phone,
        department,
        bio
      };

      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        payload.password = newPassword;
      }

      await updateUserProfile(payload);
      setSuccessMessage('Profile information saved successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get initials
  const getInitials = (userName) => {
    if (!userName) return 'SA';
    const parts = userName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) return 'Administrator';
    return role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  const permissionsList = [
    { title: 'Full Inventory Control', desc: 'Add, update, adjust prices, and decommission catalog SKUs.', granted: true },
    { title: 'Warehouse Dispatch (IN/OUT)', desc: 'Execute real-time inbound logistics and customer order fulfillments.', granted: true },
    { title: 'Multi-Warehouse Allocation', desc: 'Transfer units across regional distribution fulfillment centers.', granted: user?.role === 'ADMIN' },
    { title: 'Financial Asset Telemetry', desc: 'Inspect cost valuation, COGS margins, and dynamic revenue metrics.', granted: true },
    { title: 'Supplier Contract Management', desc: 'Register vendor profiles, track lead times, and dispatch restock POs.', granted: user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER' },
    { title: 'Audit Trail & Compliance', desc: 'Export SOC-2 compliant inventory transaction logs with user attribution.', granted: true },
  ];

  return (
    <div className="space-y-8 pb-16 animate-in max-w-6xl mx-auto select-none">
      
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center space-x-1">
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-600">Account Profile</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
            User Profile & Settings
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage your personal identity, security credentials, and organization permissions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Session</span>
          </div>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl shadow-blue-500/30 border-2 border-white/20">
                {getInitials(user?.name)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white" title="Verified Active">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  {user?.name || 'Administrator'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck size={12} className="text-blue-300" />
                  <span>{formatRole(user?.role)}</span>
                </span>
              </div>
              
              <p className="text-slate-300 text-sm font-medium flex items-center space-x-2">
                <Mail size={14} className="text-slate-400" />
                <span>{user?.email || 'admin@example.com'}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                <span className="flex items-center space-x-1.5">
                  <Building2 size={13} className="text-slate-500" />
                  <span>{department || 'Warehouse Operations'}</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Calendar size={13} className="text-slate-500" />
                  <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Oct 2026'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* User ID Token Pill */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unique User ID</span>
            <div className="flex items-center space-x-2">
              <code className="text-xs font-mono font-bold text-slate-200">
                {user?._id ? `${user._id.slice(0, 8)}...${user._id.slice(-6)}` : 'USR-DEFAULT'}
              </code>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Copy Full ID"
              >
                {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center space-x-2.5 animate-in shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm font-semibold flex items-center space-x-2.5 animate-in shadow-xs">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'general'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} />
          <span>General Information</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Role & Permissions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound size={16} />
          <span>Security & Sessions</span>
        </button>
      </div>

      {/* TAB 1: General Info */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Display Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Verified</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                  <Phone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Department / Division</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium"
                  placeholder="Warehouse Logistics"
                />
              </div>
            </div>

            {/* Bio / Operational Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Bio & Role Responsibilities</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="block w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white transition-all text-sm font-medium leading-relaxed"
                placeholder="Briefly describe your warehouse role and daily responsibilities..."
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Role & Permissions */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-in">
          {/* Active Role Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
                  Role: {formatRole(user?.role)}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Governed by Enterprise Role-Based Access Control (RBAC) policies.
                </p>
              </div>
            </div>

            <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              Privileges Active
            </span>
          </div>

          {/* Permissions Matrix */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/60">
              <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit'] uppercase tracking-wider">
                Assigned Operational Entitlements
              </h4>
            </div>

            <div className="divide-y divide-slate-100">
              {permissionsList.map((perm, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-start justify-between space-x-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">{perm.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{perm.desc}</p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {perm.granted ? (
                      <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Check size={12} strokeWidth={3} />
                        <span>Granted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        <span>Restricted</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Sessions */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in">
          {/* Change Password Card */}
          <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">Change Password</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Ensure your account is protected with a secure password of at least 6 characters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 focus:bg-white text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <KeyRound size={14} />
              <span>Update Password</span>
            </button>
          </form>

          {/* Active Sessions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">Active Devices & Sessions</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Devices currently logged into your SmartInventory workspace account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 border border-slate-200 flex items-center justify-center shadow-xs">
                  <Laptop size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-bold text-slate-800">Current Web Session (Windows / Chrome)</p>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">This Device</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                    <span className="flex items-center space-x-1">
                      <MapPin size={11} />
                      <span>Authenticated via JWT</span>
                    </span>
                    <span>•</span>
                    <span>Active Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
