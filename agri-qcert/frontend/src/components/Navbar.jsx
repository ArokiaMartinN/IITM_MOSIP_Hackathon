import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    const roleMap = {
      exporter: '/exporter/dashboard',
      qa_agency: '/qa-agency/dashboard',
      importer: '/importer/dashboard',
      admin: '/admin/dashboard',
    };
    return roleMap[user?.role] || '/login';
  };

  return (
    <nav className="app-nav shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getDashboardPath()} className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary-600">🌾</div>
            <span className="text-xl font-bold text-gray-900">AgriQCert</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </span>
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
            <button
              onClick={toggleTheme}
              className="theme-toggle flex items-center space-x-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden sm:inline text-sm">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <p className="text-gray-700 px-4 py-2">
              Welcome, <span className="font-semibold">{user?.name}</span>
            </p>
            <span className="block px-4 py-2 bg-primary-100 text-primary-800 rounded text-sm font-medium capitalize">
              {user?.role?.replace('_', ' ')}
            </span>
            <button
              onClick={toggleTheme}
              className="theme-toggle w-full flex items-center justify-center space-x-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
