import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Terminal, LogOut, Search, Users, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  useLocation(); // Forces re-render on navigation
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-panel sticky top-0 z-50 p-4 mb-8" style={{ margin: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="flex items-center gap-2">
        <Terminal className="text-primary" size={28} />
        <span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          HackBuddy
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/search" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Search size={18} /> Find Hackathons
        </Link>
        <Link to="/teams" className="flex items-center gap-2 hover:text-primary transition-colors">
          <Users size={18} /> My Teams
        </Link>
        <button onClick={handleLogout} className="btn-outline ml-4" style={{ padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}
