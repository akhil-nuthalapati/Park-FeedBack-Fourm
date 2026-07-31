import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, MessageCircle, Wrench, Users, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatCard } from '../components/Card';
import { PARK_IMAGES } from '../utils/constants';
import { getVisitCount } from '../services/visitService';
import { getAverageRatings } from '../services/feedbackService';
import { getComplaints } from '../services/maintenanceService';

export default function Home() {
  const [stats, setStats] = useState({
    todayVisitors: 0,
    avgRating: '0.0 / 5',
    openIssues: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [visitRes, ratingRes, complaintsRes] = await Promise.all([
          getVisitCount(null, 'today'),
          getAverageRatings(null),
          getComplaints({ limit: 500 }),
        ]);

        const complaints = complaintsRes.data || [];
        const open = complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
        const resolved = complaints.filter(c => c.status === 'resolved').length;
        const rating = ratingRes.data?.overall_rating || 0;

        setStats({
          todayVisitors: (visitRes.data || 0).toLocaleString('en-IN'),
          avgRating: rating ? `${rating} / 5` : 'N/A',
          openIssues: open,
          resolvedIssues: resolved,
        });
      } catch (err) {
        console.error('Error loading live home metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[500px] flex items-center justify-center text-center px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('${PARK_IMAGES.hero}')` }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up text-white">
            GVMC Park Maintenance Portal
          </h1>
          <p className="text-lg md:text-xl mb-10 text-gray-200 animate-fade-in-up">
            Greater Visakhapatnam Municipal Corporation Smart Green Space Portal
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
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
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Citizen Services</h2>
            <p className="section-subtitle">Helping GVMC maintain and improve public parks together.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <QrCode size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">QR Based Check-In</h3>
              <p className="text-gray-600">
                Scan the QR code placed at park entrances to register your visit instantly.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitor Feedback</h3>
              <p className="text-gray-600">
                Share your park experience to guide GVMC horticulture and maintenance priorities.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wrench size={32} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maintenance Reporting</h3>
              <p className="text-gray-600">
                Report broken equipment, lighting, or cleanliness issues directly to GVMC officers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Dynamic Overview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Live System Metrics</h2>
            <p className="section-subtitle">Real-time public data from live visitor entries.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Today's Visitors" 
              value={loading ? '...' : stats.todayVisitors} 
              icon={Users}
              color="primary"
            />
            <StatCard 
              label="Average Rating" 
              value={loading ? '...' : stats.avgRating} 
              icon={Star}
              color="success"
            />
            <StatCard 
              label="Open Issues" 
              value={loading ? '...' : stats.openIssues} 
              icon={AlertTriangle}
              color="warning"
            />
            <StatCard 
              label="Resolved Requests" 
              value={loading ? '...' : stats.resolvedIssues} 
              icon={CheckCircle}
              color="info"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
