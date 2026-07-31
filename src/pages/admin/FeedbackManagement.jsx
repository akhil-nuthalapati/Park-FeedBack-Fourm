import { useState, useEffect } from 'react';
import { getAllFeedback } from '../../services/feedbackService';
import { getAllParks } from '../../services/parkService';
import { formatDate, formatDateTime } from '../../utils/helpers';
import { RATING_LABELS } from '../../utils/constants';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import RatingStars from '../../components/RatingStars';
import { MessageSquare, Filter, X, Building, User, Eye } from 'lucide-react';

export default function FeedbackManagement() {
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [parks, setParks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="whitespace-nowrap">{formatDate(item.created_at)}</td>
                      <td className="font-medium text-gray-800">{item.parks?.name || 'Unknown'}</td>
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
                        <button 
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-primary font-medium text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 border border-blue-100"
                        >
                          <Eye size={14} />
                          <span>View Details</span>
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

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setSelectedFeedback(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-fade-in-up border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="text-primary" size={22} />
                  Visitor Feedback Details
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted on {formatDateTime(selectedFeedback.created_at)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Park & Visitor Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Building size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Park Location</p>
                  <p className="font-semibold text-gray-800">{selectedFeedback.parks?.name || 'Park N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Visitor Identity</p>
                  <span className={`badge ${selectedFeedback.anonymous ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                    {selectedFeedback.anonymous ? 'Anonymous Visitor' : 'Verified Visitor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Rating Section */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Overall Satisfaction</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-gray-800">{selectedFeedback.overall_rating} <span className="text-sm font-normal text-gray-500">/ 5</span></span>
                  <RatingStars value={selectedFeedback.overall_rating} size={22} readOnly />
                </div>
              </div>
            </div>

            {/* Sub-Category Ratings Breakdown */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Sub-Category Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['cleanliness', 'safety', 'facilities', 'greenery', 'lighting', 'playground', 'washroom'].map((field) => {
                  const rating = selectedFeedback[field];
                  return (
                    <div key={field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-medium text-gray-700">{RATING_LABELS[field]}</span>
                      {rating != null && rating > 0 ? (
                        <RatingStars value={rating} size={16} readOnly />
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not rated</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Comments & Suggestions */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Visitor Review & Suggestions</h3>
              {selectedFeedback.suggestion ? (
                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl text-gray-800 text-sm whitespace-pre-wrap leading-relaxed italic">
                  "{selectedFeedback.suggestion}"
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-gray-400 text-sm italic text-center border border-gray-100">
                  No written suggestion or comment was left by this visitor.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button 
                onClick={() => setSelectedFeedback(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
