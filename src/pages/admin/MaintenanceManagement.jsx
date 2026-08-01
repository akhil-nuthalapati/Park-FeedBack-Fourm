import { useState, useEffect } from 'react';
import { getComplaints, updateStatus, assignComplaint } from '../../services/maintenanceService';
import { getActiveOfficers } from '../../services/employeeService';
import { getAllParks } from '../../services/parkService';
import { formatDate, getPriorityColor, getStatusColor, formatStatus } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { Wrench, CheckCircle, Image as ImageIcon, ExternalLink, AlertCircle, X, Search, Download, MessageSquare, Phone, Ticket, AlertTriangle } from 'lucide-react';

export default function MaintenanceManagement() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [parks, setParks] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [imageModal, setImageModal] = useState({ open: false, url: '' });
  const [actionModal, setActionModal] = useState({ open: false, type: '', request: null, newValue: '', resolutionNote: '' });
  
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

  const openAction = (type, request, newValue) => {
    setActionModal({
      open: true,
      type,
      request,
      newValue,
      resolutionNote: request?.resolution_note || '',
    });
  };

  const confirmAction = async () => {
    const { type, request, newValue, resolutionNote } = actionModal;
    
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
        const res = await updateStatus(request.id, newValue, resolutionNote);
        error = res.error;
      } else if (type === 'assign') {
        const res = await assignComplaint(request.id, newValue);
        error = res.error;
      }
      
      if (error) throw error;
      
      toast.success(`Successfully updated ${type}.`);
      setActionModal({ open: false, type: '', request: null, newValue: '', resolutionNote: '' });
      loadRequests(); // Reload data
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request.');
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.id.toLowerCase().includes(query) ||
      (req.ticket_code && req.ticket_code.toLowerCase().includes(query)) ||
      (req.visitor_phone && req.visitor_phone.includes(query)) ||
      req.parks?.name?.toLowerCase().includes(query) ||
      req.issue_type?.toLowerCase().includes(query) ||
      req.description?.toLowerCase().includes(query)
    );
  });

  const exportCSV = () => {
    if (!requests || requests.length === 0) return;
    const headers = ['Ticket Code', 'Date', 'Park Name', 'Issue Category', 'Priority', 'Status', 'Assigned Officer', 'Visitor Phone', 'Resolution Note'];
    const csvRows = [headers.join(',')];

    requests.forEach(r => {
      const row = [
        `"${r.ticket_code || r.id}"`,
        `"${formatDate(r.created_at)}"`,
        `"${r.parks?.name || ''}"`,
        `"${r.issue_type}"`,
        `"${r.priority}"`,
        `"${r.status}"`,
        `"${r.profiles?.full_name || 'Unassigned'}"`,
        `"${r.visitor_phone || ''}"`,
        `"${(r.resolution_note || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Maintenance_Requests_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Admin', path: '/admin/dashboard' }, { label: 'Maintenance Requests' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Maintenance & Complaints Desk</h1>
          <p className="text-sm text-gray-500">Track incoming park repair tickets, assign staff, and log resolution notes.</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 shadow-sm"
        >
          <Download size={16} />
          Export CSV Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Ticket Code (MR-XXXXX), Park, Phone or Issue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            name="parkId"
            value={filters.parkId}
            onChange={handleFilterChange}
            className="gov-select text-sm w-auto min-w-[160px]"
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
            className="gov-select text-sm w-auto min-w-[140px]"
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
                  <th>Ticket / Date</th>
                  <th>Park / Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const isRecurring = req.priority === 'high' || req.description?.includes('RECURRING');

                    return (
                      <tr key={req.id} className={isRecurring ? 'bg-amber-50/20' : ''}>
                        <td className="whitespace-nowrap">
                          <div className="font-mono text-xs font-bold text-primary mb-0.5">
                            {req.ticket_code || `#${req.id.substring(0, 6)}`}
                          </div>
                          <div className="text-xs text-gray-500">{formatDate(req.created_at)}</div>
                          {req.visitor_phone && (
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Phone size={10} /> {req.visitor_phone}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-800">{req.parks?.name || 'Visakhapatnam Park'}</div>
                          <div className="text-xs text-gray-500 capitalize flex items-center gap-1.5 mt-0.5">
                            <span>{req.issue_type}</span>
                            {isRecurring && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                                ⚡ RECURRING
                              </span>
                            )}
                          </div>
                          {req.resolution_note && (
                            <div className="mt-1.5 p-1.5 bg-emerald-50 rounded text-[11px] text-emerald-900 border border-emerald-200">
                              <span className="font-bold">Staff Response:</span> "{req.resolution_note}"
                            </div>
                          )}
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
                            <span className="text-xs font-semibold text-gray-700 bg-slate-100 px-2 py-1 rounded">
                              {req.profiles.full_name}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td>
                          {req.photo_url ? (
                            <button 
                              onClick={() => setImageModal({ open: true, url: req.photo_url })}
                              className="flex items-center gap-1.5 p-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-gray-700 transition-colors group"
                              title="Click to Enlarge Photo"
                            >
                              <img 
                                src={req.photo_url} 
                                alt="Maintenance Issue" 
                                className="w-9 h-9 object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="text-[11px] font-medium text-primary group-hover:underline">View</span>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <select 
                              className="text-xs border rounded p-1 bg-white"
                              value={req.status}
                              onChange={(e) => openAction('status', req, e.target.value)}
                            >
                              <option value="open">Open</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            
                            <select 
                              className="text-xs border rounded p-1 max-w-[120px] bg-white"
                              value={req.assigned_to || ''}
                              onChange={(e) => openAction('assign', req, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {officers.map(o => (
                                <option key={o.id} value={o.id}>{o.full_name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

      {/* Image Lightbox Modal */}
      {imageModal.open && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setImageModal({ open: false, url: '' })}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xl overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
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
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative flex-1 w-full flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-hidden rounded-xl bg-slate-950/80 p-2">
              <img 
                src={imageModal.url} 
                alt="Maintenance Issue Full View" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Staff Resolution Note & Action Modal */}
      {actionModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Wrench size={20} className="text-primary" />
                Update Ticket {actionModal.request?.ticket_code || `#${actionModal.request?.id?.substring(0,6)}`}
              </h3>
              <button
                onClick={() => setActionModal({ open: false, type: '', request: null, newValue: '', resolutionNote: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You are updating <span className="font-bold uppercase text-gray-800">{actionModal.type}</span> to{' '}
                <span className="font-bold text-primary">{actionModal.newValue ? actionModal.newValue.toUpperCase() : 'UNASSIGNED'}</span>.
              </p>

              {/* Resolution Note Field */}
              {actionModal.type === 'status' && (
                <div className="gov-form-group">
                  <label className="gov-label font-semibold text-xs text-gray-700 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600" />
                    Staff Resolution Note / Response (Visible to Visitor)
                  </label>
                  <textarea
                    value={actionModal.resolutionNote}
                    onChange={(e) => setActionModal(prev => ({ ...prev, resolutionNote: e.target.value }))}
                    placeholder="e.g. Broken bench repaired with reinforced hardwood seating by Ward 12 Team on Aug 1st."
                    rows={3}
                    className="gov-textarea text-xs"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    This message will be shown on the public visitor status tracking portal.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActionModal({ open: false, type: '', request: null, newValue: '', resolutionNote: '' })}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAction}
                className="btn-primary text-sm py-2 px-5"
              >
                Confirm & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
