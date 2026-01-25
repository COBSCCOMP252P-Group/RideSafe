import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { useAuthProvider, AuthContext } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/shared/LoginPage';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { DriverDashboard } from './pages/driver/DriverDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RegisterReq} from './pages/shared/registerReq';
function ProtectedRoute({
  children,
  allowedRole



}: {children: React.ReactNode;allowedRole: string;}) {
  const { user, isLoading } = useContext(AuthContext);
  if (isLoading)
  return (
    <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== allowedRole) {
    // Redirect to their correct dashboard if they try to access wrong one
    if (user.role === 'parent') return <Navigate to="/parent" />;
    if (user.role === 'driver') return <Navigate to="/driver" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;
  }
  return <>{children}</>;
}
export function App() {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <Routes>
            <Route
              path="/login"
              element={
              auth.user ?
              <Navigate to={`/${auth.user.role}`} /> :

              <LoginPage />

              } />


            <Route
              path="/parent"
              element={
              <ProtectedRoute allowedRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              } />


            <Route
              path="/driver"
              element={
              <ProtectedRoute allowedRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              } />


            <Route
              path="/admin"
              element={
              <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/register-req" element={<RegisterReq />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>);

}