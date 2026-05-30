import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import HGregLogo from '../components/HGregLogo';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, isManager, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = ['SHOP', 'BRANDS', 'ABOUT', 'SUPPORT'];
  const isHome = location.pathname === '/';

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full h-16 flex items-center justify-between px-4 md:px-8 transition-all duration-500 z-[100] ${
          scrolled || !isHome || menuOpen
            ? 'bg-obsidian/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg'
            : 'bg-obsidian/80 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-steel hover:text-chrome transition-colors p-1 relative z-[101]"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <button onClick={() => navigate('/')} className="relative z-[101]">
          <HGregLogo />
        </button>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 relative z-[101]">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => navigate(`/${link.toLowerCase()}`)}
              className="relative text-sm font-medium tracking-[0.04em] uppercase text-steel hover:text-chrome transition-colors duration-300 group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-amber origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          ))}
          {!authLoading && (isAdmin || isManager) && (
            <button
              onClick={() => navigate('/admin')}
              className="relative text-sm font-medium tracking-[0.04em] uppercase text-amber hover:text-chrome transition-colors duration-300 group"
            >
              ADMIN
              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-amber origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4 md:gap-5 relative z-[101]">
          {/* Search toggle + input */}
          <div className="relative flex items-center">
            {searchOpen && (
              <form onSubmit={handleSearch} className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search parts..."
                  className="w-[200px] md:w-[260px] bg-ink border border-white/[0.12] rounded-lg px-3 py-2 text-sm text-chrome placeholder:text-steel/50 focus:border-amber focus:outline-none transition-colors"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-steel hover:text-chrome">
                  <X size={16} />
                </button>
              </form>
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-steel hover:text-chrome transition-colors duration-300"
            >
              <Search size={20} />
            </button>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative text-steel hover:text-chrome transition-colors duration-300"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber text-obsidian text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate(isAuthenticated ? '/admin' : '/login')}
            className="text-steel hover:text-chrome transition-colors duration-300 hidden md:block"
            title={isAuthenticated ? 'Admin Panel' : 'Login'}
          >
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 md:hidden ${
          menuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={`absolute left-0 top-16 bottom-0 w-[80%] max-w-[300px] bg-[#08080A] border-r border-white/[0.06] backdrop-blur-xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col p-6 gap-2">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <Search size={18} className="text-steel shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parts..."
                className="flex-1 bg-transparent text-sm text-chrome placeholder:text-steel/50 focus:outline-none"
              />
            </form>
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => { navigate(`/${link.toLowerCase()}`); setMenuOpen(false); }}
                className="text-left text-lg font-medium tracking-[0.04em] uppercase text-steel hover:text-amber transition-colors py-3 border-b border-white/[0.06]"
              >
                {link}
              </button>
            ))}
            <button
              onClick={() => { navigate(isAuthenticated ? '/admin' : '/login'); setMenuOpen(false); }}
              className="text-left text-lg font-medium tracking-[0.04em] uppercase text-steel hover:text-amber transition-colors py-3 border-b border-white/[0.06] flex items-center gap-2"
            >
              <User size={18} />
              {isAuthenticated ? 'ADMIN PANEL' : 'SIGN IN'}
            </button>
            {(isAdmin || isManager) && (
              <button
                onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                className="text-left text-lg font-medium tracking-[0.04em] uppercase text-amber hover:text-chrome transition-colors py-3 border-b border-white/[0.06]"
              >
                MANAGE PARTS
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
