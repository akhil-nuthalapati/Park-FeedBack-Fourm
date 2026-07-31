import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getUserRole, getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile();
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile();
        } else {
          setUser(null);
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const loadUserProfile = async () => {
    try {
      const [roleResult, profileResult] = await Promise.all([
        getUserRole(),
        getUserProfile(),
      ]);
      if (roleResult.data) setRole(roleResult.data);
      if (profileResult.data) setProfile(profileResult.data);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const value = {
    user,
    profile,
    role,
    loading,
    isAuthenticated: !!user,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isOfficer: role === 'OFFICER' || role === 'ADMIN' || role === 'SUPER_ADMIN',
    refreshProfile: loadUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
