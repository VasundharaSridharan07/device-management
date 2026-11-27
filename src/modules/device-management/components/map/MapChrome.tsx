import {
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcIcon,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import {
  MAP_COUNTS,
  type MapBasemap,
  type MapEntityView,
  type MapPanelView,
} from '../../../../data/mapScene';

const HELP_TOOLTIP_ID = 'map-help-tip';

type MapChromeProps = {
  assetCount: number;
  basemap: MapBasemap;
  deviceCount: number;
  entityView: MapEntityView;
  panelOpen: boolean;
  view: MapPanelView;
  onBasemapChange: (basemap: MapBasemap) => void;
  onOpenPanel: () => void;
  onSearch: () => void;
  onZoomIn: () => void;
};

export function MapChrome({
  assetCount,
  basemap,
  deviceCount,
  entityView,
  panelOpen,
  view,
  onBasemapChange,
  onOpenPanel,
  onSearch,
  onZoomIn,
}: MapChromeProps) {
  const geofenceView = view === 'geofences';
  const assetView = entityView === 'assets';
  const listLabel = geofenceView ? 'Geofences' : assetView ? 'Assets' : 'Devices';
  const searchLabel = geofenceView
    ? 'Search geofences'
    : assetView
      ? 'Search assets'
      : 'Search devices';
  const entityStatus = assetView ? `Assets: ${assetCount}` : `Devices: ${deviceCount}`;
  const reopenIcon = geofenceView ? 'polygon' : assetView ? 'pin' : 'in_field_device';

  return (
    <>
      <div className="map-devices-reopen" hidden={panelOpen}>
        <ModusWcButton
          aria-label={`Show ${listLabel.toLowerCase()}`}
          color="tertiary"
          size="sm"
          variant="outlined"
          onButtonClick={onOpenPanel}
        >
          <ModusWcIcon
            decorative
            name={reopenIcon}
            size="xs"
          />
          <span>{listLabel}</span>
        </ModusWcButton>
      </div>
      <div className="map-controls">
        <ModusWcButtonGroup
          aria-label="Basemap"
          color="tertiary"
          selectionType="single"
          variant="outlined"
          onButtonGroupClick={(event) => {
            const label = event.detail.button.textContent?.trim();
            if (label === 'Satellite') {
              onBasemapChange('satellite');
              return;
            }
            if (label === 'Street') {
              onBasemapChange('street');
            }
          }}
        >
          <ModusWcButton pressed={basemap === 'street'} size="sm">
            Street
          </ModusWcButton>
          <ModusWcButton pressed={basemap === 'satellite'} size="sm">
            Satellite
          </ModusWcButton>
        </ModusWcButtonGroup>
        <ModusWcTooltip
          content="Street and satellite basemaps. Locations are sample data."
          position="bottom"
          tooltipId={HELP_TOOLTIP_ID}
        >
          <ModusWcButton
            aria-describedby={HELP_TOOLTIP_ID}
            aria-label="Map help"
            color="tertiary"
            shape="square"
            size="sm"
            variant="outlined"
          >
            <ModusWcIcon decorative name="help" size="xs" />
          </ModusWcButton>
        </ModusWcTooltip>
        <ModusWcButton
          aria-label="Zoom in"
          color="tertiary"
          shape="square"
          size="sm"
          variant="outlined"
          onButtonClick={onZoomIn}
        >
          <ModusWcIcon decorative name="zoom_in" size="xs" />
        </ModusWcButton>
        <ModusWcButton
          aria-label={searchLabel}
          color="tertiary"
          shape="square"
          size="sm"
          variant="outlined"
          onButtonClick={onSearch}
        >
          <ModusWcIcon decorative name="search" size="xs" />
        </ModusWcButton>
      </div>
      <div className="map-status">
        <ModusWcTypography size="sm" label={entityStatus} />
        <ModusWcTypography size="sm" label={`Geofences: ${MAP_COUNTS.geofences}`} />
        <ModusWcTypography size="sm" label={`Alerts: ${MAP_COUNTS.alerts}`} />
      </div>
    </>
  );
}
