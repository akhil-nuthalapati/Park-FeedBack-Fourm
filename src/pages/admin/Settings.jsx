import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import Card from '../../components/Card';
import { useAuth } from '../../hooks/useAuth';
import { Settings as SettingsIcon, User, Shield } from 'lucide-react';

export default function Settings() {
  const { profile, role, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <Breadcrumb items={[{ label: 'System Settings' }]} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <SettingsIcon size={24} className="text-primary" />
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card hoverable={false}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <User className="text-primary" />
              <h2 className="text-lg font-semibold">My Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-800">{profile?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-800">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Designation</p>
                <p className="font-medium text-gray-800">{profile?.designation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-medium text-gray-800">{profile?.department || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <span className="badge bg-primary-light text-primary">{role}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* System Settings (Admin Only) */}
        <div>
          <Card hoverable={false} className="h-full">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <Shield className="text-primary" />
              <h2 className="text-lg font-semibold">System Administration</h2>
            </div>
            
            {isSuperAdmin ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Super Admin controls are available to manage users, parks, and system configuration.
                </p>
                <button 
                  onClick={() => navigate('/admin/employees')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  Manage Employee Access
                </button>
                <button 
                  onClick={() => navigate('/admin/parks')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  Manage Park Profiles
                </button>
                <button 
                  onClick={() => navigate('/admin/parks')}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  QR Code Generator
                </button>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-yellow-800 text-sm">
                You do not have administrative privileges to modify system settings. Please contact the Super Admin for changes.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
