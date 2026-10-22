import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Package, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, 
  AlertTriangle, KeyRound, ShieldCheck, CheckCircle2, ArrowLeft, X,
  Eye, EyeOff, Boxes, Activity, Zap, TrendingUp, Shield
} from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { login, register, googleLogin, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingMessage(isLogin ? 'Authenticating your session...' : 'Setting up your workspace...');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const fillDefaultCredentials = () => {
    setIsLogin(true);
    setEmail('admin@example.com');
    setPassword('password123');
    setError('');
  };

  const handleQuickAdminLogin = async () => {
    setIsLogin(true);
    setEmail('admin@example.com');
    setPassword('password123');
    setError('');
    setIsLoading(true);
    setLoadingMessage('Logging in as System Administrator...');

    try {
      await login('admin@example.com', 'password123');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please verify server connection.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  // Forgot Password Modal State & Handlers
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const openForgotPasswordModal = () => {
    setForgotEmail(email || '');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setDemoCode('');
    setForgotStep(1);
    setShowForgotModal(true);
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await forgotPassword(forgotEmail);
      if (res.data?.resetCode) {
        setDemoCode(res.data.resetCode);
        setResetCode(res.data.resetCode); // Pre-fill code for effortless testing
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request reset code. Check if email is valid.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setForgotError('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotError('');
    setForgotLoading(true);

    try {
      await resetPassword(forgotEmail, resetCode, newPassword);
      setForgotStep(3);
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check the code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex selection:bg-blue-600 selection:text-white">
      {/* Left Showcase Side (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 items-center justify-center p-12 select-none border-r border-slate-800/60">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/25 rounded-full blur-[140px] animate-glow-pulse pointer-events-none"></div>
        <div className="absolute bottom-10 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-[130px] animate-float-slow pointer-events-none"></div>
        <div className="absolute -top-10 right-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none"></div>

        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="relative z-10 w-full max-w-lg space-y-10">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-xl shadow-blue-500/30 border border-white/20">
              <Package className="text-white" size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-['Outfit']">Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Inventory</span></span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider">v2.0</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Enterprise Supply Chain & Warehouse OS</p>
            </div>
          </div>

          {/* Value Prop Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] tracking-tight font-['Outfit']">
              Intelligent inventory telemetry for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">modern logistics</span>.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Track thousands of SKUs across multi-regional distribution hubs in real time. Prevent costly stockouts with automated reordering and predictive analytics.
            </p>
          </div>

          {/* Interactive Feature Showcase Cards */}
          <div className="space-y-3 pt-2">
            {/* Card 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between hover:border-slate-700/80 transition-all group">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Activity size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">Real-time Stock Dispatch</h4>
                  <p className="text-xs text-slate-400">Sub-second sync with FIFO / LIFO cost calculations</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                Live
              </span>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between hover:border-slate-700/80 transition-all group">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Enterprise RBAC & Auditing</h4>
                  <p className="text-xs text-slate-400">Role-based controls & tamper-proof transaction log</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
                SOC-2
              </span>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-white font-['Outfit']">99.98%</p>
              <p className="text-xs text-slate-400 font-medium">Fulfillment Accuracy</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <p className="text-2xl font-black text-white font-['Outfit']">&lt; 150ms</p>
              <p className="text-xs text-slate-400 font-medium">Global API Latency</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div>
              <p className="text-2xl font-black text-white font-['Outfit']">140+</p>
              <p className="text-xs text-slate-400 font-medium">Hubs Connected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50 relative min-h-screen">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md space-y-8 animate-in relative z-10">
          
          {/* Header & Tabs */}
          <div>
            {/* Mobile Brand Header */}
            <div className="flex items-center space-x-2.5 mb-6 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 font-['Outfit']">Smart<span className="text-blue-600">Inventory</span></h2>
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Enterprise v2.0</p>
              </div>
            </div>

            {/* Mode Toggle Switcher */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl mb-6 border border-slate-300/60 shadow-xs">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isLogin 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isLogin 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              {isLogin ? 'Welcome back' : 'Get started with SmartInventory'}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-medium">
              {isLogin 
                ? 'Enter your credentials to access your warehouse dashboard.' 
                : 'Create your administrator or staff account in seconds.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-xl flex items-start space-x-2.5 text-rose-700 text-xs sm:text-sm animate-in shadow-xs">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {isLoading && loadingMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center space-x-2 text-blue-700 text-xs sm:text-sm font-semibold animate-pulse shadow-xs">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0"></div>
                <span>{loadingMessage}</span>
              </div>
            )}

            {/* Name input for Sign Up */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium shadow-xs"
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium shadow-xs"
                  placeholder="name@company.com"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={openForgotPasswordModal}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-11 py-2.5 sm:py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium shadow-xs"
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/25 transition-all shadow-md shadow-blue-500/25 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider">or sign in with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <div className="flex justify-center">
              <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setIsLoading(true);
                      setLoadingMessage('Validating Google authentication...');
                      setError('');
                      await googleLogin(credentialResponse.credential);
                      navigate(from, { replace: true });
                    } catch (err) {
                      setError(err.response?.data?.message || 'Google Sign-in failed. Please try again.');
                    } finally {
                      setIsLoading(false);
                      setLoadingMessage('');
                    }
                  }}
                  onError={() => {
                    setError('Google Sign-in was cancelled or encountered an issue.');
                  }}
                  useOneTap
                />
              </div>
            </div>
          </form>

          {/* Quick Demo Evaluation Section */}
          {isLogin && (
            <div className="pt-2">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/90 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-amber-500 text-white shadow-xs">
                      <Sparkles size={14} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900">Instant Admin Demo Access</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-800">
                    Pre-seeded
                  </span>
                </div>

                <p className="text-xs text-amber-900/80 leading-relaxed">
                  Test the complete platform with pre-configured inventory, low-stock alerts, and full admin permissions without typing.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleQuickAdminLogin}
                    disabled={isLoading}
                    type="button"
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-xs active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  >
                    <Zap size={14} className="fill-white" />
                    <span>1-Click Admin Login</span>
                  </button>

                  <button
                    onClick={fillDefaultCredentials}
                    disabled={isLoading}
                    type="button"
                    className="py-2.5 px-3 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-100/80 border border-amber-300 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    Autofill Credentials
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Terms */}
          <p className="text-center text-xs text-slate-400">
            Protected by enterprise encryption & automated audit trail.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-['Outfit']">
                    {forgotStep === 1 && 'Reset Password'}
                    {forgotStep === 2 && 'Enter Verification Code'}
                    {forgotStep === 3 && 'Password Updated!'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {forgotStep === 1 && 'Step 1 of 3: Provide registered work email'}
                    {forgotStep === 2 && 'Step 2 of 3: Verify code & create new password'}
                    {forgotStep === 3 && 'Step 3 of 3: Complete & return to sign in'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2 text-rose-700 text-xs font-semibold animate-in">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Work Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-sm font-medium"
                        placeholder="admin@example.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Generate Reset Code →</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter Code & New Password */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {demoCode && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold">Evaluation Demo Code: </span>
                        <span className="font-mono font-black text-sm text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200 ml-1">
                          {demoCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-600 font-bold uppercase">Expires 15m</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      6-Digit Security Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 font-mono tracking-widest text-base font-bold text-center focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-sm font-medium"
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-sm font-medium"
                        placeholder="Re-type password"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="py-2.5 px-3.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Save & Update Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Success Screen */}
              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 font-['Outfit']">Password Updated!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                      Your new password is now active. Your sign-in form has been automatically populated with the new credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

