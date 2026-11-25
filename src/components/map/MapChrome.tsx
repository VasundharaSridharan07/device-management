import {
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcIcon,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { MAP_COUNTS, type MapBasemap, type MapPanelView } from '../../data/mapScene';

const HELP_TOOLTIP_ID = 'map-help-tip';

type MapChromeProps = {
  basemap: MapBasemap;
  panelOpen: boolean;
  view: MapPanelView;
  onBasemapChange: (basemap: MapBasemap) => void;
  onOpenPanel: () => void;
  onSearch: () => void;
  onZoomIn: () => void;
};

export function MapChrome({
  basemap,
  panelOpen,
  view,
  onBasemapChange,
  onOpenPanel,
  onSearch,
  onZoomIn,
}: MapChromeProps) {
  const geofenceView = view === 'geofences';

  return (
    <>
      <div className="map-devices-reopen" hidden={panelOpen}>
        <ModusWcButton
          aria-label={geofenceView ? 'Show geofences' : 'Show devices'}
          color="tertiary"
          size="sm"
          variant="outlined"
          onButtonClick={onOpenPanel}
        >
          <ModusWcIcon
            decorative
            name={geofenceView ? 'polygon' : 'in_field_device'}
            size="xs"
          />
          {geofenceView ? 'Geofences' : 'Devices'}
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
          content="Street and satellite basemaps. Device locations are sample data."
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
          aria-label={geofenceView ? 'Search geofences' : 'Search devices'}
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
        <ModusWcTypography size="sm" label={`Assets: ${MAP_COUNTS.assets}`} />
        <ModusWcTypography size="sm" label={`Geofences: ${MAP_COUNTS.geofences}`} />
        <ModusWcTypography size="sm" label={`Alerts: ${MAP_COUNTS.alerts}`} />
      </div>
    </>
  );
}
