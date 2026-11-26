import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcTypography,
  ModusWcUtilityPanel,
} from '@trimble-oss/moduswebcomponents-react';

import type { MapSelection } from '../../data/mapEntities';

type MapSelectionPanelProps = {
  selection: MapSelection | null;
  onClose: () => void;
  onViewDetails: () => void;
};

export function MapSelectionPanel({ selection, onClose, onViewDetails }: MapSelectionPanelProps) {
  const title = selection?.title ?? 'Details';
  const expanded = selection != null;

  return (
    <ModusWcUtilityPanel
      aria-label="Map selection"
      backgroundOverlay={false}
      collapseOnClickOutside={false}
      customClass="map-selection-panel"
      expanded={expanded}
      inert={!expanded}
      pushContent={false}
    >
      <div slot="header" className="device-info-header">
        <ModusWcTypography
          customClass="device-info-title"
          hierarchy="h2"
          label={title}
          size="sm"
          weight="semibold"
        >
          <span>{title}</span>
        </ModusWcTypography>
        <ModusWcButton
          aria-label="Close summary"
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
        <dl className="device-info-fields">
          {(selection?.fields ?? []).map((field) => (
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
                  label={field.value}
                  size="sm"
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div slot="footer" className="map-selection-footer">
        <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={onViewDetails}>
          <ModusWcIcon decorative name="launch" size="xs" />
          <span>View details</span>
        </ModusWcButton>
      </div>
    </ModusWcUtilityPanel>
  );
}
