import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, UserPlus, Key, UserX, Trash2, Users, Database, LogOut, Lock, Mail, CheckCircle, RefreshCw, Server, AlertCircle } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Data
  const [profiles, setProfiles] = useState([]);
  const [dbStats, setDbStats] = useState({ parks: 0, visits: 0, feedback: 0, maintenance: 0, profiles: 0 });

  // Modals & Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    designation: 'Park Administrator',
    department: 'GVMC Horticulture',
    role: 'ADMIN',
  });
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('auth_user_id', userId).single();
    if (data) setUserProfile(data);
    loadAllData();
    setLoading(false);
  };

  const loadAllData = async () => {
    // Fetch profiles
    const { data: profs } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (profs) setProfiles(profs);

    // Fetch DB counts
    const [pCount, vCount, fCount, mCount, prCount] = await Promise.all([
      supabase.from('parks').select('*', { count: 'exact', head: true }),
      supabase.from('visits').select('*', { count: 'exact', head: true }),
      supabase.from('feedback').select('*', { count: 'exact', head: true }),
      supabase.from('maintenance_requests').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    setDbStats({
      parks: pCount.count || 0,
      visits: vCount.count || 0,
      feedback: fCount.count || 0,
      maintenance: mCount.count || 0,
      profiles: prCount.count || 0,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserProfile(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionMessage({ text: '', type: '' });
    try {
      // Create user via Supabase SignUp / Auth
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
        options: {
          data: {
            full_name: createForm.full_name,
            role: createForm.role,
          },
        },
      });

      if (authErr) throw authErr;

      // Update or insert into profiles table
      if (authData?.user) {
        await supabase
          .from('profiles')
          .update({
            full_name: createForm.full_name,
            designation: createForm.designation,
            department: createForm.department,
            role: createForm.role,
            active: true,
          })
          .eq('auth_user_id', authData.user.id);
      }

      setActionMessage({ text: `Successfully created admin user: ${createForm.email}`, type: 'success' });
      setShowCreateModal(false);
      setCreateForm({
        email: '',
        password: '',
        full_name: '',
        designation: 'Park Administrator',
        department: 'GVMC Horticulture',
        role: 'ADMIN',
      });
      loadAllData();
    } catch (err) {
      setActionMessage({ text: err.message || 'Failed to create user', type: 'error' });
    }
  };

  const handleRoleChange = async (profileId, newRole) => {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
    if (!error) {
      setActionMessage({ text: 'User role updated successfully.', type: 'success' });
      loadAllData();
    }
  };

  const handleToggleActive = async (profileId, currentStatus) => {
    const { error } = await supabase.from('profiles').update({ active: !currentStatus }).eq('id', profileId);
    if (!error) {
      setActionMessage({ text: `User status updated to ${!currentStatus ? 'Active' : 'Inactive'}.`, type: 'success' });
      loadAllData();
    }
  };

  const handleDeleteProfile = async (profileId, name) => {
    if (!confirm(`Are you sure you want to delete profile for ${name}?`)) return;
    const { error } = await supabase.from('profiles').delete().eq('id', profileId);
    if (!error) {
      setActionMessage({ text: `Deleted user profile ${name}.`, type: 'success' });
      loadAllData();
    }
  };

  const handleResetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (!error) {
      setActionMessage({ text: `Password reset link sent to ${email}`, type: 'success' });
    } else {
      setActionMessage({ text: error.message, type: 'error' });
    }
  };

  // If not logged in, render login view
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <Shield size={36} />
            </div>
            <h1 className="text-2xl font-bold text-white">GVMC Super Admin Portal</h1>
            <p className="text-sm text-slate-400 mt-2">Standalone Control System for Admin Credentials</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Super Admin Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="admin@gvmc.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Access Control Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            Connected to Supabase Project: <code className="text-blue-400 font-mono">xvpvytkdcsvazsvefkxx</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">GVMC Super Admin Control Portal</h1>
            <p className="text-xs text-slate-400">Database & Admin Access Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Connected to Supabase DB</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Banner Action Notification */}
        {actionMessage.text && (
          <div className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            actionMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage({ text: '', type: '' })} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* System Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between text-slate-400 text-xs mb-2">
              <span>Admin Accounts</span>
              <Users size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{dbStats.profiles}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between text-slate-400 text-xs mb-2">
              <span>Registered Parks</span>
              <Server size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{dbStats.parks}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between text-slate-400 text-xs mb-2">
              <span>Live Check-Ins</span>
              <CheckCircle size={16} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{dbStats.visits}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between text-slate-400 text-xs mb-2">
              <span>Visitor Feedback</span>
              <Database size={16} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{dbStats.feedback}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex justify-between text-slate-400 text-xs mb-2">
              <span>Maintenance Requests</span>
              <RefreshCw size={16} className="text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{dbStats.maintenance}</p>
          </div>
        </div>

        {/* Management Table Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-blue-500" />
                Admin & Officer Credential Directory
              </h2>
              <p className="text-xs text-slate-400">Manage email logins, system roles, and access controls for the main portal.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadAllData}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors border border-slate-700"
              >
                <RefreshCw size={14} />
                Refresh Data
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
              >
                <UserPlus size={16} />
                Create New Admin
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">Designation & Dept</th>
                  <th className="px-6 py-4">Role Access</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profiles.map((prof) => (
                  <tr key={prof.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{prof.full_name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{prof.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-slate-200">{prof.designation || 'Administrator'}</div>
                      <div className="text-xs text-slate-500">{prof.department || 'GVMC'}</div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={prof.role}
                        onChange={(e) => handleRoleChange(prof.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OFFICER">OFFICER</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(prof.id, prof.active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          prof.active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {prof.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(prof.email)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Send Password Reset Email"
                        >
                          <Key size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteProfile(prof.id, prof.full_name)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Admin Profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {profiles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      No admin user profiles found. Click "Create New Admin" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="text-blue-500" size={20} />
              Create Admin Logins
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. GVMC Officer Varma"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="admin@gvmc.gov.in"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Designation</label>
                  <input
                    type="text"
                    value={createForm.designation}
                    onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Role Permission</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="OFFICER">OFFICER</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg"
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
