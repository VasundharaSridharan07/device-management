import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';

import { AppShell } from './components/layout/AppShell';
import { FleetProvider } from './data/FleetContext';
import { ExperimentProvider } from './experiments/ExperimentContext';
import { AdminUsersPage } from './modules/admin-portal';
import { ConnectProjectSettingsPage, ConnectProjectsPage } from './modules/connect';
import {
  AssetDetailsPage,
  DeviceDetailsPage,
  DevicesPage,
  MapPage,
  PlaceholderPage,
} from './modules/device-management';
import {
  DM_DEVICES_PATH,
  DM_MAP_PATH,
  assetDetailsPath,
  deviceDetailsPath,
  dmSectionPath,
} from './modules/device-management/paths';
import { WorksManagerProjectsPage } from './modules/worksmanager';

function RedirectDeviceDetails() {
  const { deviceId = '' } = useParams();
  return <Navigate to={deviceDetailsPath(deviceId)} replace />;
}

function RedirectAssetDetails() {
  const { assetId = '' } = useParams();
  return <Navigate to={assetDetailsPath(assetId)} replace />;
}

export default function App() {
  return (
    <ExperimentProvider>
      <FleetProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to={DM_MAP_PATH} replace />} />
              <Route path="/devices" element={<Navigate to={DM_DEVICES_PATH} replace />} />
              <Route path="/devices/:deviceId" element={<RedirectDeviceDetails />} />
              <Route path="/assets/:assetId" element={<RedirectAssetDetails />} />
              <Route
                path="/geofences"
                element={<Navigate to={dmSectionPath('geofences')} replace />}
              />
              <Route path="/alerts" element={<Navigate to={dmSectionPath('alerts')} replace />} />
              <Route
                path="/configurations"
                element={<Navigate to={dmSectionPath('configurations')} replace />}
              />
              <Route
                path="/firmware-updates"
                element={<Navigate to={dmSectionPath('firmware-updates')} replace />}
              />
              <Route path="/ibss" element={<Navigate to={dmSectionPath('ibss')} replace />} />
              <Route
                path="/partners"
                element={<Navigate to={dmSectionPath('partners')} replace />}
              />

              <Route path={DM_MAP_PATH} element={<MapPage />} />
              <Route path={DM_DEVICES_PATH} element={<DevicesPage />} />
              <Route path="/device-management/devices/:deviceId" element={<DeviceDetailsPage />} />
              <Route path="/device-management/assets/:assetId" element={<AssetDetailsPage />} />
              <Route path={dmSectionPath('geofences')} element={<PlaceholderPage />} />
              <Route path={dmSectionPath('alerts')} element={<PlaceholderPage />} />
              <Route path={dmSectionPath('configurations')} element={<PlaceholderPage />} />
              <Route path={dmSectionPath('firmware-updates')} element={<PlaceholderPage />} />
              <Route path={dmSectionPath('ibss')} element={<PlaceholderPage />} />
              <Route path={dmSectionPath('partners')} element={<PlaceholderPage />} />

              <Route
                path="/worksmanager"
                element={<Navigate to="/worksmanager/projects" replace />}
              />
              <Route path="/worksmanager/projects" element={<WorksManagerProjectsPage />} />

              <Route path="/connect" element={<Navigate to="/connect/projects" replace />} />
              <Route path="/connect/projects" element={<ConnectProjectsPage />} />
              <Route path="/connect/:projectId/settings" element={<ConnectProjectSettingsPage />} />

              <Route
                path="/admin-portal"
                element={<Navigate to="/admin-portal/account/users" replace />}
              />
              <Route path="/admin-portal/account/users" element={<AdminUsersPage />} />

              <Route path="*" element={<Navigate to={DM_MAP_PATH} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FleetProvider>
    </ExperimentProvider>
  );
}
