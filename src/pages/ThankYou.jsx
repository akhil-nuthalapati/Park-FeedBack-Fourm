import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { CheckCircle, Home, PlusCircle } from 'lucide-react';

export default function ThankYou() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const type = location.state?.type || 'general';
  
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
      message: 'Your maintenance request has been recorded. Our team will look into it shortly.',
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
      <Card hoverable={false} className="max-w-md w-full text-center p-10 border-t-4 border-t-success">
        <div className="w-24 h-24 bg-green-50 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{currentConfig.title}</h1>
        <p className="text-gray-600 mb-10 text-lg">
          {currentConfig.message}
        </p>
        
        <div className="flex flex-col gap-4">
          <Button 
            size="lg" 
            onClick={() => navigate(currentConfig.actionPath)}
            icon={type === 'checkin' || type === 'general' ? Home : PlusCircle}
            className="w-full"
          >
            {currentConfig.actionLabel}
          </Button>
          
          {(type === 'feedback' || type === 'maintenance') && (
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => navigate('/')}
              icon={Home}
              className="w-full"
            >
              Return Home
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
