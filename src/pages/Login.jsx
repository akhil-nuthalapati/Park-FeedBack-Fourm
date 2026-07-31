import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/authService';
import { validateLogin } from '../utils/validators';
import Button from '../components/Button';
import Card from '../components/Card';
import { useToast } from '../components/Toast';
import { Shield, Lock, Mail } from 'lucide-react';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!loading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateLogin(form);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await login(form.email, form.password);
      
      if (error) throw error;
      
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card hoverable={false} className="w-full max-w-md border-t-4 border-t-primary">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to access the Park Maintenance System dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="gov-form-group">
            <label className="gov-label font-medium">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`gov-input pl-10 ${errors.email ? 'border-danger' : ''}`}
                placeholder="admin@parkms.gov.in"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
          </div>

          <div className="gov-form-group">
            <label className="gov-label font-medium">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`gov-input pl-10 ${errors.password ? 'border-danger' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
              />
              <label htmlFor="remember" className="text-gray-600 cursor-pointer">
                Remember me
              </label>
            </div>
            <a href="#" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-md"
            size="lg"
            loading={submitting}
          >
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Protected by Government Authentication Services</p>
        </div>
      </Card>
    </div>
  );
}
