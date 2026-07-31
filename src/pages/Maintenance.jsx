import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllParks } from '../services/parkService';
import { submitComplaint, uploadComplaintPhoto } from '../services/maintenanceService';
import { validateMaintenance } from '../utils/validators';
import SearchableSelect from '../components/SearchableSelect';
import Button from '../components/Button';
import Card from '../components/Card';
import { useToast } from '../components/Toast';
import { Wrench, Upload, X } from 'lucide-react';

const INITIAL_FORM = {
  park_id: '',
  issue_type: '',
  description: '',
};

export default function Maintenance() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [parks, setParks] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);
  
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateMaintenance(form);
    
    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    try {
      let photo_url = null;
      
      // Upload photo if present (with fail-safe base64 fallback)
      if (photo) {
        const { data: uploadedUrl } = await uploadComplaintPhoto(photo);
        photo_url = uploadedUrl;
      }
      
      const payload = {
        ...form,
        photo_url,
      };
      
      const { error } = await submitComplaint(payload);
      if (error) {
        throw new Error(error.message || 'Database error submitting request');
      }
      
      toast.success('Maintenance request submitted successfully!');
      navigate('/thank-you', { state: { type: 'maintenance' } });
    } catch (err) {
      console.error('Submit complaint error:', err);
      toast.error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <div className="text-center mb-8">
        <h1 className="section-title">Report Maintenance Issue</h1>
        <p className="section-subtitle">Help us keep the parks well-maintained and safe.</p>
      </div>

      <Card hoverable={false} className="border-t-4 border-t-orange-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
              <Wrench size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Issue Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="gov-form-group">
              <label className="gov-label font-semibold">Select Park <span className="text-danger">*</span></label>
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

            <div className="gov-form-group">
              <label className="gov-label font-semibold">Issue Category <span className="text-danger">*</span></label>
              <SearchableSelect
                value={form.issue_type}
                onChange={(val) => {
                  setForm(prev => ({ ...prev, issue_type: val }));
                  if (errors.issue_type) setErrors(prev => ({ ...prev, issue_type: null }));
                }}
                error={errors.issue_type}
                placeholder="-- Search or Choose Category --"
              />
              {errors.issue_type && <p className="text-xs text-danger mt-1">{errors.issue_type}</p>}
            </div>
          </div>

          <div className="gov-form-group">
            <label className="gov-label font-semibold">Description <span className="text-danger">*</span></label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`gov-textarea ${errors.description ? 'border-danger' : ''}`}
              placeholder="Please describe the issue in detail (location within park, severity, etc.)"
              rows={5}
            />
            {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
          </div>

          <div className="gov-form-group">
            <label className="gov-label font-semibold">Upload Photo (Optional)</label>
            <div className="mt-2">
              {photoPreview ? (
                <div className="relative inline-block border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img src={photoPreview} alt="Preview" className="max-h-48 rounded object-contain" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    title="Remove photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} className="text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700">Click to upload an image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
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
              icon={Wrench}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
