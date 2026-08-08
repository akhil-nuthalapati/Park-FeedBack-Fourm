import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import SplashScreen from './components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
