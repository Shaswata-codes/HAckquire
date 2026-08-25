import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@hackquire.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Zap size={20} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">Hackquire</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">Sign in to manage your invoices</p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          {/* Google Sign-in */}
          {/* Google Sign-in with increased height and generous spacing */}
<div className="mb-8 w-full [&>button]:!h-13 [&>button]:!py-3.5 [&>button]:!text-sm [&>button]:!w-full [&>button]:!flex [&>button]:!items-center [&>button]:!justify-center [&>div]:!w-full">
  <GoogleLoginButton text="Continue with Google" mode="signin" />
</div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-700/80 w-full"></div>
            <span className="bg-slate-900/90 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase absolute">
              Or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  id="login-email"
                  className="input-dark !pl-10 text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="input-dark !pl-10 !pr-10 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn-primary w-full py-3 mt-2 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
