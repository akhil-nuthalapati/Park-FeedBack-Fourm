import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, MessageCircle, Wrench, Users, Star, AlertTriangle, CheckCircle, Search, MapPin, Sparkles, Shield, ChevronRight, Bell } from 'lucide-react';
import Button from '../components/Button';
import Card, { StatCard } from '../components/Card';
import { PARK_IMAGES } from '../utils/constants';
import { getVisitCount } from '../services/visitService';
import { getAverageRatings } from '../services/feedbackService';
import { getComplaints } from '../services/maintenanceService';
import { getAllParks } from '../services/parkService';

export default function Home() {
  const [stats, setStats] = useState({
    todayVisitors: 0,
    avgRating: '0.0 / 5',
    openIssues: 0,
    resolvedIssues: 0,
  });
  const [parks, setParks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [visitRes, ratingRes, complaintsRes, parksRes] = await Promise.all([
          getVisitCount(null, 'today'),
          getAverageRatings(null),
          getComplaints({ limit: 500 }),
          getAllParks(),
        ]);

        if (parksRes.data) setParks(parksRes.data);

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
        console.error('Error loading live home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const wards = ['ALL', ...new Set(parks.map(p => p.ward).filter(Boolean))];

  const filteredParks = parks.filter(park => {
    const matchesSearch = park.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          park.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWard = selectedWard === 'ALL' || park.ward === selectedWard;
    return matchesSearch && matchesWard;
  });

  return (
    <div>
      {/* Flash Government Announcement Ticker */}
      <div className="bg-amber-500 text-gray-950 font-medium py-2 px-4 text-xs sm:text-sm border-b border-amber-600 flex items-center gap-3">
        <span className="bg-gray-950 text-amber-400 font-bold px-2 py-0.5 rounded uppercase text-[10px] flex items-center gap-1 flex-shrink-0">
          <Bell size={12} className="animate-bounce" /> Official Notice
        </span>
        <div className="overflow-hidden relative w-full">
          <p className="truncate">
            📢 All GVMC Public Parks open daily from 5:00 AM to 8:30 PM. Single-use plastic & smoking strictly prohibited. Report maintenance issues online for fast resolution!
          </p>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative min-h-[520px] flex items-center justify-center text-center px-4 py-16">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url('${PARK_IMAGES.hero}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-light mb-6">
            <Sparkles size={14} className="text-yellow-400" />
            <span>GVMC Smart City Green Space Infrastructure</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in-up text-white leading-tight">
            GVMC Public Park Maintenance Portal
          </h1>
          <p className="text-base md:text-xl mb-10 text-slate-200 max-w-2xl mx-auto font-normal">
            Greater Visakhapatnam Municipal Corporation Smart Public Park Operations, QR Check-Ins, and Citizen Grievance Portal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <Link to="/checkin" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-xl shadow-primary/30">
                Visitor Check-In
              </Button>
            </Link>
            <Link to="/feedback" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full text-gray-800 bg-white hover:bg-gray-100">
                Give Feedback
              </Button>
            </Link>
            <Link to="/maintenance" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-white border-white hover:bg-white hover:text-primary">
                Report Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Park Search & Filter Section */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  GVMC Parks Directory
                </h3>
                <p className="text-xs text-gray-500">Search active parks across Visakhapatnam municipal wards.</p>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search park name or location..."
                    className="gov-input pl-9 text-sm"
                  />
                </div>

                {/* Ward Filter */}
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="gov-select text-sm py-2 sm:w-40"
                >
                  {wards.map(w => (
                    <option key={w} value={w}>{w === 'ALL' ? 'All Wards' : w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParks.map((park) => (
                <div key={park.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800 text-base">{park.name}</h4>
                    <span className="badge bg-emerald-100 text-emerald-800 text-[10px]">
                      {park.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" /> {park.location} ({park.ward})
                  </p>
                  <div className="flex gap-2 border-t border-gray-100 pt-3 mt-2">
                    <button
                      onClick={() => navigate(`/checkin?qr=${park.qr_code}`)}
                      className="flex-1 py-1.5 px-3 bg-primary-light text-primary hover:bg-primary hover:text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    >
                      <QrCode size={13} /> Check In
                    </button>
                    <button
                      onClick={() => navigate('/feedback')}
                      className="py-1.5 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-xs font-semibold transition-colors"
                    >
                      Feedback
                    </button>
                  </div>
                </div>
              ))}

              {filteredParks.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400 text-sm">
                  No parks found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Services Grid */}
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
                Scan entrance QR codes to log your visit. Helps GVMC gauge footfall & allocate resources.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visitor Feedback</h3>
              <p className="text-gray-600">
                Rate park cleanliness, safety, and amenities to influence municipal maintenance goals.
              </p>
            </Card>

            <Card className="text-center group border border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wrench size={32} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Maintenance Reporting</h3>
              <p className="text-gray-600">
                Report broken equipment, lighting, or cleanliness issues directly to field officers.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Live System Overview Metrics */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Live System Overview</h2>
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
