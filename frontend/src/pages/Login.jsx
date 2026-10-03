import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
    }
  };

  const fillDefaultCredentials = () => {
    setIsLogin(true);
    setEmail('admin@example.com');
    setPassword('password123');
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
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a>
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
          </form>

          {isLogin && (
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">For evaluation purposes</span>
                </div>
              </div>
              
              <button
                onClick={fillDefaultCredentials}
                type="button"
                className="mt-6 w-full flex items-center justify-center space-x-2 py-3 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <Sparkles size={16} className="text-amber-500" />
                <span>Autofill Admin Credentials</span>
              </button>
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
    </div>
  );
};

export default Login;
