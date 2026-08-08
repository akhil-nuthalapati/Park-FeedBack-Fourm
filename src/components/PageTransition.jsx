import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-page-enter min-h-[calc(100vh-140px)]">
      {children}
    </div>
  );
}
