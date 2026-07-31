import { useState, useEffect } from 'react';
import { getAllParks, createPark, updatePark } from '../../services/parkService';
import { formatDate } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import { SkeletonTable } from '../../components/Loader';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import {
  Trees,
  Plus,
  Search,
  Filter,
  Edit,
  QrCode,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  ExternalLink,
} from 'lucide-react';

export default function ParkManagement() {
  const [loading, setLoading] = useState(true);
  const [parks, setParks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();

  // Modals state
  const [parkModalOpen, setParkModalOpen] = useState(false);
  const [editingPark, setEditingPark] = useState(null); // null for new park, park object for edit
  const [submitting, setSubmitting] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrPark, setActiveQrPark] = useState(null);

  // Form State
  const [form, setForm] = useState({
    name: '',
    location: '',
    ward: '',
    latitude: '17.700000',
    longitude: '83.300000',
    status: 'active',
    qr_code: '',
  });

  useEffect(() => {
    loadParks();
  }, []);

  const loadParks = async () => {
    setLoading(true);
    try {
      const { data, error } = await getAllParks();
      if (!error && data) {
        setParks(data);
      } else if (error) {
        toast.error('Failed to load parks data.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error fetching parks.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingPark(null);
    const nextNum = String(parks.length + 1).padStart(3, '0');
    setForm({
      name: '',
      location: '',
      ward: '',
      latitude: '17.700000',
      longitude: '83.300000',
      status: 'active',
      qr_code: `PARK-${nextNum}`,
    });
    setParkModalOpen(true);
  };

  const handleOpenEditModal = (park) => {
    setEditingPark(park);
    setForm({
      name: park.name || '',
      location: park.location || '',
      ward: park.ward || '',
      latitude: park.latitude ? String(park.latitude) : '17.700000',
      longitude: park.longitude ? String(park.longitude) : '83.300000',
      status: park.status || 'active',
      qr_code: park.qr_code || '',
    });
    setParkModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPark = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Park name is required.');
      return;
    }
    if (!form.qr_code.trim()) {
      toast.error('QR code identifier is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        ward: form.ward.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        status: form.status,
        qr_code: form.qr_code.trim().toUpperCase(),
      };

      if (editingPark) {
        const { data, error } = await updatePark(editingPark.id, payload);
        if (error) throw error;
        toast.success(`Updated "${form.name}" successfully!`);
      } else {
        const { data, error } = await createPark(payload);
        if (error) throw error;
        toast.success(`New park "${form.name}" added successfully!`);
      }

      setParkModalOpen(false);
      loadParks();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save park information.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Parks
  const filteredParks = parks.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ward?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.qr_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats calculation
  const totalParks = parks.length;
  const activeCount = parks.filter((p) => p.status === 'active').length;
  const maintenanceCount = parks.filter((p) => p.status === 'maintenance').length;
  const inactiveCount = parks.filter((p) => p.status === 'inactive').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-green-100 text-green-800 border border-green-200">Active</span>;
      case 'maintenance':
        return <span className="badge bg-amber-100 text-amber-800 border border-amber-200">Under Maintenance</span>;
      case 'inactive':
        return <span className="badge bg-gray-100 text-gray-700 border border-gray-200">Inactive</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Park Management' }]} />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trees size={26} className="text-primary" />
            Park Directory & Infrastructure
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage municipal public parks, update operational statuses, and generate visitor QR check-in codes.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          <span>Add New Park</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Trees size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Parks</p>
            <p className="text-xl font-extrabold text-gray-800">{totalParks}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Active & Open</p>
            <p className="text-xl font-extrabold text-green-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Maintenance</p>
            <p className="text-xl font-extrabold text-amber-600">{maintenanceCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Inactive</p>
            <p className="text-xl font-extrabold text-gray-700">{inactiveCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search park name, ward, location, QR..."
            className="gov-input pl-9 pr-8 py-2 text-sm w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="gov-select pl-9 py-2 text-sm"
            >
              <option value="">All Operational Statuses</option>
              <option value="active">Active Only</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parks Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={6} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table min-w-full">
              <thead>
                <tr>
                  <th>Park Details</th>
                  <th>Ward</th>
                  <th>Coordinates</th>
                  <th>Status</th>
                  <th>QR Check-In Code</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParks.length > 0 ? (
                  filteredParks.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin size={16} className="text-primary flex-shrink-0" />
                          <span>{p.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">{p.location || 'Location N/A'}</div>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                          {p.ward || 'N/A'}
                        </span>
                      </td>
                      <td className="text-xs font-mono text-gray-500">
                        {p.latitude && p.longitude
                          ? `${Number(p.latitude).toFixed(4)}, ${Number(p.longitude).toFixed(4)}`
                          : 'Not specified'}
                      </td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td>
                        <button
                          onClick={() => {
                            setActiveQrPark(p);
                            setQrModalOpen(true);
                          }}
                          className="font-mono text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-semibold inline-flex items-center gap-1 border border-blue-100 transition-colors"
                        >
                          <QrCode size={12} />
                          <span>{p.qr_code}</span>
                        </button>
                      </td>
                      <td className="text-xs text-gray-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Edit Park"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveQrPark(p);
                              setQrModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View QR Code"
                          >
                            <QrCode size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <Trees size={36} className="mx-auto text-gray-300 mb-3" />
                      No parks found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Park Modal */}
      {parkModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setParkModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-fade-in-up border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Trees size={20} className="text-primary" />
                {editingPark ? 'Edit Park Details' : 'Register New Public Park'}
              </h2>
              <button
                onClick={() => setParkModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPark} className="space-y-4">
              <div className="gov-form-group">
                <label className="gov-label font-semibold">
                  Park Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Vuda City Central Park"
                  className="gov-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="gov-form-group">
                  <label className="gov-label font-semibold">Location / Area</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleFormChange}
                    placeholder="e.g. Siripuram Circle"
                    className="gov-input"
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label font-semibold">Ward Number / Name</label>
                  <input
                    type="text"
                    name="ward"
                    value={form.ward}
                    onChange={handleFormChange}
                    placeholder="e.g. Ward 18"
                    className="gov-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="gov-form-group">
                  <label className="gov-label font-semibold">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 17.701200"
                    className="gov-input font-mono text-xs"
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label font-semibold">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 83.310000"
                    className="gov-input font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="gov-form-group">
                  <label className="gov-label font-semibold">Operational Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="gov-select"
                  >
                    <option value="active">Active (Open to Public)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive (Closed)</option>
                  </select>
                </div>

                <div className="gov-form-group">
                  <label className="gov-label font-semibold">
                    QR Code Identifier <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="qr_code"
                    value={form.qr_code}
                    onChange={handleFormChange}
                    placeholder="e.g. PARK-006"
                    className="gov-input font-mono text-xs uppercase"
                    required
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setParkModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary px-5 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-md"
                >
                  {submitting ? 'Saving...' : editingPark ? 'Save Changes' : 'Create Park'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {qrModalOpen && activeQrPark && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <QrCode size={18} className="text-primary" />
                Visitor Check-In QR
              </h3>
              <button onClick={() => setQrModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/checkin/${activeQrPark.qr_code}`
                )}`}
                alt={`QR for ${activeQrPark.name}`}
                className="w-44 h-44 rounded-lg shadow-md border border-white"
              />
              <p className="mt-3 font-mono font-bold text-sm text-gray-800 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-xs">
                {activeQrPark.qr_code}
              </p>
            </div>

            <div>
              <p className="font-bold text-gray-800 text-sm">{activeQrPark.name}</p>
              <p className="text-xs text-gray-500">{activeQrPark.location} ({activeQrPark.ward})</p>
            </div>

            <div className="pt-2">
              <a
                href={`/checkin/${activeQrPark.qr_code}`}
                target="_blank"
                rel="noreferrer"
                className="w-full px-4 py-2 bg-blue-50 hover:bg-blue-100 text-primary text-xs font-bold rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors border border-blue-100"
              >
                <ExternalLink size={14} />
                <span>Test Check-In Page URL</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
