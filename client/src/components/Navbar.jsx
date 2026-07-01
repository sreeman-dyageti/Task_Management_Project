import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/tasks', label: 'My Tasks' },
    { to: '/projects', label: 'Projects' },
    ...(user?.role === 'admin' ? [{ to: '/tasks/all', label: 'All Tasks' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/reports', label: 'Reports' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1E1B16] px-4 md:px-6 py-3 relative">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span className="text-[#D9A441] font-bold text-lg">TaskManager</span>

          {/* Desktop links */}
          <div className="hidden md:flex gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm px-3 py-2 rounded-lg transition ${
                  isActive(link.to)
                    ? 'bg-[#D9A441] text-[#1E1B16] font-medium'
                    : 'text-[#C9C2B0] hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side desktop */}
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-[#C9C2B0]">
            {user?.f_name} {user?.l_name}
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              user?.role === 'admin'
                ? 'bg-[#D9A441]/20 text-[#D9A441]'
                : 'bg-white/10 text-[#C9C2B0]'
            }`}>
              {user?.role}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-[#C9C2B0] hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile — bell + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[#C9C2B0] p-1"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 pb-2 border-t border-white/10 pt-3 space-y-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm px-3 py-2.5 rounded-lg transition ${
                isActive(link.to)
                  ? 'bg-[#D9A441] text-[#1E1B16] font-medium'
                  : 'text-[#C9C2B0] hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between px-3">
            <span className="text-sm text-[#C9C2B0]">
              {user?.f_name} {user?.l_name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                user?.role === 'admin'
                  ? 'bg-[#D9A441]/20 text-[#D9A441]'
                  : 'bg-white/10 text-[#C9C2B0]'
              }`}>
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}