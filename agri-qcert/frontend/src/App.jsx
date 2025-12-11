import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Exporter pages
import ExporterDashboard from './pages/exporter/Dashboard';
import BatchSubmission from './pages/exporter/BatchSubmission';
import BatchDetails from './pages/exporter/BatchDetails';

// QA Agency pages
import QADashboard from './pages/qa-agency/Dashboard';
import InspectionList from './pages/qa-agency/InspectionList';
import InspectionForm from './pages/qa-agency/InspectionForm';

// Importer pages
import ImporterDashboard from './pages/importer/Dashboard';
import VerifyCredential from './pages/importer/VerifyCredential';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyCredential />} />
          <Route path="/verify/:credentialId" element={<VerifyCredential />} />
          <Route path="/importer/verify" element={<VerifyCredential />} />
          <Route path="/importer/verify/:credentialId" element={<VerifyCredential />} />

          {/* Exporter routes */}
          <Route
            path="/exporter/dashboard"
            element={<ProtectedRoute requiredRole="exporter"><ExporterDashboard /></ProtectedRoute>}
          />
          <Route
            path="/exporter/submit-batch"
            element={<ProtectedRoute requiredRole="exporter"><BatchSubmission /></ProtectedRoute>}
          />
          <Route
            path="/exporter/batch/:id"
            element={<ProtectedRoute requiredRole="exporter"><BatchDetails /></ProtectedRoute>}
          />

          {/* QA Agency routes */}
          <Route
            path="/qa-agency/dashboard"
            element={<ProtectedRoute requiredRole="qa_agency"><QADashboard /></ProtectedRoute>}
          />
          <Route
            path="/qa-agency/inspections"
            element={<ProtectedRoute requiredRole="qa_agency"><InspectionList /></ProtectedRoute>}
          />
          <Route
            path="/qa-agency/inspection/:id"
            element={<ProtectedRoute requiredRole="qa_agency"><InspectionForm /></ProtectedRoute>}
          />

          {/* Importer routes */}
          <Route
            path="/importer/dashboard"
            element={<ProtectedRoute requiredRole="importer"><ImporterDashboard /></ProtectedRoute>}
          />


          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
