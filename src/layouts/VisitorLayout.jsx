import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { getBroadcastAnnouncement } from '../services/announcementService';
import { AlertTriangle, Bell, X } from 'lucide-react';

export default function VisitorLayout() {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchAnnouncement = async () => {
    const data = await getBroadcastAnnouncement();
    if (data && data.active && data.message) {
      setAnnouncement(data);
      setDismissed(false);
    } else {
      setAnnouncement(null);
    }
  };

  useEffect(() => {
    fetchAnnouncement();

    window.addEventListener('announcementUpdated', fetchAnnouncement);
    window.addEventListener('storage', fetchAnnouncement);

    return () => {
      window.removeEventListener('announcementUpdated', fetchAnnouncement);
      window.removeEventListener('storage', fetchAnnouncement);
    };
  }, []);

  const getBannerColor = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-600 text-white border-red-700';
      case 'warning':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-blue-600 text-white border-blue-700';
    }
  };

  const getBannerIcon = (type) => {
    switch (type) {
      case 'emergency':
        return <AlertTriangle size={18} className="flex-shrink-0 animate-bounce" />;
      case 'warning':
        return <AlertTriangle size={18} className="flex-shrink-0" />;
      default:
        return <Bell size={18} className="flex-shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {announcement && !dismissed && (
        <div className={`px-4 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md border-b transition-all ${getBannerColor(announcement.type)}`}>
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full pr-2">
            {getBannerIcon(announcement.type)}
            <span className="leading-snug">
              {announcement.park_name && announcement.park_name !== 'All Parks' && (
                <span className="mr-1.5 px-2 py-0.5 bg-black/20 rounded font-bold uppercase text-[11px]">
                  [{announcement.park_name}]
                </span>
              )}
              {announcement.message}
            </span>
          </div>
          <button 
            onClick={() => setDismissed(true)} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            title="Dismiss Announcement"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
