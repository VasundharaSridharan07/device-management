import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { DevicesPanel } from '../components/map/DevicesPanel';
import { MapCanvas, type MapCanvasHandle } from '../components/map/MapCanvas';
import { MapChrome } from '../components/map/MapChrome';
import {
  visibleMapAssets,
  visibleMapGeofences,
  type MapBasemap,
  type MapFilter,
  type MapGeofenceCategory,
  type MapPanelView,
} from '../data/mapScene';

const INITIAL_CATEGORY_VISIBILITY: Record<MapGeofenceCategory, boolean> = {
  geofence: true,
  'project-boundary': true,
  avoidance: true,
};

function focusSearchField(host: HTMLElement | null) {
  const input =
    host?.querySelector('input') ?? host?.shadowRoot?.querySelector('input') ?? null;
  input?.focus();
}

export function MapPage() {
  const mapRef = useRef<MapCanvasHandle>(null);
  const searchRef = useRef<HTMLModusWcTextInputElement>(null);
  const geofenceSearchRef = useRef<HTMLModusWcTextInputElement>(null);
  const [query, setQuery] = useState('');
  const [geofenceQuery, setGeofenceQuery] = useState('');
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGeofenceId, setSelectedGeofenceId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelView, setPanelView] = useState<MapPanelView>('devices');
  const [categoryVisibility, setCategoryVisibility] = useState(INITIAL_CATEGORY_VISIBILITY);
  const [basemap, setBasemap] = useState<MapBasemap>('street');
  const [focusSearch, setFocusSearch] = useState(false);
  const assets = useMemo(() => visibleMapAssets(query, filter), [query, filter]);
  const geofences = useMemo(() => visibleMapGeofences(geofenceQuery), [geofenceQuery]);

  useLayoutEffect(() => {
    if (!panelOpen || !focusSearch) {
      return;
    }

    const searchHost = panelView === 'geofences' ? geofenceSearchRef.current : searchRef.current;
    focusSearchField(searchHost);
    setFocusSearch(false);
  }, [focusSearch, panelOpen, panelView]);

  return (
    <div className="map-page">
      <ModusWcTypography customClass="map-page-title" hierarchy="h1" label="Map" />
      <MapCanvas
        ref={mapRef}
        basemap={basemap}
        categoryVisibility={categoryVisibility}
        selectedGeofenceId={selectedGeofenceId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onSelectGeofence={(id) => {
          setSelectedGeofenceId(id);
          if (panelOpen) {
            setPanelView('geofences');
          }
        }}
      />
      <DevicesPanel
        assets={assets}
        filter={filter}
        categoryVisibility={categoryVisibility}
        geofenceQuery={geofenceQuery}
        geofenceSearchRef={geofenceSearchRef}
        geofences={geofences}
        hidden={!panelOpen}
        query={query}
        searchRef={searchRef}
        selectedGeofenceId={selectedGeofenceId}
        selectedId={selectedId}
        view={panelView}
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
        basemap={basemap}
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
    </div>
  );
}
