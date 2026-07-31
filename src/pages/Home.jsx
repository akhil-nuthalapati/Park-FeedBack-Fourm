import { Link } from 'react-router-dom';
import { QrCode, MessageCircle, Wrench } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatCard } from '../components/Card';
import { PARK_IMAGES } from '../utils/constants';

export default function Home() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[500px] flex items-center justify-center text-center px-4">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('${PARK_IMAGES.hero}')` }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up text-white">
            Welcome to Park Maintenance System
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Smart monitoring, visitor engagement, and efficient maintenance management.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/checkin">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30">
                Check In
              </Button>
            </Link>
            <Link to="/feedback">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-gray-800 bg-white hover:bg-gray-100">
                Give Feedback
              </Button>
            </Link>
            <Link to="/maintenance">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary">
                Report Maintenance Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Smart Services for Citizens</h2>
            <p className="section-subtitle">Helping us maintain and improve public spaces together.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <QrCode size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QR Based Check-In</h3>
              <p className="text-gray-600">
                Scan the QR code placed at the park entrance to register your visit instantly.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitor Feedback</h3>
              <p className="text-gray-600">
                Help improve public parks by sharing your experience and suggestions.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wrench size={32} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maintenance Reporting</h3>
              <p className="text-gray-600">
                Report damaged equipment, overflowing bins, or cleanliness issues directly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">System Overview</h2>
            <p className="section-subtitle">Real-time metrics for public transparency.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Today's Visitors" 
              value="1,245" 
              trend="12% from yesterday" 
              trendUp={true} 
              color="primary"
            />
            <StatCard 
              label="Average Rating" 
              value="4.2 / 5" 
              trend="0.3 from last month" 
              trendUp={true} 
              color="success"
            />
            <StatCard 
              label="Open Issues" 
              value="24" 
              trend="5 new today" 
              trendUp={false} 
              color="warning"
            />
            <StatCard 
              label="Resolved Requests" 
              value="156" 
              trend="95% resolution rate" 
              trendUp={true} 
              color="info"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
