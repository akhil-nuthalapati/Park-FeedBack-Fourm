import { useState, useEffect } from 'react';
import { getPublicIssues } from '../services/maintenanceService';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import {
  Wrench, CheckCircle2, Clock, AlertCircle, MapPin,
  MessageSquare, AlertTriangle, ChevronDown, ChevronUp, Image as ImageIcon,
} from 'lucide-react';

const PRIORITY_STYLES = {
  critical: { bg: 'bg-red-500', text: 'text-white', label: 'CRITICAL' },
  high: { bg: 'bg-orange-500', text: 'text-white', label: 'HIGH' },
  medium: { bg: 'bg-amber-400', text: 'text-gray-900', label: 'MEDIUM' },
  low: { bg: 'bg-emerald-500', text: 'text-white', label: 'LOW' },
};

const STATUS_CONFIG = {
  open: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Open — Pending Review' },
  in_progress: { icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'In Progress — Staff Assigned' },
  resolved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Resolved ✓' },
  rejected: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Declined' },
};

export default function Reviews() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      try {
        const { data, error } = await getPublicIssues();
        if (error) {
          console.warn('Could not load public issues:', error);
          toast.error('Unable to load issues at the moment.');
        }
        setIssues(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  const filtered = filterStatus
    ? issues.filter(i => i.status === filterStatus)
    : issues;

  const resolvedCount = issues.filter(i => i.status === 'resolved').length;
  const openCount = issues.filter(i => i.status === 'open' || i.status === 'in_progress').length;

  return (
    <div className="page-container max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-3">
          <MessageSquare size={24} />
        </div>
        <h1 className="section-title">Public Issue Board</h1>
        <p className="section-subtitle">
          Transparency in action — all reported maintenance issues are listed publicly.
          Staff resolution notes appear once repairs are completed.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-gray-800">{issues.length}</p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Issues</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-blue-600">{openCount}</p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-emerald-600">{resolvedCount}</p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Resolved</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
          <p className="text-2xl font-black text-amber-600">
            {issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 0}%
          </p>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Resolution Rate</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: '', label: 'All Issues' },
          { value: 'open', label: '🔵 Open' },
          { value: 'in_progress', label: '🟡 In Progress' },
          { value: 'resolved', label: '🟢 Resolved' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
              filterStatus === f.value
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50 hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Issues Feed */}
      {loading ? (
        <Loader text="Loading public issues..." />
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16 border-dashed border-2 border-gray-200">
          <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700">No Issues Found</h3>
          <p className="text-sm text-gray-500">No maintenance reports match the current filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => {
            const statusCfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open;
            const StatusIcon = statusCfg.icon;
            const priorityCfg = PRIORITY_STYLES[issue.priority] || PRIORITY_STYLES.medium;
            const isExpanded = expandedId === issue.id;
            const isResolved = issue.status === 'resolved';
            const isRecurring = issue.description?.includes('RECURRING');
            const timeAgo = getTimeAgo(issue.created_at);

            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  isResolved ? 'border-emerald-200' : 'border-gray-200'
                }`}
              >
                {/* Issue Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon size={12} /> {statusCfg.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${priorityCfg.bg} ${priorityCfg.text}`}>
                          {priorityCfg.label}
                        </span>
                        {isRecurring && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                            ⚡ RECURRING
                          </span>
                        )}
                        {issue.ticket_code && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold border border-slate-200">
                            {issue.ticket_code}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 capitalize leading-snug">
                        {issue.issue_type?.replace('_', ' ')} Issue
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {issue.parks?.name || 'City Park'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {timeAgo}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 bg-slate-50/50">
                    {/* Description */}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Reported Issue</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-gray-200">
                        {cleanDescription(issue.description)}
                      </p>
                    </div>

                    {/* Photo */}
                    {issue.photo_url && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <ImageIcon size={12} /> Attached Photo
                        </p>
                        <img
                          src={issue.photo_url}
                          alt="Issue photo"
                          className="h-44 w-auto rounded-lg border border-gray-200 object-cover shadow-sm"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Assigned Officer */}
                    {issue.profiles?.full_name && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-gray-500">Assigned Officer:</span>
                        <span className="font-semibold text-gray-800 bg-slate-100 px-2 py-0.5 rounded">
                          {issue.profiles.full_name}
                        </span>
                      </div>
                    )}

                    {/* ADMIN RESOLUTION NOTE (the core "closed loop" feature) */}
                    {issue.resolution_note && (
                      <div className={`p-4 rounded-xl border-2 ${
                        isResolved
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <MessageSquare size={16} className={isResolved ? 'text-emerald-700' : 'text-blue-700'} />
                          <span className={`text-xs font-black uppercase tracking-wider ${
                            isResolved ? 'text-emerald-800' : 'text-blue-800'
                          }`}>
                            Official Staff Resolution Note
                          </span>
                        </div>
                        <p className={`text-sm font-medium leading-relaxed pl-6 ${
                          isResolved ? 'text-emerald-900' : 'text-blue-900'
                        }`}>
                          "{issue.resolution_note}"
                        </p>
                        {issue.resolution_image_url && (
                          <div className="mt-3 pl-6">
                            <p className="text-[11px] font-bold text-gray-500 uppercase mb-1">Resolution Proof Photo:</p>
                            <img
                              src={issue.resolution_image_url}
                              alt="Resolution Proof"
                              className="h-44 w-auto rounded-lg border border-emerald-300 object-cover shadow-sm"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        {issue.resolved_at && (
                          <p className="text-[11px] text-emerald-700 mt-2 pl-6 font-semibold">
                            Resolved on {new Date(issue.resolved_at).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}

                    {!issue.resolution_note && !isResolved && (
                      <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-blue-800 text-xs flex items-center gap-2">
                        <Clock size={14} className="text-blue-500 flex-shrink-0" />
                        Staff are currently investigating this report. A resolution note will appear here once repairs are completed.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function cleanDescription(desc) {
  if (!desc) return '';
  return desc
    .replace(/\[⚡ RECURRING ISSUE AUTO-ESCALATED[^\]]*\]\n?/g, '')
    .replace(/\[Issue Category:[^\]]*\]\n?/g, '')
    .trim();
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
