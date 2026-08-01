import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getComplaintByTicketOrPhone } from '../services/maintenanceService';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import { Search, Ticket, CheckCircle2, Clock, AlertCircle, Wrench, ShieldCheck, UserCheck, MessageSquare, Phone } from 'lucide-react';

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searched, setSearched] = useState(false);
  const [recentTickets, setRecentTickets] = useState([]);
  
  const toast = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gvmc_recent_tickets');
      if (raw) setRecentTickets(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearch = async (termToSearch) => {
    const query = termToSearch || searchTerm;
    if (!query || !query.trim()) {
      toast.error('Please enter a Ticket Code (e.g. MR-84920) or Phone Number');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await getComplaintByTicketOrPhone(query.trim());
      if (error) {
        toast.error('Could not complete lookup. Please try again.');
        setResults([]);
      } else {
        setResults(data || []);
        if (data && data.length === 0) {
          toast.info('No maintenance requests found matching that code or number.');
        } else {
          toast.success(`Found ${data.length} ticket(s) matching your search.`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching ticket status.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 size={14} /> Resolved & Completed</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><Clock size={14} /> In Progress / Assigned</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300"><AlertCircle size={14} /> Declined / Invalid</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><Clock size={14} /> Submitted / Pending Review</span>;
    }
  };

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
          <Ticket size={24} />
        </div>
        <h1 className="section-title">Track Complaint Status</h1>
        <p className="section-subtitle">
          Enter your unique Ticket Code (e.g. MR-84920) or Phone Number to check real-time progress and staff resolution notes.
        </p>
      </div>

      {/* Search Bar Card */}
      <Card className="mb-8 border-t-4 border-t-primary shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Enter Ticket Code (MR-XXXXX) or Phone Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 text-base py-3"
              />
            </div>
            <Button type="submit" loading={loading} className="py-3 px-8 text-base">
              Track Status
            </Button>
          </div>

          {/* Quick links for recent tickets */}
          {recentTickets.length > 0 && (
            <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Your Recent Tickets:</span>
              {recentTickets.slice(0, 5).map((tCode) => (
                <button
                  key={tCode}
                  type="button"
                  onClick={() => {
                    setSearchTerm(tCode);
                    handleSearch(tCode);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded-md font-mono transition-colors font-medium border border-slate-200"
                >
                  {tCode}
                </button>
              ))}
            </div>
          )}
        </form>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <Loader text="Fetching ticket status..." />
        </div>
      )}

      {/* Results Section */}
      {!loading && searched && results && results.length === 0 && (
        <Card className="text-center py-12 border-dashed border-2 border-gray-200">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No Matching Ticket Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">
            We couldn't find any maintenance request with code "<span className="font-mono text-gray-700 font-bold">{searchTerm}</span>". Please check for typos or try searching with your phone number.
          </p>
        </Card>
      )}

      {!loading && results && results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>Found {results.length} Request(s)</span>
          </h2>

          {results.map((ticket) => {
            const isResolved = ticket.status === 'resolved';
            const isInProgress = ticket.status === 'in_progress';
            const isEscalated = ticket.priority === 'high' || ticket.priority === 'critical' || ticket.description?.includes('RECURRING');

            return (
              <Card key={ticket.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                {/* Card Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-primary/10 text-primary font-mono">
                        {ticket.ticket_code || `ID: ${ticket.id.substring(0, 8)}`}
                      </span>
                      {getStatusBadge(ticket.status)}
                      {isEscalated && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          ⚡ Priority High / Escalated
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">
                      {ticket.parks?.name || 'Visakhapatnam City Park'}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 text-right sm:text-right">
                    <p className="font-semibold text-gray-700">Submitted On:</p>
                    <p>{new Date(ticket.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="py-4 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Category</span>
                    <p className="text-sm font-semibold text-gray-800 capitalize">{ticket.issue_type} Maintenance</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Reported Issue Description</span>
                    <p className="text-sm text-gray-700 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 whitespace-pre-line">
                      {ticket.description}
                    </p>
                  </div>

                  {ticket.photo_url && (
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Attached Photo</span>
                      <div className="mt-1">
                        <img
                          src={ticket.photo_url}
                          alt="Issue Attachment"
                          className="h-36 w-auto max-w-full rounded-lg border border-gray-200 object-cover shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Timeline Stepper */}
                <div className="my-4 py-4 px-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Request Progress Timeline</h4>
                  <div className="grid grid-cols-3 gap-2 relative">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-xs font-bold text-emerald-800 mt-2">1. Submitted</p>
                      <p className="text-[10px] text-gray-500">Ticket Generated</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm ${isInProgress || isResolved ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <Wrench size={18} />
                      </div>
                      <p className={`text-xs font-bold mt-2 ${isInProgress || isResolved ? 'text-primary' : 'text-gray-400'}`}>
                        2. In Progress
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {ticket.profiles?.full_name ? `Officer: ${ticket.profiles.full_name}` : 'Staff Inspection'}
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-sm ${isResolved ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <ShieldCheck size={18} />
                      </div>
                      <p className={`text-xs font-bold mt-2 ${isResolved ? 'text-emerald-700' : 'text-gray-400'}`}>
                        3. Resolved
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {isResolved && ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleDateString() : 'Pending Repair'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STAFF RESOLUTION NOTE (CLOSED FEEDBACK LOOP) */}
                {ticket.resolution_note ? (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-950">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                      <MessageSquare size={18} />
                      <span>Official Staff Resolution Note</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-900 leading-relaxed pl-6">
                      "{ticket.resolution_note}"
                    </p>
                    {ticket.resolution_image_url && (
                      <div className="mt-3 pl-6">
                        <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Resolution Proof Photo:</p>
                        <img
                          src={ticket.resolution_image_url}
                          alt="Resolution Proof"
                          className="h-40 w-auto rounded-lg border border-emerald-300 object-cover shadow-sm"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    {ticket.resolved_at && (
                      <p className="text-xs text-emerald-700 mt-2 pl-6 font-semibold">
                        Resolved on {new Date(ticket.resolved_at).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                    <Clock size={16} className="text-blue-600 flex-shrink-0" />
                    <span>Staff members are currently inspecting this report. Resolution notes will appear here once repairs are completed.</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
