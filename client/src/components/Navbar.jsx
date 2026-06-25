import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
     <div className="flex items-center gap-6">
     <span className="text-white font-bold text-lg">TaskManager</span>
     <div className="flex gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition">
            Dashboard
        </Link>
        <Link to="/tasks" className="text-gray-400 hover:text-white text-sm transition">
            My Tasks </Link>
          {user?.role === 'admin' && (
            <Link to="/tasks/all" className="text-gray-400 hover:text-white text-sm transition">
              All Tasks
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {user?.f_name} {user?.l_name}
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
            user?.role === 'admin' 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            {user?.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
