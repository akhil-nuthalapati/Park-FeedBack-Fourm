import { useState, useEffect } from 'react';
import { getDailyVisitors } from '../../services/visitService';
import { getAverageRatings } from '../../services/feedbackService';
import { getAllParks } from '../../services/parkService';
import { getBroadcastAnnouncement, setBroadcastAnnouncement, clearBroadcastAnnouncement } from '../../services/announcementService';
import Breadcrumb from '../../components/Breadcrumb';
import ChartCard, { VisitorLineChart, FeedbackBarChart } from '../../components/ChartCard';
import Loader from '../../components/Loader';
import { useToast } from '../../components/Toast';
import { BarChart3, Download, Printer, Bell, AlertTriangle, CheckCircle, Trash2, Megaphone } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState([]);
  const toast = useToast();
  
  // Chart data state
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [ratingsComparison, setRatingsComparison] = useState([]);

  // Announcement State
  const [announcementForm, setAnnouncementForm] = useState({
    message: '',
    type: 'info', // 'info' | 'warning' | 'emergency'
    park_id: '',
    park_name: 'All Parks',
    active: true,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch existing broadcast announcement
        const currentAlert = getBroadcastAnnouncement();
        if (currentAlert) {
          setAnnouncementForm({
            message: currentAlert.message || '',
            type: currentAlert.type || 'info',
            park_id: currentAlert.park_id || '',
            park_name: currentAlert.park_name || 'All Parks',
            active: currentAlert.active !== false,
          });
        }

        // Fetch all parks
        const parksRes = await getAllParks();
        const parksData = parksRes.data || [];
        setParks(parksData);

        // Fetch global trend (last 30 days)
        const trendRes = await getDailyVisitors(null, 30);
        setMonthlyTrend(trendRes.data || []);

        // Fetch ratings per park for comparison
        const ratingPromises = parksData.map(async (park) => {
          const res = await getAverageRatings(park.id);
          return {
            name: park.name,
            ward: park.ward || 'N/A',
            rating: res.data?.overall_rating || 0,
            cleanliness: res.data?.cleanliness || 0,
            safety: res.data?.safety || 0,
          };
        });
        
        const ratingsData = await Promise.all(ratingPromises);
        setRatingsComparison(ratingsData.sort((a, b) => b.rating - a.rating));

      } catch (err) {
        console.error(err);
        toast.error('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Broadcast Alert Actions
  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementForm.message.trim()) {
      clearBroadcastAnnouncement();
      toast.success('Broadcast announcement cleared.');
    } else {
      setBroadcastAnnouncement(announcementForm);
      toast.success('Broadcast announcement banner updated live!');
    }
  };

  const handleClearAnnouncement = () => {
    clearBroadcastAnnouncement();
    setAnnouncementForm({ message: '', type: 'info', active: true });
    toast.success('Announcement banner removed.');
  };

  // CSV Export Action
  const handleExportCSV = () => {
    try {
      const headers = ['Park Name', 'Ward Location', 'Overall Rating (out of 5)', 'Cleanliness Rating', 'Safety Rating'];
      const rows = ratingsComparison.map((p) => [
        `"${p.name}"`,
        `"${p.ward}"`,
        p.rating,
        p.cleanliness,
        p.safety,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GVMC_Park_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Analytics report exported as CSV!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV report.');
    }
  };

  // Print PDF Executive Summary Action
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Visitor Analytics' }]} />
      
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 size={26} className="text-primary" />
            Executive Analytics & Reporting
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze visitor footfall, monitor satisfaction metrics per ward, and broadcast emergency alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Export CSV Data</span>
          </button>

          <button 
            onClick={handlePrintPDF}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Printer size={15} />
            <span>Print PDF Summary</span>
          </button>
        </div>
      </div>

      {/* Broadcast Emergency Announcement Card (Admin Control) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Broadcast Public Alert / Closure Banner</h2>
              <p className="text-xs text-gray-400">Publish a live alert banner shown at the top of all public visitor portal pages.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Park Target Selector */}
            <div className="md:col-span-1">
              <select
                value={announcementForm.park_id}
                onChange={(e) => {
                  const pId = e.target.value;
                  const selectedPark = parks.find((p) => p.id === pId);
                  setAnnouncementForm({
                    ...announcementForm,
                    park_id: pId,
                    park_name: selectedPark ? selectedPark.name : 'All Parks',
                  });
                }}
                className="gov-select text-xs sm:text-sm font-semibold"
              >
                <option value="">🌐 All Parks</option>
                {parks.map((p) => (
                  <option key={p.id} value={p.id}>
                    🌳 {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Announcement Message */}
            <div className="md:col-span-3">
              <input
                type="text"
                value={announcementForm.message}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                placeholder="e.g. Park closed tomorrow morning 6 AM - 11 AM for fountain cleaning"
                className="gov-input text-xs sm:text-sm"
              />
            </div>

            {/* Banner Severity Type */}
            <div className="md:col-span-1">
              <select
                value={announcementForm.type}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                className="gov-select text-xs sm:text-sm"
              >
                <option value="info">🔵 Info (Blue)</option>
                <option value="warning">🟡 Warning (Amber)</option>
                <option value="emergency">🔴 Emergency (Red)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {announcementForm.message && (
              <button
                type="button"
                onClick={handleClearAnnouncement}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg inline-flex items-center gap-1 transition-colors"
              >
                <Trash2 size={13} />
                <span>Remove Banner</span>
              </button>
            )}

            <button
              type="submit"
              className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1 shadow-sm transition-colors"
            >
              <CheckCircle size={13} />
              <span>Publish Banner</span>
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loader text="Generating analytics charts..." />
      ) : (
        <div className="space-y-6">
          <ChartCard 
            title="30-Day Footfall Trend (All Parks)" 
            subtitle="Daily unique visitor check-ins across municipal parks"
          >
            <VisitorLineChart data={monthlyTrend} height={350} />
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Park Rating Comparison" 
              subtitle="Average overall rating out of 5"
            >
              <FeedbackBarChart data={ratingsComparison} height={300} />
            </ChartCard>
            
            <div className="gov-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Top Rated Municipal Parks</h3>
              <div className="space-y-4">
                {ratingsComparison.filter(r => r.rating > 0).slice(0, 5).map((park, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{park.name}</p>
                        <p className="text-xs text-gray-400">Ward: {park.ward}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      {park.rating} <span className="text-gray-400 text-xs">/ 5</span>
                    </div>
                  </div>
                ))}
                
                {ratingsComparison.filter(r => r.rating > 0).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No rating data available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
