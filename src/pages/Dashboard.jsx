import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getVisitCount, getDailyVisitors } from '../services/visitService';
import { getAverageRatings } from '../services/feedbackService';
import { getComplaints } from '../services/maintenanceService';
import { getAllParks } from '../services/parkService';
import { StatCard } from '../components/Card';
import ChartCard, { VisitorLineChart, StatusPieChart } from '../components/ChartCard';
import Loader from '../components/Loader';
import Breadcrumb from '../components/Breadcrumb';
import { Users, Star, Wrench, AlertTriangle, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { profile, isOfficer, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState([]);
  const [selectedParkId, setSelectedParkId] = useState('');
  
  // Dashboard data
  const [stats, setStats] = useState({
    todayVisitors: 0,
    weeklyVisitors: 0,
    avgRating: 0,
    pendingIssues: 0,
  });
  
  const [visitorTrend, setVisitorTrend] = useState([]);
  const [maintenanceStatus, setMaintenanceStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function init() {
      const { data } = await getAllParks();
      if (data) setParks(data);
      await loadDashboardData('');
    }
    init();
  }, []);

  const loadDashboardData = async (parkId) => {
    setLoading(true);
    try {
      // Parallel data fetching for performance
      const [
        todayVisitsRes,
        weekVisitsRes,
        ratingRes,
        complaintsRes,
        trendRes
      ] = await Promise.all([
        getVisitCount(parkId || null, 'today'),
        getVisitCount(parkId || null, 'week'),
        getAverageRatings(parkId || null),
        getComplaints({ parkId: parkId || undefined, limit: 100 }), // Get more for the pie chart
        getDailyVisitors(parkId || null, 14) // Last 14 days
      ]);

      const complaintsData = complaintsRes.data || [];
      const pendingCount = complaintsData.filter(c => c.status === 'open' || c.status === 'in_progress').length;

      setStats({
        todayVisitors: todayVisitsRes.data || 0,
        weeklyVisitors: weekVisitsRes.data || 0,
        avgRating: ratingRes.data?.overall_rating || 0,
        pendingIssues: pendingCount,
      });

      setVisitorTrend(trendRes.data || []);

      // Calculate maintenance status distribution
      const statusCounts = { open: 0, in_progress: 0, resolved: 0, rejected: 0 };
      complaintsData.forEach(c => {
        if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
      });

      setMaintenanceStatus([
        { name: 'Open', value: statusCounts.open, color: '#0DCAF0' },
        { name: 'In Progress', value: statusCounts.in_progress, color: '#FFC107' },
        { name: 'Resolved', value: statusCounts.resolved, color: '#198754' },
      ].filter(item => item.value > 0)); // Only show non-zero statuses

      // Get 5 most recent activities (just using complaints for now)
      setRecentActivity(complaintsData.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParkChange = (e) => {
    const val = e.target.value;
    setSelectedParkId(val);
    loadDashboardData(val);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {profile?.full_name}</h1>
          <p className="text-sm text-gray-500">Here is what's happening across your parks today.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Filter:</label>
          <select 
            className="gov-select py-1.5 w-48"
            value={selectedParkId}
            onChange={handleParkChange}
          >
            <option value="">All Parks</option>
            {parks.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading dashboard data..." />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              label="Today's Visitors" 
              value={stats.todayVisitors} 
              icon={Users}
              color="primary"
            />
            <StatCard 
              label="Weekly Visitors" 
              value={stats.weeklyVisitors} 
              icon={Calendar}
              color="info"
            />
            <StatCard 
              label="Average Rating" 
              value={`${stats.avgRating} / 5`} 
              icon={Star}
              color="success"
            />
            <StatCard 
              label="Pending Issues" 
              value={stats.pendingIssues} 
              icon={AlertTriangle}
              color={stats.pendingIssues > 10 ? 'danger' : 'warning'}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ChartCard title="Visitor Trend (Last 14 Days)" className="lg:col-span-2">
              <VisitorLineChart data={visitorTrend} height={300} />
            </ChartCard>
            
            <ChartCard title="Maintenance Status">
              {maintenanceStatus.length > 0 ? (
                <StatusPieChart data={maintenanceStatus} height={300} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
                  No data available
                </div>
              )}
            </ChartCard>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">Recent Maintenance Requests</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="gov-table min-w-full">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Issue Type</th>
                    <th>Park</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((req) => (
                      <tr key={req.id}>
                        <td className="font-mono text-xs text-gray-500">
                          {req.id.substring(0, 8)}...
                        </td>
                        <td className="capitalize">{req.issue_type}</td>
                        <td>{req.parks?.name || 'Unknown'}</td>
                        <td>
                          <span className={`badge ${
                            req.status === 'open' ? 'bg-blue-100 text-blue-800' :
                            req.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {req.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            req.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            req.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {req.priority.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No recent activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
