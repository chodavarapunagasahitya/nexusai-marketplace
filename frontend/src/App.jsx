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

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isStandalonePage = location.pathname === '/' || location.pathname === '/auth';

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
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard/client" element={<ClientDashboard />} />
              <Route path="/dashboard/creator" element={<CreatorDashboard />} />
              <Route path="/studio" element={<AIStudioPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/creator/:id" element={<CreatorProfilePage />} />
              <Route path="/projects" element={<ClientDashboard />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/checkout/:id" element={<CheckoutPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/authenticity" element={<AuthenticityAssistantPage />} />
              <Route path="/skill-radar" element={<SkillRadarPage />} />
            </Routes>
          </AppLayout>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}
