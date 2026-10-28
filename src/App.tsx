import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChargingFlow from './pages/charging/ChargingFlow';
import WorkshopFlow from './pages/WorkshopFlow';
import WorkshopDirectory from './pages/WorkshopDirectory';
import RequestDetail from './pages/RequestDetail';
import MyRequests from './pages/MyRequests';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChargingDirectory from './pages/ChargingDirectory';
import NearbyProviders from './pages/NearbyProviders';
import HelpCenter from './pages/HelpCenter';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { QuotaBanner } from './components/common/QuotaBanner';

function App() {
  return (
    <>
      <QuotaBanner />
      <Router>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* Protected Routes wrapped in MainLayout */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/emergency-charging" 
          element={<ProtectedRoute><MainLayout><ChargingFlow /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/workshop-service" 
          element={<ProtectedRoute><MainLayout><WorkshopFlow /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/my-requests" 
          element={<ProtectedRoute><MainLayout><MyRequests /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/request-detail/:id" 
          element={<ProtectedRoute><MainLayout><RequestDetail /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/nearby-providers" 
          element={<ProtectedRoute><MainLayout><NearbyProviders /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/help" 
          element={<ProtectedRoute><MainLayout><HelpCenter /></MainLayout></ProtectedRoute>} 
        />
        
        {/* Hackathon Specific Routes */}
        <Route 
          path="/provider-dashboard" 
          element={<ProtectedRoute><MainLayout><ProviderDashboard /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/charging-directory" 
          element={<ProtectedRoute><MainLayout><ChargingDirectory /></MainLayout></ProtectedRoute>} 
        />
        <Route 
          path="/workshop-directory" 
          element={<ProtectedRoute><MainLayout><WorkshopDirectory /></MainLayout></ProtectedRoute>} 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
