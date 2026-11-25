import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcTypography,
  ModusWcUtilityPanel,
} from '@trimble-oss/moduswebcomponents-react';

import type { Device } from '../../data/devices';
import type { Project } from '../../data/projects';
import { DeviceProjects } from './DeviceProjects';

type DeviceInfoPanelProps = {
  device: Device | null;
  projects: Project[];
  expanded: boolean;
  targetElement: HTMLElement | null;
  onClose: () => void;
  onAddToProjects: (deviceId: string, projectIds: string[]) => void;
  onRemoveFromProject: (deviceId: string, projectId: string) => void;
};

const DETAIL_FIELDS: Array<{ label: string; value: (device: Device) => string }> = [
  { label: 'Serial Number', value: (device) => device.serialNumber },
  { label: 'Last Updated', value: (device) => device.lastUpdated },
  { label: 'Approximate Location', value: (device) => device.approximateLocation },
  { label: 'Latitude', value: (device) => device.latitude },
  { label: 'Longitude', value: (device) => device.longitude },
  { label: 'Position Update Frequency', value: (device) => device.updateFrequency },
  { label: 'Battery', value: (device) => device.battery },
  { label: 'Signal', value: (device) => device.signal },
];

function MapPreview() {
  return (
    <div className="device-info-map">
      <svg
        aria-hidden="true"
        className="device-info-map-art"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 312 180"
      >
        <rect width="312" height="180" fill="var(--modus-wc-color-base-100)" />
        <g fill="var(--modus-wc-color-base-200)">
          <rect height="8" width="312" y="28" />
          <rect height="16" width="312" y="78" />
          <rect height="10" width="312" y="140" />
          <rect height="180" width="12" x="48" />
          <rect height="180" width="14" x="150" />
          <rect height="180" width="10" x="230" />
        </g>
        <g fill="var(--modus-wc-color-base-300)">
          <rect height="28" width="76" x="66" y="42" />
          <rect height="28" width="52" x="170" y="42" />
          <rect height="26" width="48" x="248" y="44" />
          <rect height="32" width="32" x="8" y="100" />
          <rect height="30" width="36" x="66" y="102" />
          <rect height="30" width="32" x="110" y="102" />
          <rect height="32" width="50" x="172" y="100" />
          <rect height="30" width="48" x="248" y="102" />
        </g>
      </svg>
      <span className="device-info-pin">
        <ModusWcIcon decorative name="pin" size="lg" />
      </span>
      <div className="device-info-map-actions">
        <ModusWcButton
          aria-label="Refresh location"
          color="tertiary"
          shape="square"
          size="sm"
          variant="outlined"
        >
          <ModusWcIcon decorative name="refresh" size="xs" />
        </ModusWcButton>
        <ModusWcButton
          aria-label="Expand map"
          color="tertiary"
          shape="square"
          size="sm"
          variant="outlined"
        >
          <ModusWcIcon decorative name="expand" size="xs" />
        </ModusWcButton>
      </div>
    </div>
  );
}

export function DeviceInfoPanel({
  device,
  projects,
  expanded,
  targetElement,
  onClose,
  onAddToProjects,
  onRemoveFromProject,
}: DeviceInfoPanelProps) {
  return (
    <ModusWcUtilityPanel
      aria-label="Device details"
      backgroundOverlay={false}
      collapseOnClickOutside={false}
      expanded={expanded}
      inert={!expanded}
      pushContent
      targetElement={targetElement ?? undefined}
      onPanelClosed={onClose}
    >
      <div slot="header" className="device-info-header">
        <ModusWcTypography
          customClass="device-info-title"
          hierarchy="h2"
          label={device?.name ?? ''}
          size="sm"
          weight="semibold"
        >
          {device?.name ?? ''}
        </ModusWcTypography>
        <ModusWcButton
          aria-label="Close"
          color="tertiary"
          shape="square"
          size="sm"
          variant="borderless"
          onButtonClick={onClose}
        >
          <ModusWcIcon decorative name="close" size="xs" />
        </ModusWcButton>
      </div>
      <div slot="body" className="device-info-body">
        <div hidden={device == null}>
          {device ? (
            <>
              <MapPreview />
              <dl className="device-info-fields">
                {DETAIL_FIELDS.map((field) => (
                  <div key={field.label} className="device-info-row">
                    <dt>
                      <ModusWcTypography
                        customClass="device-info-label"
                        hierarchy="p"
                        label={field.label}
                        size="sm"
                      />
                    </dt>
                    <dd>
                      <ModusWcTypography
                        customClass="device-info-value"
                        hierarchy="p"
                        label={field.value(device)}
                        size="sm"
                      />
                    </dd>
                  </div>
                ))}
              </dl>
              <DeviceProjects
                key={device.id}
                deviceId={device.id}
                deviceName={device.name}
                projects={projects}
                serialNumber={device.serialNumber}
                serverLocationId={device.serverLocationId}
                onAdd={(projectIds) => onAddToProjects(device.id, projectIds)}
                onRemove={(projectId) => onRemoveFromProject(device.id, projectId)}
              />
            </>
          ) : null}
        </div>
      </div>
    </ModusWcUtilityPanel>
  );
}
