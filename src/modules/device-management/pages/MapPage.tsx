import {
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DevicesPanel } from '../components/map/DevicesPanel';
import { MapCanvas, type MapCanvasHandle } from '../components/map/MapCanvas';
import { MapChrome } from '../components/map/MapChrome';
import { MapSelectionPanel } from '../components/map/MapSelectionPanel';
import { useFleet } from '../../../data/FleetContext';
import {
  assetSelection,
  buildMapAssets,
  buildMapDevices,
  deviceSelection,
  toMapPin,
  visibleMapAssets,
  visibleMapDevices,
  type MapSelection,
} from '../../../data/mapEntities';
import {
  visibleMapGeofences,
  type MapBasemap,
  type MapEntityView,
  type MapFilter,
  type MapGeofenceCategory,
  type MapPanelView,
} from '../../../data/mapScene';
import { readMapSession, writeMapSession, type MapCamera } from '../../../data/mapSession';
import { showsAssetView } from '../../../experiments/config';
import { useExperiment } from '../../../experiments/ExperimentContext';

const INITIAL_CATEGORY_VISIBILITY: Record<MapGeofenceCategory, boolean> = {
  geofence: true,
  'project-boundary': false,
  avoidance: false,
};

function focusSearchField(host: HTMLElement | null) {
  const input =
    host?.querySelector('input') ?? host?.shadowRoot?.querySelector('input') ?? null;
  input?.focus();
}

function readEntityView(label: string | undefined): MapEntityView | null {
  if (label === 'Device view') {
    return 'devices';
  }
  if (label === 'Asset view') {
    return 'assets';
  }
  return null;
}

export function MapPage() {
  const navigate = useNavigate();
  const fleet = useFleet();
  const { config } = useExperiment();
  const assetViewsEnabled = showsAssetView(config.inventoryView);
  const [restored] = useState(() => readMapSession());
  const mapRef = useRef<MapCanvasHandle>(null);
  const searchRef = useRef<HTMLModusWcTextInputElement>(null);
  const assetSearchRef = useRef<HTMLModusWcTextInputElement>(null);
  const geofenceSearchRef = useRef<HTMLModusWcTextInputElement>(null);
  const cameraRef = useRef<MapCamera | null>(restored.camera);
  const [query, setQuery] = useState('');
  const [assetQuery, setAssetQuery] = useState('');
  const [geofenceQuery, setGeofenceQuery] = useState('');
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    !assetViewsEnabled && restored.entityView === 'assets' ? null : restored.selectedId,
  );
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(
    restored.selectedGeofenceId,
  );
  const [panelOpen, setPanelOpen] = useState(restored.panelOpen);
  const [panelView, setPanelView] = useState<MapPanelView>(restored.panelView);
  const [entityView, setEntityView] = useState<MapEntityView>(
    assetViewsEnabled ? restored.entityView : 'devices',
  );
  const [categoryVisibility, setCategoryVisibility] = useState(INITIAL_CATEGORY_VISIBILITY);
  const [basemap, setBasemap] = useState<MapBasemap>('street');
  const [focusSearch, setFocusSearch] = useState(false);

  const stateRef = useRef({
    entityView,
    panelView,
    panelOpen,
    selectedId,
    selectedGeofenceId,
  });

  const devices = useMemo(() => buildMapDevices(fleet.assets), [fleet.assets]);
  const assets = useMemo(
    () => buildMapAssets(fleet.assets, fleet.projects),
    [fleet.assets, fleet.projects],
  );
  const visibleDevices = useMemo(
    () => visibleMapDevices(devices, query, filter),
    [devices, query, filter],
  );
  const visibleAssets = useMemo(
    () => visibleMapAssets(assets, assetQuery),
    [assets, assetQuery],
  );
  const geofences = useMemo(() => visibleMapGeofences(geofenceQuery), [geofenceQuery]);
  const pins = useMemo(
    () => (entityView === 'assets' ? assets : devices).map(toMapPin),
    [assets, devices, entityView],
  );

  const selection = useMemo<MapSelection | null>(() => {
    if (!selectedId) {
      return null;
    }
    if (entityView === 'assets') {
      const asset = assets.find((item) => item.id === selectedId);
      return asset ? assetSelection(asset) : null;
    }
    const device = devices.find((item) => item.id === selectedId);
    return device ? deviceSelection(device) : null;
  }, [assets, devices, entityView, selectedId]);

  useEffect(() => {
    if (!assetViewsEnabled && entityView === 'assets') {
      setEntityView('devices');
      setSelectedId(null);
    }
  }, [assetViewsEnabled, entityView]);

  useLayoutEffect(() => {
    stateRef.current = { entityView, panelView, panelOpen, selectedId, selectedGeofenceId };
    writeMapSession({ ...stateRef.current, camera: cameraRef.current });
  }, [entityView, panelOpen, panelView, selectedGeofenceId, selectedId]);

  useLayoutEffect(() => {
    if (!panelOpen || !focusSearch) {
      return;
    }

    const searchHost =
      panelView === 'geofences'
        ? geofenceSearchRef.current
        : entityView === 'assets'
          ? assetSearchRef.current
          : searchRef.current;
    focusSearchField(searchHost);
    setFocusSearch(false);
  }, [entityView, focusSearch, panelOpen, panelView]);

  function rememberCamera(camera: MapCamera) {
    cameraRef.current = camera;
    writeMapSession({ ...stateRef.current, camera });
  }

  function changeEntityView(next: MapEntityView) {
    if (next === entityView) {
      return;
    }
    setEntityView(next);
    setSelectedId(null);
  }

  function openDetails() {
    if (!selection) {
      return;
    }
    const live = mapRef.current?.getCamera();
    if (live) {
      cameraRef.current = live;
    }
    writeMapSession({ ...stateRef.current, camera: cameraRef.current });
    navigate(selection.detailsPath, { state: { returnTo: 'map' } });
  }

  return (
    <div className="map-page">
      <div className="map-title-row">
        <ModusWcTypography customClass="map-title" hierarchy="h1" label="Map" size="2xl" />
        <div className="map-title-toggle" hidden={!assetViewsEnabled}>
          <ModusWcButtonGroup
            aria-label="Map view"
            color="tertiary"
            selectionType="single"
            variant="outlined"
            onButtonGroupClick={(event) => {
              const next = readEntityView(event.detail.button.textContent?.trim());
              if (next) {
                changeEntityView(next);
              }
            }}
          >
            <ModusWcButton pressed={entityView === 'devices'} size="sm">
              Device view
            </ModusWcButton>
            <ModusWcButton pressed={entityView === 'assets'} size="sm">
              Asset view
            </ModusWcButton>
          </ModusWcButtonGroup>
        </div>
      </div>
      <div className="map-stage">
        <MapCanvas
          ref={mapRef}
          basemap={basemap}
          categoryVisibility={categoryVisibility}
          initialCamera={restored.camera}
          pinKind={entityView === 'assets' ? 'asset' : 'device'}
          pins={pins}
          selectedGeofenceId={selectedGeofenceId}
          selectedId={selectedId}
          onCameraChange={rememberCamera}
          onSelect={setSelectedId}
          onSelectGeofence={(id) => {
            setSelectedGeofenceId(id);
            if (panelOpen) {
              setPanelView('geofences');
            }
          }}
        />
        <DevicesPanel
          assetQuery={assetQuery}
          assetSearchRef={assetSearchRef}
          assets={assets}
          categoryVisibility={categoryVisibility}
          devices={devices}
          entityView={entityView}
          filter={filter}
          geofenceQuery={geofenceQuery}
          geofenceSearchRef={geofenceSearchRef}
          geofences={geofences}
          hidden={!panelOpen}
          query={query}
          searchRef={searchRef}
          selectedGeofenceId={selectedGeofenceId}
          selectedId={selectedId}
          view={panelView}
          visibleAssetIds={visibleAssets.map((item) => item.id)}
          visibleDeviceIds={visibleDevices.map((item) => item.id)}
          onAssetQueryChange={setAssetQuery}
          onCategoryVisibilityChange={(category, visible) => {
            setCategoryVisibility((current) => ({ ...current, [category]: visible }));
          }}
          onClose={() => setPanelOpen(false)}
          onFilterChange={setFilter}
          onGeofenceQueryChange={setGeofenceQuery}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
          onSelectGeofence={setSelectedGeofenceId}
          onViewChange={setPanelView}
        />
        <MapChrome
          assetCount={assets.length}
          basemap={basemap}
          deviceCount={devices.length}
          entityView={entityView}
          panelOpen={panelOpen}
          view={panelView}
          onBasemapChange={setBasemap}
          onOpenPanel={() => setPanelOpen(true)}
          onSearch={() => {
            setPanelOpen(true);
            setFocusSearch(true);
          }}
          onZoomIn={() => mapRef.current?.zoomIn()}
        />
        <MapSelectionPanel
          selection={selection}
          onClose={() => setSelectedId(null)}
          onViewDetails={openDetails}
        />
      </div>
    </div>
  );
}
