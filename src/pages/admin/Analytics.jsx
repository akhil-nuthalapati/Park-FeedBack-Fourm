import { useState, useEffect } from 'react';
import { getDailyVisitors } from '../../services/visitService';
import { getAverageRatings } from '../../services/feedbackService';
import { getAllParks } from '../../services/parkService';
import Breadcrumb from '../../components/Breadcrumb';
import ChartCard, { VisitorLineChart, FeedbackBarChart } from '../../components/ChartCard';
import Loader from '../../components/Loader';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState([]);
  
  // Chart data state
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [ratingsComparison, setRatingsComparison] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch all parks for comparison
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
            rating: res.data?.overall_rating || 0
          };
        });
        
        const ratingsData = await Promise.all(ratingPromises);
        setRatingsComparison(ratingsData.sort((a, b) => b.rating - a.rating));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <Breadcrumb items={[{ label: 'Visitor Analytics' }]} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={24} className="text-primary" />
          Analytics & Reports
        </h1>
        <button className="btn btn-outline bg-white btn-sm">
          Export PDF
        </button>
      </div>

      {loading ? (
        <Loader text="Generating reports..." />
      ) : (
        <div className="space-y-6">
          <ChartCard 
            title="30-Day Footfall Trend (All Parks)" 
            subtitle="Daily unique check-ins across the entire system"
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
              <h3 className="font-semibold text-gray-800 mb-4">Top Performing Parks</h3>
              <div className="space-y-4">
                {ratingsComparison.filter(r => r.rating > 0).slice(0, 5).map((park, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-700">{park.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      {park.rating} <span className="text-gray-400 text-sm">/ 5</span>
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
