import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { ExperimentProvider } from './experiments/ExperimentContext';
import { DevicesPage } from './pages/DevicesPage';
import { MapPage } from './pages/MapPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

export default function App() {
  return (
    <ExperimentProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<MapPage />} />
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/geofences" element={<PlaceholderPage />} />
            <Route path="/alerts" element={<PlaceholderPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ExperimentProvider>
  );
}
