import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ShieldCheck, Clock, Volume2 } from 'lucide-react';
import { NAV_LINKS } from '../utils/constants';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleFontSize = (size) => {
    setFontSize(size);
    document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
  };

  const toggleContrast = () => {
    setHighContrast(!highContrast);
    document.documentElement.classList.toggle('high-contrast');
  };

  const tickerText = `🏛️ GREATER VISAKHAPATNAM MUNICIPAL CORPORATION (GVMC) — SMART PARK MAINTENANCE PORTAL • DEVELOPED BY TEAM ZENITH • 📞 HELPLINE: 1913 / 0891-2868686 • TOLL-FREE: 1800-425-00009 • 📍 VISAKHAPATNAM SMART CITY INITIATIVE • LIVE VISITOR CHECK-IN & MAINTENANCE TICKET TRACKING ACTIVE • CURRENT TIME: ${formattedDate} ${formattedTime} • `;

  return (
    <header className="sticky top-0 z-50 no-print">
      {/* Accessibility & Govt Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1 px-4 border-b border-slate-800 flex items-center justify-between gap-4 overflow-hidden">
        {/* Left: Interactive Accessibility controls */}
        <div className="flex items-center gap-3 flex-shrink-0 z-10 bg-slate-900 pr-2">
          <span className="hidden sm:inline font-semibold text-slate-400">Govt of AP | GVMC</span>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            <button
              onClick={() => handleFontSize('small')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'small' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}
              title="Small Text"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSize('normal')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'normal' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}
              title="Normal Text"
            >
              A
            </button>
            <button
              onClick={() => handleFontSize('large')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'large' ? 'bg-primary text-white' : 'hover:bg-slate-800'}`}
              title="Large Text"
            >
              A+
            </button>
          </div>

          <button
            onClick={toggleContrast}
            className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          >
            {highContrast ? 'Normal View' : 'High Contrast'}
          </button>
        </div>

        {/* Center: Continuous Marquee Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative mx-2">
          <div className="animate-marquee text-amber-300 font-medium tracking-wide">
            <span>{tickerText}</span>
            <span>{tickerText}</span>
          </div>
        </div>

        {/* Right: Emergency Contact */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10 bg-slate-900 pl-2">
          <a
            href="tel:1913"
            className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500/20"
          >
            <Phone size={11} />
            <span>1913</span>
          </a>
          <span className="hidden lg:inline text-slate-400 font-mono">{formattedTime}</span>
        </div>
      </div>

      {/* Main header row */}
      <div
        className={`bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-navbar' : 'shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-3.5 group">
              {/* Official Style Crest Emblem */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md border-2 border-white group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck size={26} className="text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-primary font-bold text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
                    GVMC Smart City
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Portal
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-primary-dark leading-tight mt-0.5">
                  Park Maintenance System
                </h1>
                <p className="text-xs text-gray-500">
                  Greater Visakhapatnam Municipal Corporation — Team Zenith
                </p>
              </div>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 py-2">
            {NAV_LINKS.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-primary-light hover:text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Mobile Nav Drawer */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-64' : 'max-h-0'
          }`}
        >
          <nav className="px-4 pb-4 space-y-1 border-t border-gray-100 pt-2">
            {NAV_LINKS.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-primary-light hover:text-primary'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
