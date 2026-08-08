import { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { getUserProfile } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    // Single handler for authentication state
    const handleAuthChange = async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          const { data, error } = await getUserProfile();
          if (!error && data) {
            setProfile(data);
            setRole(data.role);
          } else {
            setProfile(null);
            setRole(null);
          }
        } catch (e) {
          console.error('Error loading profile:', e);
        }
      } else {
        setUser(null);
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isInitialLoadDone.current) {
        isInitialLoadDone.current = true;
        handleAuthChange(session?.user || null);
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isInitialLoadDone.current) {
        handleAuthChange(session?.user || null);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

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
