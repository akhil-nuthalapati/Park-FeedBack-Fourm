import { useState, useEffect } from 'react';
import { getAllFeedback } from '../../services/feedbackService';
import { getAllParks } from '../../services/parkService';
import { formatDate } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import RatingStars from '../../components/RatingStars';
import { MessageSquare, Search, Filter } from 'lucide-react';

export default function FeedbackManagement() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [parks, setParks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    parkId: '',
    minRating: '',
  });

  useEffect(() => {
    async function init() {
      const { data } = await getAllParks();
      if (data) setParks(data);
      loadFeedback();
    }
    init();
  }, [filters]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      // Simulate slow network for testing loaders
      // await new Promise(r => setTimeout(r, 800));
      
      const { data, count, error } = await getAllFeedback({
        page: 1,
        limit: 50,
        ...filters
      });
      
      if (!error && data) {
        setFeedback(data);
        setTotalCount(count);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Feedback Management' }]} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare size={24} className="text-primary" />
          Visitor Feedback
        </h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select
              name="parkId"
              value={filters.parkId}
              onChange={handleFilterChange}
              className="gov-select pl-9 py-2 text-sm"
            >
              <option value="">All Parks</option>
              {parks.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <select
            name="minRating"
            value={filters.minRating}
            onChange={handleFilterChange}
            className="gov-select py-2 text-sm sm:w-40"
          >
            <option value="">Any Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-600">Showing {feedback.length} of {totalCount} records</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="gov-table min-w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Park</th>
                  <th>Overall Rating</th>
                  <th>Suggestion / Comments</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td>{item.parks?.name || 'Unknown'}</td>
                      <td>
                        <RatingStars value={item.overall_rating} size={16} readOnly />
                      </td>
                      <td className="max-w-md">
                        {item.suggestion ? (
                          <span className="text-gray-800 line-clamp-2" title={item.suggestion}>
                            "{item.suggestion}"
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No comments</span>
                        )}
                      </td>
                      <td>
                        <button className="text-primary hover:text-primary-dark font-medium text-sm transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-500">
                      <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
                      No feedback found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
