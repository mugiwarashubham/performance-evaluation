import { useState } from 'react';
import { useNavigate } from 'react-router';
import axiosClient from '../utils/axiosClient';

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password.trim()
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));

      // App.jsx's "/" route decides hr vs app based on role, so we don't
      // need role-branching logic duplicated here.
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Performance Evaluation
          </h1>
          <p className="text-slate-500 mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              placeholder="kavita@ashoka.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="password123"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold mb-2">Demo accounts</p>
          <ul className="space-y-1">
            <li><span className="font-medium">HR:</span> kavita@ashoka.com</li>
            <li><span className="font-medium">COO:</span> coo@ashoka.com</li>
            <li><span className="font-medium">Manager who also receives feedback:</span> rohan@ashoka.com or priya@ashoka.com</li>
            <li><span className="font-medium">Flat structure founder:</span> founder@brightpath.com</li>
            <li><span className="font-medium">Individual contributor:</span> amit@ashoka.com</li>
          </ul>
          <p className="mt-3 font-medium">Password: password123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
