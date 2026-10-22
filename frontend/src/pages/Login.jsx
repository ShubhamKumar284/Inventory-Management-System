import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Package, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, 
  AlertTriangle, KeyRound, ShieldCheck, CheckCircle2, ArrowLeft, X 
} from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoadingMessage(isLogin ? 'Authenticating...' : 'Creating your account...');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
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
    setLoadingMessage('Signing in as Administrator...');

    try {
      await login('admin@example.com', 'password123');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please ensure the backend is running.');
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
        setResetCode(res.data.resetCode); // Pre-populate for convenient testing
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request reset code. Please check email address.');
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
      // Pre-fill login credentials so user can log in immediately
      setEmail(forgotEmail);
      setPassword(newPassword);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password. Please check the code.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Decorative/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        {/* Dynamic Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-0"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-screen"></div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50"></div>

        <div className="relative z-10 w-full max-w-lg p-12 flex flex-col items-start">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Package className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">Smart<span className="text-blue-400">Inventory</span></h1>
          </div>
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-6">
            The intelligent way to manage your stock.
          </h2>
          <p className="text-slate-400 text-lg mb-12">
            Streamline your operations, prevent stockouts, and gain real-time visibility into your supply chain with our enterprise-grade management system.
          </p>
          
          <div className="flex space-x-4 items-center">
            <div className="flex -space-x-4">
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="User 1" />
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="User 2" />
              <img className="w-12 h-12 rounded-full border-4 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="User 3" />
            </div>
            <div className="text-sm">
              <div className="text-white font-medium">Trusted by teams</div>
              <div className="text-slate-400">across 50+ countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        {/* Mobile Logo (hidden on desktop) */}
        <div className="absolute top-8 left-8 flex items-center space-x-2 lg:hidden">
           <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Package className="text-white" size={16} />
           </div>
           <h1 className="text-xl font-bold text-slate-900">Smart<span className="text-blue-500">Inventory</span></h1>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLogin 
                ? 'Enter your credentials to access your dashboard.' 
                : 'Sign up to start managing your inventory today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {isLoading && loadingMessage && (
              <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-xl flex items-center justify-center space-x-2 text-blue-700 text-sm font-medium animate-pulse shadow-sm">
                <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0"></div>
                <span>{loadingMessage}</span>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all sm:text-sm"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="name@company.com"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                {isLogin && (
                  <button 
                    type="button" 
                    onClick={openForgotPasswordModal}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all sm:text-sm"
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setIsLoading(true);
                      setLoadingMessage('Verifying Google credentials & signing in...');
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
                    setError('Google Sign-in was cancelled or encountered an error.');
                  }}
                  useOneTap
                />
              </div>
            </div>
          </form>

          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400">For evaluation purposes</span>
                </div>
              </div>
              
              <div className="mt-5 space-y-2">
                <button
                  onClick={handleQuickAdminLogin}
                  disabled={isLoading}
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-amber-300 rounded-xl text-sm font-semibold text-amber-900 bg-gradient-to-r from-amber-50 to-amber-100/80 hover:from-amber-100 hover:to-amber-200/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} className="text-amber-600 fill-amber-500" />
                  <span>⚡ 1-Click Demo Admin Login</span>
                </button>
                
                <button
                  onClick={fillDefaultCredentials}
                  disabled={isLoading}
                  type="button"
                  className="w-full text-center py-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
                >
                  Or autofill credentials into form above
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-all"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {forgotStep === 1 && 'Reset Password'}
                    {forgotStep === 2 && 'Enter Reset Code'}
                    {forgotStep === 3 && 'Password Changed!'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {forgotStep === 1 && 'Enter your registered email to get a code'}
                    {forgotStep === 2 && 'Verify code & choose a new password'}
                    {forgotStep === 3 && 'Your credentials have been updated'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-2.5 text-rose-600 text-xs sm:text-sm animate-in fade-in">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <span className="font-medium">{forgotError}</span>
                </div>
              )}

              {/* STEP 1: Enter Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Account Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                        placeholder="name@company.com"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Send Code →</span>
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
                        <span className="font-mono font-black text-sm text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200 ml-1">
                          {demoCode}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-600 font-medium">Valid 15m</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      6-Digit Verification Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <ShieldCheck size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white font-mono tracking-widest text-base font-bold transition-all text-center"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="py-2.5 px-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center space-x-1"
                    >
                      <ArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20"
                    >
                      {forgotLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <span>Reset Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Success Screen */}
              {forgotStep === 3 && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Password Changed!</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                      Your password has been successfully reset. We have pre-filled your new credentials in the sign-in form.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                  >
                    Back to Sign In
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
