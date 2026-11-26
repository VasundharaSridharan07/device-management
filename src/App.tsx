import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { FleetProvider } from './data/FleetContext';
import { ExperimentProvider } from './experiments/ExperimentContext';
import { AssetDetailsPage } from './pages/AssetDetailsPage';
import { DeviceDetailsPage } from './pages/DeviceDetailsPage';
import { DevicesPage } from './pages/DevicesPage';
import { MapPage } from './pages/MapPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <ExperimentProvider>
      <FleetProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<MapPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/devices/:deviceId" element={<DeviceDetailsPage />} />
              <Route path="/assets/:assetId" element={<AssetDetailsPage />} />
              <Route path="/geofences" element={<PlaceholderPage />} />
              <Route path="/alerts" element={<PlaceholderPage />} />
              <Route path="/configurations" element={<PlaceholderPage />} />
              <Route path="/firmware-updates" element={<PlaceholderPage />} />
              <Route path="/ibss" element={<PlaceholderPage />} />
              <Route path="/partners" element={<PlaceholderPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FleetProvider>
    </ExperimentProvider>
  );
}
