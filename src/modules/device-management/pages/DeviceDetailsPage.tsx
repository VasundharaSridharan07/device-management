import { ModusWcButton, ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { DetailFields } from '../components/DetailFields';
import { DeviceProjects } from '../components/DeviceProjects';
import { MissingRecord, RecordHeading } from '../components/RecordChrome';
import { ReportingBadge } from '../components/reportingDisplay';
import { NO_ASSOCIATED_ASSET, displayValue } from '../../../data/assets';
import { DEVICES, serverLocationLabel } from '../../../data/devices';
import {
  assetFromDeviceState,
  detailsStateFrom,
} from '../../../data/detailsNavigation';
import { useFleet } from '../../../data/FleetContext';
import { deviceReportingState } from '../../../data/mapMarkers';
import { showsAssetView } from '../../../experiments/config';
import { useExperiment } from '../../../experiments/ExperimentContext';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { assetDetailsPath } from '../paths';

function connectivityLabel(connectivity: 'on' | 'off'): string {
  return connectivity === 'on' ? 'Connected' : 'Offline';
}

export function DeviceDetailsPage() {
  const { deviceId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useExperiment();
  const assetViewsEnabled = showsAssetView(config.inventoryView);
  const { projects, assetForDevice, addDeviceProjects, removeDeviceProject } = useFleet();
  const device = DEVICES.find((item) => item.id === deviceId) ?? null;
  const asset = device ? assetForDevice(device.id) : undefined;
  usePageTitle(device?.name ?? 'Device not found');

  const openAsset = useCallback(() => {
    if (!device || !asset) {
      return;
    }

    navigate(assetDetailsPath(asset.id), {
      state: assetFromDeviceState(device.id, detailsStateFrom(location.state)),
    });
  }, [asset, device, location.state, navigate]);

  if (!device) {
    return (
      <MissingRecord
        message="This device is not in the inventory."
        title="Device not found"
      />
    );
  }

  const reporting = deviceReportingState(device);
  const assetName = asset?.name ?? '';
  const assetType = asset?.type ?? '';
  const showViewAsset = asset != null && assetViewsEnabled;

  return (
    <div className="record-page">
      <RecordHeading title={device.name} />
      <ModusWcCard bordered padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcTypography hierarchy="h2" label="Identity" size="lg" weight="semibold" />
        </div>
        <div>
          <DetailFields
            fields={[
              { label: 'Model', value: displayValue(device.model) },
              { label: 'Serial number', value: displayValue(device.serialNumber) },
            ]}
          />
        </div>
      </ModusWcCard>
      <ModusWcCard bordered padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcTypography hierarchy="h2" label="Status" size="lg" weight="semibold" />
        </div>
        <div>
          <div className="detail-link-row">
            <ReportingBadge state={reporting} />
          </div>
          <DetailFields
            fields={[
              { label: 'Last reported', value: displayValue(device.lastUpdated) },
              { label: 'Connectivity', value: connectivityLabel(device.connectivity) },
              { label: 'Signal', value: displayValue(device.signal) },
              { label: 'Battery', value: displayValue(device.battery) },
            ]}
          />
        </div>
      </ModusWcCard>
      <ModusWcCard bordered padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcTypography hierarchy="h2" label="Technical details" size="lg" weight="semibold" />
        </div>
        <div>
          <DetailFields
            fields={[
              { label: 'Current firmware', value: displayValue(device.currentFirmware) },
              { label: 'Available firmware', value: displayValue(device.availableFirmware) },
              { label: 'Approximate location', value: displayValue(device.approximateLocation) },
              { label: 'Latitude', value: displayValue(device.latitude) },
              { label: 'Longitude', value: displayValue(device.longitude) },
              { label: 'Position update frequency', value: displayValue(device.updateFrequency) },
              { label: 'Server location', value: serverLocationLabel(device.serverLocationId) },
            ]}
          />
        </div>
      </ModusWcCard>
      <ModusWcCard bordered padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
          <ModusWcTypography hierarchy="h2" label="Associated asset" size="lg" weight="semibold" />
        </div>
        <div>
          <div hidden={asset == null}>
            <DetailFields
              fields={[
                { label: 'Name', value: assetName },
                { label: 'Type', value: assetType },
              ]}
            />
          </div>
          <div hidden={asset != null}>
            <ModusWcTypography
              customClass="app-muted"
              hierarchy="p"
              label={NO_ASSOCIATED_ASSET}
              size="sm"
            />
          </div>
        </div>
        <div
          slot="actions"
          aria-hidden={showViewAsset ? undefined : true}
          className={showViewAsset ? 'flex w-full flex-wrap justify-end gap-2' : 'hidden'}
        >
          <ModusWcButton
            aria-label={assetName ? `View ${assetName}` : 'View asset'}
            color="tertiary"
            size="sm"
            variant="outlined"
            onButtonClick={openAsset}
          >
            <span>View asset</span>
          </ModusWcButton>
        </div>
      </ModusWcCard>
      <ModusWcCard bordered padding="compact">
        <DeviceProjects
          key={device.id}
          embedded
          deviceId={device.id}
          deviceName={device.name}
          projects={projects}
          serialNumber={device.serialNumber}
          serverLocationId={device.serverLocationId}
          onAdd={(projectIds) => addDeviceProjects(device.id, projectIds)}
          onRemove={(projectId) => removeDeviceProject(device.id, projectId)}
        />
      </ModusWcCard>
    </div>
  );
}
