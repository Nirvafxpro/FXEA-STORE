import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import RobotDetail from './pages/RobotDetail';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './pages/AdminHome';
import AdminUpload from './pages/AdminUpload';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';

function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
          <Route path="/ea/:id" element={<ClientLayout><RobotDetail /></ClientLayout>} />
          <Route path="/checkout" element={<ClientLayout><Checkout /></ClientLayout>} />
          <Route path="/payment-success" element={<ClientLayout><PaymentSuccess /></ClientLayout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="upload" element={<AdminUpload />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
