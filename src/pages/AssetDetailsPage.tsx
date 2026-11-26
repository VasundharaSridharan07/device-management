import { ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { AssociatedDeviceTable } from '../components/devices/AssociatedDeviceTable';
import { EquipmentCard } from '../components/devices/EquipmentCard';
import { MissingRecord, RecordHeading } from '../components/devices/RecordChrome';
import { ReportedComponents } from '../components/devices/ReportedComponents';
import { displayValue } from '../data/assets';
import { deviceFromAssetState, detailsStateFrom } from '../data/detailsNavigation';
import { useFleet } from '../data/FleetContext';
import { usePageTitle } from '../hooks/usePageTitle';

function deviceCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'device' : 'devices'}`;
}

export function AssetDetailsPage() {
  const { assetId = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { assets } = useFleet();
  const asset = assets.find((item) => item.id === assetId) ?? null;
  usePageTitle(asset?.name ?? 'Asset not found');

  const openDevice = useCallback(
    (id: string) => {
      if (!asset) {
        return;
      }

      navigate(`/devices/${id}`, {
        state: deviceFromAssetState(asset.id, detailsStateFrom(location.state)),
      });
    },
    [asset, location.state, navigate],
  );

  if (!asset) {
    return <MissingRecord message="This asset is not in the inventory." title="Asset not found" />;
  }

  const fields = [
    { label: 'Type', value: displayValue(asset.type) },
    { label: 'Make', value: displayValue(asset.make) },
    { label: 'Model', value: displayValue(asset.model) },
    { label: 'Serial number', value: displayValue(asset.serialNumber) },
    { label: 'Attachment', value: displayValue(asset.attachmentName) },
    { label: 'Last reported', value: displayValue(asset.lastReported) },
    { label: 'Location', value: displayValue(asset.locationLabel) },
    { label: 'Latitude', value: String(asset.latitude) },
    { label: 'Longitude', value: String(asset.longitude) },
  ];

  return (
    <div className="record-page">
      <RecordHeading title={asset.name} />
      <EquipmentCard key={asset.id} asset={asset} fields={fields} />
      <ReportedComponents components={asset.components} />
      <ModusWcCard bordered padding="compact">
        <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-between gap-2">
          <ModusWcTypography
            hierarchy="h2"
            label="Associated devices"
            size="lg"
            weight="semibold"
          />
          <ModusWcTypography
            customClass="app-muted"
            hierarchy="p"
            label={deviceCountLabel(asset.deviceIds.length)}
            size="sm"
          />
        </div>
        <div>
          <AssociatedDeviceTable deviceIds={asset.deviceIds} onOpen={openDevice} />
        </div>
      </ModusWcCard>
    </div>
  );
}
