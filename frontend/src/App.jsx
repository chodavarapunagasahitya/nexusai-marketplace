import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ClientDashboard from './pages/ClientDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import AIStudioPage from './pages/AIStudioPage';
import MarketplacePage from './pages/MarketplacePage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MessagesPage from './pages/MessagesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/SettingsPage';
import AuthenticityAssistantPage from './pages/AuthenticityAssistantPage';
import SkillRadarPage from './pages/SkillRadarPage';
import CheckoutPage from './pages/CheckoutPage';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    const fallbackPath = user.role === 'creator' ? '/dashboard/creator' : '/dashboard/client';
    return <Navigate to={fallbackPath} replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role === 'creator') return <Navigate to="/dashboard/creator" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard/client" replace />;
}

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isStandalonePage = location.pathname === '/auth';

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {!isStandalonePage && (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <main className={`flex-1 transition-all ${!isStandalonePage ? 'lg:pl-64' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {children}
        </div>
      </main>

      <div className={!isStandalonePage ? 'lg:pl-64' : ''}>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Root directs immediately to Login page or user's dashboard if already authenticated */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Protected user routes */}
              <Route path="/dashboard/client" element={
                <ProtectedRoute requiredRole="client"><ClientDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/creator" element={
                <ProtectedRoute requiredRole="creator"><CreatorDashboard /></ProtectedRoute>
              } />
              <Route path="/studio" element={
                <ProtectedRoute><AIStudioPage /></ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute><MarketplacePage /></ProtectedRoute>
              } />
              <Route path="/creator/:id" element={
                <ProtectedRoute><CreatorProfilePage /></ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute><ClientDashboard /></ProtectedRoute>
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
              } />
              <Route path="/checkout/:id" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute><MessagesPage /></ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              } />
              <Route path="/authenticity" element={
                <ProtectedRoute><AuthenticityAssistantPage /></ProtectedRoute>
              } />
              <Route path="/skill-radar" element={
                <ProtectedRoute><SkillRadarPage /></ProtectedRoute>
              } />
            </Routes>
          </AppLayout>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}
