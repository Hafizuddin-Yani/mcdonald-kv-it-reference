import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import StoreDirectory from './pages/StoreDirectory';
import StoreDetail from './pages/StoreDetail';
import DeviceCatalog from './pages/DeviceCatalog';
import DeviceDetail from './pages/DeviceDetail';
import NamingConvention from './pages/NamingConvention';
import Troubleshooting from './pages/Troubleshooting';
import Onboarding from './pages/Onboarding';
import Search from './pages/Search';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stores" element={<StoreDirectory />} />
          <Route path="/stores/:id" element={<StoreDetail />} />
          <Route path="/devices" element={<DeviceCatalog />} />
          <Route path="/devices/:type" element={<DeviceDetail />} />
          <Route path="/naming" element={<NamingConvention />} />
          <Route path="/troubleshooting" element={<Troubleshooting />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
