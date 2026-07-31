import { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getUserProfile } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(authUser) {
    setLoading(true);
    try {
      const { data, error } = await getUserProfile();
      if (!error && data) {
        setProfile(data);
        setRole(data.role);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    profile,
    role,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isOfficer: role === 'OFFICER' || role === 'ADMIN' || role === 'SUPER_ADMIN',
    isViewer: !!role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
