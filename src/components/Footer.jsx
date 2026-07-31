import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">GVMC</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">GVMC Park Maintenance</h3>
                <p className="text-xs text-gray-400">Greater Visakhapatnam Municipal Corporation</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Official public park monitoring, visitor feedback, and facility maintenance management system powered by GVMC Smart City Initiative.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-light">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About GVMC Parks' },
                { to: '/checkin', label: 'Visitor Check-In' },
                { to: '/feedback', label: 'Give Feedback' },
                { to: '/maintenance', label: 'Report Maintenance Issue' },
                { to: '/login', label: 'Staff Login' },
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

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary-light">
              GVMC Official Contacts
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <p>📧 <strong className="text-gray-300">Email:</strong> commissioner_gvmc@yahoo.co.in / support@gvmc.gov.in</p>
              <p>📞 <strong className="text-gray-300">Toll Free Helpline:</strong> 1913 / 1800-425-00009</p>
              <p>📱 <strong className="text-gray-300">Parks Control Room:</strong> +91 891-2868686 / +91 891-2568686</p>
              <p>📍 <strong className="text-gray-300">Address:</strong> GVMC Main Office, Tenneti Bhavan, Asilmetta, Visakhapatnam, Andhra Pradesh - 530002</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-4 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} Greater Visakhapatnam Municipal Corporation (GVMC). All rights reserved.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Smart City Visakhapatnam — Urban Green Space Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
