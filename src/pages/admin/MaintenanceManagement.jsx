import { useState, useEffect } from 'react';
import { getComplaints, updateStatus, assignComplaint } from '../../services/maintenanceService';
import { getActiveOfficers } from '../../services/employeeService';
import { getAllParks } from '../../services/parkService';
import { formatDate, getPriorityColor, getStatusColor, formatStatus } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Wrench, CheckCircle, Image as ImageIcon, ExternalLink, AlertCircle, X, Search } from 'lucide-react';

export default function MaintenanceManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [parks, setParks] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [actionModal, setActionModal] = useState({ open: false, type: '', request: null, newValue: '' });
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    parkId: '',
  });

  const toast = useToast();

  useEffect(() => {
    async function init() {
      const [parksRes, officersRes] = await Promise.all([
        getAllParks(),
        getActiveOfficers()
      ]);
      if (parksRes.data) setParks(parksRes.data);
      if (officersRes.data) setOfficers(officersRes.data);
      loadRequests();
    }
    init();
  }, [filters]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await getComplaints({
        page: 1,
        limit: 50,
        ...filters
      });
      if (!error && data) {
        setRequests(data);
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

  const openAction = (type, request) => {
    setActionModal({ open: true, type, request, newValue: '' });
  };

  const confirmAction = async () => {
    const { type, request, newValue } = actionModal;
    
    if (newValue === undefined || newValue === null) {
      toast.error('Please select a value to update.');
      return;
    }
    
    try {
      let error;
      if (type === 'status') {
        if (!newValue) {
          toast.error('Please select a valid status.');
          return;
        }
        const res = await updateStatus(request.id, newValue);
        error = res.error;
      } else if (type === 'assign') {
        const res = await assignComplaint(request.id, newValue);
        error = res.error;
      }
      
      if (error) throw error;
      
      toast.success(`Successfully updated ${type}.`);
      loadRequests(); // Reload data
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request.');
    } finally {
      setActionModal({ open: false, type: '', request: null, newValue: '' });
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (req.issue_type && req.issue_type.toLowerCase().includes(query)) ||
      (req.description && req.description.toLowerCase().includes(query)) ||
      (req.parks?.name && req.parks.name.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <Breadcrumb items={[{ label: 'Maintenance Requests' }]} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wrench size={24} className="text-primary" />
          Maintenance Management
        </h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issue e.g. bench, light, tree..."
              className="gov-input py-2 text-sm pl-9"
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            name="parkId"
            value={filters.parkId}
            onChange={handleFilterChange}
            className="gov-select py-2 text-sm"
          >
            <option value="">All Parks</option>
            {parks.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="gov-select py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table min-w-full">
              <thead>
                <tr>
                  <th>ID / Date</th>
                  <th>Park / Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="whitespace-nowrap">
                        <div className="font-mono text-xs text-gray-500 mb-1">#{req.id.substring(0, 6)}</div>
                        <div className="text-sm">{formatDate(req.created_at)}</div>
                      </td>
                      <td>
                        <div className="font-medium text-gray-800">{req.parks?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500 capitalize">{req.issue_type}</div>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityColor(req.priority)}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusColor(req.status)}`}>
                          {formatStatus(req.status).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {req.profiles?.full_name ? (
                          <span className="text-sm font-medium text-gray-700">{req.profiles.full_name}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {req.photo_url ? (
                          <button 
                            onClick={() => setImageModal({ open: true, url: req.photo_url })}
                            className="flex items-center gap-2 p-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-700 transition-colors group"
                            title="Click to Enlarge Photo"
                          >
                            <img 
                              src={req.photo_url} 
                              alt="Maintenance Issue" 
                              className="w-10 h-10 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="text-xs font-medium text-primary group-hover:underline">View</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <select 
                            className="text-xs border rounded p-1"
                            value={req.status}
                            onChange={(e) => {
                              setActionModal({ open: true, type: 'status', request: req, newValue: e.target.value });
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          
                          <select 
                            className="text-xs border rounded p-1 max-w-[120px]"
                            value={req.assigned_to || ''}
                            onChange={(e) => {
                              setActionModal({ open: true, type: 'assign', request: req, newValue: e.target.value });
                            }}
                          >
                            <option value="">Unassigned</option>
                            {officers.map(o => (
                              <option key={o.id} value={o.id}>{o.full_name}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <Wrench size={32} className="mx-auto text-gray-300 mb-3" />
                      No maintenance requests found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image View Modal (Fullscreen Lightbox) */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setImageModal({ open: false, url: '' })}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header Controls */}
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-300">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-400" />
                Maintenance Issue Photo
              </h3>
              
              <div className="flex items-center gap-2">
                {imageModal.url && (
                  <a
                    href={imageModal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-slate-700"
                  >
                    <ExternalLink size={14} />
                    <span>Open Full Resolution</span>
                  </a>
                )}
                
                <button 
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
                  onClick={() => setImageModal({ open: false, url: '' })}
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Image Content Container */}
            <div className="relative flex-1 w-full flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-hidden rounded-xl bg-slate-950/80 p-2">
              <img 
                src={imageModal.url} 
                alt="Maintenance Issue Full View" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallbackDiv = document.getElementById('image-modal-fallback');
                  if (fallbackDiv) fallbackDiv.style.display = 'flex';
                }}
              />
              
              <div 
                id="image-modal-fallback" 
                style={{ display: 'none' }}
                className="flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3"
              >
                <AlertCircle size={48} className="text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">Unable to display preview in frame</p>
                <p className="text-xs text-slate-500 max-w-sm">The image file can be viewed directly by opening it in a new window.</p>
                <a
                  href={imageModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>Open Image in New Window</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirm Modal (using custom generic Modal) */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: '', request: null, newValue: '' })}
        onConfirm={confirmAction}
        title={`Update ${actionModal.type === 'status' ? 'Status' : 'Assignment'}`}
        message={`Are you sure you want to change the ${actionModal.type} for request #${actionModal.request?.id?.substring(0,6)}?`}
        confirmText="Confirm Update"
        variant="warning"
      />
    </div>
  );
}
