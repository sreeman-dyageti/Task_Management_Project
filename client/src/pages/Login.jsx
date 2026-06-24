import{react, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login(){
    const{login} = useAuth();

    const navigate = useNavigate();

    const[form, setForm]=useState({email:"", password:""});
    const[error, setError]= useState('');
    const[loading, setLoading] = useState(false);

    const handleChange= (e)=>{
        setForm({
           ...form,[e.target.name]: e.target.value 
        });
    }
    const  handleSubmit = async (e)=>{
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const res = await api.post('auth/login', form);
        login(res.data.user, res.data.token);
        navigate('/dashboard');
    } catch (err) {
        setError(err.response?.data?.error || 'login failed');  
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
        <p className="text-gray-400 mb-6 text-sm">Login to your account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}
      {/* email */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
        {/* password */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

