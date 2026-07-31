import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Park Maintenance System</h3>
                <p className="text-xs text-gray-400">Team Zenith</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A government-style web application for monitoring park usage, collecting
              visitor feedback, and reporting maintenance issues for public parks.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-light">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/checkin', label: 'Check-In' },
                { to: '/feedback', label: 'Give Feedback' },
                { to: '/maintenance', label: 'Report Issue' },
                { to: '/login', label: 'Admin Login' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-light">
              Contact
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>📧 support@parkms.gov.in</p>
              <p>📞 1800-XXX-XXXX (Toll Free)</p>
              <p>📍 Municipal Corporation Office,<br /> Smart City, India</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-2 text-primary-light">
                Policies
              </h4>
              <div className="flex gap-4 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 py-4 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} Park Maintenance System — Team Zenith. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Designed for Smart City Initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
