import { HashRouter, Routes, Route } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import StoreDetail from './pages/StoreDetail';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Naming from './pages/Naming';
import Troubleshooting from './pages/Troubleshooting';
import Onboarding from './pages/Onboarding';
import TicketAssistant from './pages/TicketAssistant';
import TicketLog from './pages/TicketLog';
import Health from './pages/Health';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/stores/:storeId" element={<StoreDetail />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/naming" element={<Naming />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/ticket" element={<TicketAssistant />} />
          <Route path="/tickets" element={<TicketLog />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

