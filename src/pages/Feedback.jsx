import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllParks } from '../services/parkService';
import { submitFeedback } from '../services/feedbackService';
import { validateFeedback } from '../utils/validators';
import { RATING_LABELS } from '../utils/constants';
import Button from '../components/Button';
import Card from '../components/Card';
import RatingStars from '../components/RatingStars';
import { useToast } from '../components/Toast';
import { MessageSquare } from 'lucide-react';

const INITIAL_FORM = {
  park_id: '',
  overall_rating: 0,
  cleanliness: 0,
  safety: 0,
  facilities: 0,
  greenery: 0,
  lighting: 0,
  playground: 0,
  washroom: 0,
  suggestion: '',
  anonymous: true,
};

export default function Feedback() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [parks, setParks] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    async function fetchParks() {
      const { data } = await getAllParks();
      if (data) setParks(data);
    }
    fetchParks();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for the field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRatingChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateFeedback(form);
    
    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      // Remove fields that have a 0 rating so they remain null in DB
      const payload = { ...form };
      Object.keys(payload).forEach(key => {
        if (typeof payload[key] === 'number' && payload[key] === 0) {
          delete payload[key];
        }
      });
      
      const { error } = await submitFeedback(payload);
      if (error) throw error;
      
      toast.success('Feedback submitted successfully!');
      navigate('/thank-you', { state: { type: 'feedback' } });
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="section-title">Visitor Feedback Form</h1>
        <p className="section-subtitle">Help us improve the parks by sharing your experience.</p>
      </div>

      <Card hoverable={false} className="border-t-4 border-t-green-500">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Feedback Details</h2>
          </div>

          <div className="gov-form-group">
            <label className="gov-label text-base font-semibold">Select Park <span className="text-danger">*</span></label>
            <select
              name="park_id"
              value={form.park_id}
              onChange={handleChange}
              className={`gov-select ${errors.park_id ? 'border-danger' : ''}`}
            >
              <option value="">-- Choose a Park --</option>
              {parks.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {p.ward}</option>
              ))}
            </select>
            {errors.park_id && <p className="text-xs text-danger mt-1">{errors.park_id}</p>}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-6">
            <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Rate Your Experience</h3>
            
            <RatingStars 
              label={<span className="font-semibold text-gray-800">Overall Rating <span className="text-danger">*</span></span>}
              value={form.overall_rating} 
              onChange={(val) => handleRatingChange('overall_rating', val)} 
              error={errors.overall_rating}
              size={32}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-gray-200">
              {['cleanliness', 'safety', 'facilities', 'greenery', 'lighting', 'playground', 'washroom'].map((field) => (
                <RatingStars 
                  key={field}
                  label={RATING_LABELS[field]}
                  value={form[field]} 
                  onChange={(val) => handleRatingChange(field, val)} 
                />
              ))}
            </div>
          </div>

          <div className="gov-form-group">
            <label className="gov-label font-semibold">Suggestions / Comments (Optional)</label>
            <textarea
              name="suggestion"
              value={form.suggestion}
              onChange={handleChange}
              className={`gov-textarea ${errors.suggestion ? 'border-danger' : ''}`}
              placeholder="Tell us what you liked or what could be improved..."
              rows={4}
            />
            {errors.suggestion && <p className="text-xs text-danger mt-1">{errors.suggestion}</p>}
          </div>

          <div className="gov-form-group flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              name="anonymous"
              checked={form.anonymous}
              onChange={handleChange}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="anonymous" className="text-sm font-medium text-gray-700 cursor-pointer">
              Submit Anonymously
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
