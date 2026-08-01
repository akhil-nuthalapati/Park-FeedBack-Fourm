import { Routes, Route } from 'react-router-dom';
import VisitorLayout from '../layouts/VisitorLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';

import Home from '../pages/Home';
import About from '../pages/About';
import CheckIn from '../pages/CheckIn';
import Feedback from '../pages/Feedback';
import Maintenance from '../pages/Maintenance';
import TrackStatus from '../pages/TrackStatus';
import ThankYou from '../pages/ThankYou';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

import Dashboard from '../pages/Dashboard';
import FeedbackManagement from '../pages/admin/FeedbackManagement';
import MaintenanceManagement from '../pages/admin/MaintenanceManagement';
import Analytics from '../pages/admin/Analytics';
import Settings from '../pages/admin/Settings';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import ParkManagement from '../pages/admin/ParkManagement';

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public visitor routes */}
        <Route element={<VisitorLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/checkin/:qrCode" element={<CheckIn />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/track-status" element={<TrackStatus />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/parks" element={<ParkManagement />} />
            <Route path="/admin/feedback" element={<FeedbackManagement />} />
            <Route path="/admin/maintenance" element={<MaintenanceManagement />} />
            <Route path="/admin/employees" element={<EmployeeManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
