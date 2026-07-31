import { useState, useEffect } from 'react';
import { getEmployees, createEmployee, updateEmployee, deactivateEmployee, deleteEmployee, resetEmployeePassword } from '../../services/employeeService';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import Breadcrumb from '../../components/Breadcrumb';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Loader, { SkeletonTable } from '../../components/Loader';
import { useToast } from '../../components/Toast';
import { Users, UserPlus, Key, UserX, Trash2, Shield, Mail, Lock, Phone, Briefcase, Building } from 'lucide-react';

const INITIAL_FORM = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  designation: '',
  department: 'Parks & Recreation',
  role: 'OFFICER',
};

export default function EmployeeManagement() {
  const { isSuperAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: '', employee: null });
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await getEmployees();
      if (data) setEmployees(data);
      if (error) console.error(error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      toast.error('Name, Email, and Password are required.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await createEmployee(form);
      if (error) throw error;
      
      toast.success(`Created employee account for ${form.full_name}`);
      setCreateModalOpen(false);
      setForm(INITIAL_FORM);
      loadEmployees();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create employee account.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmAction = async () => {
    const { type, employee } = actionModal;
    if (!employee) return;

    try {
      let error;
      if (type === 'deactivate') {
        const res = await deactivateEmployee(employee.id);
        error = res.error;
      } else if (type === 'delete') {
        const res = await deleteEmployee(employee.id);
        error = res.error;
      } else if (type === 'resetPassword') {
        const res = await resetEmployeePassword(employee.id);
        error = res.error;
      }

      if (error) throw error;

      if (type === 'resetPassword') {
        toast.success(`Password reset email sent to ${employee.email}`);
      } else {
        toast.success(`Successfully ${type}d employee ${employee.full_name}`);
        loadEmployees();
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${type} employee.`);
    } finally {
      setActionModal({ open: false, type: '', employee: null });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="page-container py-12">
        <Card hoverable={false} className="text-center p-8 border-t-4 border-t-danger">
          <Shield size={48} className="mx-auto text-danger mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Super Admin Access Required</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You need Super Admin privileges to manage employee credentials and platform access.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'Employee Access Management' }]} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Staff & Credential Management
          </h1>
          <p className="text-sm text-gray-500">Manage login credentials and roles for park maintenance staff.</p>
        </div>

        <Button 
          icon={UserPlus} 
          onClick={() => setCreateModalOpen(true)}
          className="shadow-md"
        >
          Add Staff Member
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={6} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table min-w-full">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Designation / Dept</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.length > 0 ? (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div className="font-semibold text-gray-800">{emp.full_name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {emp.email}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm text-gray-700">{emp.designation || 'Staff'}</div>
                        <div className="text-xs text-gray-400">{emp.department || 'Parks & Rec'}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          emp.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          emp.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                          emp.role === 'OFFICER' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {emp.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-sm whitespace-nowrap">
                        {formatDate(emp.created_at)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActionModal({ open: true, type: 'resetPassword', employee: emp })}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Reset Password"
                          >
                            <Key size={16} />
                          </button>
                          
                          {emp.active && (
                            <button
                              onClick={() => setActionModal({ open: true, type: 'deactivate', employee: emp })}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                              title="Deactivate Account"
                            >
                              <UserX size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => setActionModal({ open: true, type: 'delete', employee: emp })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-500">
                      <Users size={32} className="mx-auto text-gray-300 mb-3" />
                      No staff accounts found. Click "Add Staff Member" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus className="text-primary" size={20} />
              Create Staff Credentials
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="gov-form-group">
                <label className="gov-label">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleInputChange}
                  className="gov-input"
                  placeholder="e.g. Ramesh Varma"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="gov-form-group">
                  <label className="gov-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    className="gov-input"
                    placeholder="officer@parkms.gov.in"
                    required
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">Initial Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="gov-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="gov-form-group">
                  <label className="gov-label">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleInputChange}
                    className="gov-input"
                    placeholder="Field Inspector"
                  />
                </div>

                <div className="gov-form-group">
                  <label className="gov-label">Role Access</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="gov-select"
                  >
                    {USER_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setCreateModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  loading={submitting}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: '', employee: null })}
        onConfirm={confirmAction}
        title={
          actionModal.type === 'delete' ? 'Delete Account' :
          actionModal.type === 'deactivate' ? 'Deactivate Staff' :
          'Reset Password'
        }
        message={
          actionModal.type === 'delete' ? `Are you sure you want to delete ${actionModal.employee?.full_name}? This action cannot be undone.` :
          actionModal.type === 'deactivate' ? `Deactivate access for ${actionModal.employee?.full_name}? They will no longer be able to log in.` :
          `Send password reset link to ${actionModal.employee?.email}?`
        }
        confirmText={
          actionModal.type === 'delete' ? 'Delete' :
          actionModal.type === 'deactivate' ? 'Deactivate' :
          'Send Reset Link'
        }
        variant={actionModal.type === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
}
