import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RobotDetail from './pages/RobotDetail';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminDashboard from './pages/AdminDashboard';
import AdminHome from './pages/AdminHome';
import AdminUpload from './pages/AdminUpload';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';

// Client layout — shows the public navbar
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
    <HashRouter>
      <Routes>
        {/* ─── Client Routes (public, with navbar) ─── */}
        <Route path="/" element={<ClientLayout><Home /></ClientLayout>} />
        <Route path="/ea/:id" element={<ClientLayout><RobotDetail /></ClientLayout>} />
        <Route path="/checkout" element={<ClientLayout><Checkout /></ClientLayout>} />
        <Route path="/payment-success" element={<ClientLayout><PaymentSuccess /></ClientLayout>} />

        {/* ─── Admin Routes (hidden, separate layout, no public navbar) ─── */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<AdminHome />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
