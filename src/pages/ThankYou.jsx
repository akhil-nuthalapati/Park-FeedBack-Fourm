import { useLocation, useNavigate } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useToast } from '../components/Toast';
import { CheckCircle, Home, PlusCircle, Ticket, Copy, Search, AlertTriangle } from 'lucide-react';

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const type = location.state?.type || 'general';
  const ticketCode = location.state?.ticketCode || null;
  const isRecurring = location.state?.isRecurring || false;
  const recentCount = location.state?.recentCount || 1;

  const copyTicketCode = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      toast.success(`Copied ticket code "${ticketCode}" to clipboard!`);
    }
  };

  const config = {
    checkin: {
      title: 'Check-In Successful',
      message: 'Thank you for registering your visit. Enjoy your time at the park!',
      actionLabel: 'Return Home',
      actionPath: '/',
    },
    feedback: {
      title: 'Feedback Received',
      message: 'Thank you for your valuable feedback. It helps us improve our parks.',
      actionLabel: 'Submit Another',
      actionPath: '/feedback',
    },
    maintenance: {
      title: 'Request Submitted',
      message: 'Your maintenance request has been recorded and dispatched to on-duty staff.',
      actionLabel: 'Report Another Issue',
      actionPath: '/maintenance',
    },
    general: {
      title: 'Thank You',
      message: 'Your action has been completed successfully.',
      actionLabel: 'Return Home',
      actionPath: '/',
    }
  };
  
  const currentConfig = config[type];

  return (
    <div className="page-container flex items-center justify-center min-h-[70vh]">
      <Card hoverable={false} className="max-w-lg w-full text-center p-8 sm:p-10 border-t-4 border-t-success shadow-lg">
        <div className="w-20 h-20 bg-green-50 text-success rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={44} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{currentConfig.title}</h1>
        <p className="text-gray-600 mb-6 text-base leading-relaxed">
          {currentConfig.message}
        </p>

        {/* RECURRING ISSUE AUTO-ESCALATION NOTICE */}
        {type === 'maintenance' && isRecurring && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-900 text-left">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
              <AlertTriangle size={18} className="text-amber-600" />
              <span>⚡ Priority Auto-Escalated to HIGH</span>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              Multiple visitors ({recentCount} reports within 48 hours) have reported this issue. Our system automatically escalated its priority to HIGH for urgent staff resolution.
            </p>
          </div>
        )}

        {/* TICKET CODE DISPLAY (CLOSED FEEDBACK LOOP) */}
        {type === 'maintenance' && ticketCode && (
          <div className="mb-8 p-5 bg-slate-900 text-white rounded-xl shadow-inner text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Ticket size={14} className="text-primary" /> Your Unique Complaint Ticket Code
            </p>
            <div className="flex items-center justify-center gap-3 my-2">
              <span className="text-2xl font-black font-mono tracking-wider text-amber-400">{ticketCode}</span>
              <button
                type="button"
                onClick={copyTicketCode}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Copy Ticket Code"
              >
                <Copy size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Save this code to check real-time repair progress and read official staff resolution notes.
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          {type === 'maintenance' && ticketCode && (
            <Button
              size="lg"
              onClick={() => navigate(`/track-status?code=${ticketCode}`)}
              icon={Search}
              className="w-full bg-primary hover:bg-primaryDark text-white"
            >
              Track Request Status Live
            </Button>
          )}

          <Button 
            size="lg" 
            variant={type === 'maintenance' && ticketCode ? 'secondary' : 'primary'}
            onClick={() => navigate(currentConfig.actionPath)}
            icon={type === 'checkin' || type === 'general' ? Home : PlusCircle}
            className="w-full"
          >
            {currentConfig.actionLabel}
          </Button>
          
          {(type === 'feedback' || type === 'maintenance') && (
            <Button 
              variant="outline" 
              size="md" 
              onClick={() => navigate('/')}
              icon={Home}
              className="w-full border-gray-300 text-gray-700"
            >
              Return to Homepage
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
