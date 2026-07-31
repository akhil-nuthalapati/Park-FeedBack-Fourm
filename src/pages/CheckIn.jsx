import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParkByQrCode, getAllParks } from '../services/parkService';
import { logVisit } from '../services/visitService';
import { getDeviceId, getCurrentDate, formatTime, getParkOperationalStatus } from '../utils/helpers';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { useToast } from '../components/Toast';
import { CheckCircle, MapPin } from 'lucide-react';

export default function CheckIn() {
  const { qrCode } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [park, setPark] = useState(null);
  const [allParks, setAllParks] = useState([]);
  const [selectedParkId, setSelectedParkId] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (qrCode) {
          const { data, error } = await getParkByQrCode(qrCode);
          if (data) {
            setPark(data);
            setSelectedParkId(data.id);
          } else {
            toast.warning('Invalid QR Code. Please select a park manually.');
            fetchParks();
          }
        } else {
          fetchParks();
        }
      } catch (err) {
        toast.error('Failed to load park information.');
        fetchParks();
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [qrCode]);
  
  async function fetchParks() {
    const { data } = await getAllParks();
    if (data) setAllParks(data);
  }

  const handleParkChange = (e) => {
    const pId = e.target.value;
    setSelectedParkId(pId);
    const selected = allParks.find(p => p.id === pId);
    if (selected) setPark(selected);
  };

  const handleCheckIn = async () => {
    if (!selectedParkId) {
      toast.error('Please select a park first.');
      return;
    }
    
    setSubmitting(true);
    try {
      const deviceId = getDeviceId();
      const { error } = await logVisit(selectedParkId, deviceId);
      
      if (error) throw error;
      
      toast.success('Successfully checked in!');
      navigate('/thank-you', { state: { type: 'checkin' } });
    } catch (error) {
      console.error(error);
      toast.error('Check-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-container flex justify-center py-20"><Loader text="Verifying Park Details..." /></div>;
  }

  return (
    <div className="page-container max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="section-title">Visitor Check-In</h1>
        <p className="section-subtitle">Register your visit to help us manage park facilities.</p>
      </div>
      
      <Card hoverable={false} className="border-t-4 border-t-primary">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} />
          </div>
          
          {!qrCode && !park && (
             <div className="gov-form-group text-left mb-6">
                <label className="gov-label font-semibold">Select Park</label>
                <select 
                  className="gov-select" 
                  value={selectedParkId} 
                  onChange={handleParkChange}
                >
                  <option value="">-- Choose a Park --</option>
                  {allParks.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.ward}</option>
                  ))}
                </select>
             </div>
           )}

          {park && (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{park.name}</h2>
              </div>
              <p className="text-gray-500 mb-3">{park.location} ({park.ward})</p>

              {(() => {
                const opStatus = getParkOperationalStatus(park.status);
                return (
                  <div className="mb-6 flex flex-col items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${opStatus.badgeClass}`}>
                      {opStatus.label}
                    </span>
                    {!opStatus.isOpen && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                        🌙 <strong>Note:</strong> Standard municipal operating hours are <strong>5:00 AM – 9:00 PM</strong>. Your visit will be logged for tonight's record.
                      </p>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          <div className="bg-gray-50 rounded-lg p-6 flex flex-col sm:flex-row justify-center gap-8 mb-6 border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-gray-800">{getCurrentDate()}</p>
            </div>
            <div className="hidden sm:block w-px bg-gray-200"></div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Time</p>
              <p className="font-semibold text-gray-800">{formatTime(currentTime)}</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-8 italic">
            "Your visit helps us understand park usage and improve facilities."
          </p>

          <Button 
            size="lg" 
            className="w-full text-lg shadow-md" 
            onClick={handleCheckIn}
            loading={submitting}
            disabled={!selectedParkId}
            icon={CheckCircle}
          >
            Confirm Check-In
          </Button>
        </div>
      </Card>
    </div>
  );
}
