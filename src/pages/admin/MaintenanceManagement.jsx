import { useState, useEffect } from 'react';
import { getComplaints, updateStatus, assignComplaint } from '../../services/maintenanceService';
import { getActiveOfficers } from '../../services/employeeService';
import { getAllParks } from '../../services/parkService';
import { formatDate, getPriorityColor, getStatusColor, formatStatus } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Wrench, CheckCircle, Image as ImageIcon } from 'lucide-react';

export default function MaintenanceManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [parks, setParks] = useState([]);
  const [officers, setOfficers] = useState([]);
  
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

  return (
    <div>
      <Breadcrumb items={[{ label: 'Maintenance Requests' }]} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wrench size={24} className="text-primary" />
          Maintenance Management
        </h1>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
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
                {requests.length > 0 ? (
                  requests.map((req) => (
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
                            className="p-2 bg-gray-100 rounded text-gray-600 hover:bg-gray-200 transition-colors"
                            title="View Photo"
                          >
                            <ImageIcon size={18} />
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

      {/* Image View Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={() => setImageModal({ open: false, url: '' })}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={imageModal.url} alt="Maintenance Issue" className="w-full h-auto rounded-lg shadow-2xl" />
            <button 
              className="absolute -top-4 -right-4 bg-white text-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100"
              onClick={() => setImageModal({ open: false, url: '' })}
            >
              <X size={20} />
            </button>
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
