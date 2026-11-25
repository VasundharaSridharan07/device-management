import {
  divIcon,
  map as createMap,
  marker,
  polygon,
  tileLayer,
  type Map as LeafletMap,
  type Marker,
  type PathOptions,
  type Polygon,
  type TileLayer,
} from 'leaflet';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

import {
  MAP_ASSETS,
  MAP_CENTER,
  MAP_GEOFENCES,
  MAP_ZOOM,
  type MapBasemap,
  type MapGeofenceCategory,
} from '../../data/mapScene';

const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export type MapCanvasHandle = {
  zoomIn: () => void;
};

type MapCanvasProps = {
  basemap: MapBasemap;
  categoryVisibility: Record<MapGeofenceCategory, boolean>;
  selectedGeofenceId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSelectGeofence: (id: string) => void;
};

type DrawnGeofence = {
  category: MapGeofenceCategory;
  shape: Polygon;
};

const GEOFENCE_DRAW_ORDER: Record<MapGeofenceCategory, number> = {
  'project-boundary': 0,
  geofence: 1,
  avoidance: 2,
};

/** Categorical strokes stay on separate hues so zones stay distinct on the basemap. */
const GEOFENCE_STROKE: Record<MapGeofenceCategory, string> = {
  geofence: '--modus-wc-color-primary',
  'project-boundary': '--modus-wc-color-success',
  avoidance: '--modus-wc-in-field-avoidance',
};

function modusColor(name: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value || 'currentColor';
}

function markerIcon(alert: boolean, selected: boolean) {
  const className = ['map-marker'];
  if (alert) {
    className.push('map-marker-alert');
  }
  if (selected) {
    className.push('map-marker-selected');
  }

  return divIcon({
    className: className.join(' '),
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function syncGeofenceLayers(
  map: LeafletMap,
  polygons: Map<string, DrawnGeofence>,
  categoryVisibility: Record<MapGeofenceCategory, boolean>,
  selectedGeofenceId: string | null,
) {
  const ordered = [...polygons.entries()].sort(
    (left, right) => GEOFENCE_DRAW_ORDER[left[1].category] - GEOFENCE_DRAW_ORDER[right[1].category],
  );

  for (const [, entry] of ordered) {
    if (categoryVisibility[entry.category]) {
      continue;
    }
    if (map.hasLayer(entry.shape)) {
      map.removeLayer(entry.shape);
    }
  }

  let selectedShape: Polygon | undefined;
  for (const [id, entry] of ordered) {
    if (!categoryVisibility[entry.category]) {
      continue;
    }
    if (!map.hasLayer(entry.shape)) {
      entry.shape.addTo(map);
    }
    const selected = id === selectedGeofenceId;
    entry.shape.setStyle(geofenceStyle(entry.category, selected));
    entry.shape.bringToFront();
    if (selected) {
      selectedShape = entry.shape;
    }
  }
  selectedShape?.bringToFront();
}

function geofenceStyle(category: MapGeofenceCategory, selected: boolean): PathOptions {
  const color = modusColor(GEOFENCE_STROKE[category]);
  return {
    color: selected ? modusColor('--modus-wc-color-base-content') : color,
    weight: selected ? 4 : category === 'project-boundary' ? 3 : 2,
    dashArray: category === 'project-boundary' && !selected ? '6 4' : '',
    fillColor: color,
    fillOpacity: selected ? 0.45 : 0.28,
  };
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  { basemap, categoryVisibility, selectedGeofenceId, selectedId, onSelect, onSelectGeofence },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const streetRef = useRef<TileLayer | null>(null);
  const satelliteRef = useRef<TileLayer | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const polygonsRef = useRef<Map<string, DrawnGeofence>>(new Map());
  const selectedGeofenceRef = useRef(selectedGeofenceId);
  const categoryVisibilityRef = useRef(categoryVisibility);
  const onSelectRef = useRef(onSelect);
  const onSelectGeofenceRef = useRef(onSelectGeofence);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onSelectGeofenceRef.current = onSelectGeofence;
    selectedGeofenceRef.current = selectedGeofenceId;
    categoryVisibilityRef.current = categoryVisibility;
  }, [categoryVisibility, onSelect, onSelectGeofence, selectedGeofenceId]);

  useImperativeHandle(ref, () => ({
    zoomIn() {
      mapRef.current?.zoomIn();
    },
  }));

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const map = createMap(node, {
      attributionControl: true,
      scrollWheelZoom: true,
      zoomControl: false,
    }).setView(MAP_CENTER, MAP_ZOOM);

    const street = tileLayer(STREET_TILES, {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    });
    const satellite = tileLayer(SATELLITE_TILES, {
      attribution:
        'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      maxZoom: 19,
    });
    street.addTo(map);

    const polygons = new Map<string, DrawnGeofence>();
    const drawOrder = [...MAP_GEOFENCES].sort(
      (left, right) => GEOFENCE_DRAW_ORDER[left.category] - GEOFENCE_DRAW_ORDER[right.category],
    );
    for (const geofence of drawOrder) {
      const shape = polygon(geofence.positions, geofenceStyle(geofence.category, false)).addTo(
        map,
      );
      shape.on('click', () => {
        onSelectGeofenceRef.current(geofence.id);
      });
      polygons.set(geofence.id, { category: geofence.category, shape });
    }

    const markers = new Map<string, Marker>();
    for (const asset of MAP_ASSETS) {
      const pin = marker([asset.latitude, asset.longitude], {
        icon: markerIcon(asset.alert, false),
        keyboard: true,
        title: asset.name,
      });
      pin.on('click', () => {
        onSelectRef.current(asset.id);
      });
      pin.addTo(map);
      markers.set(asset.id, pin);
    }

    mapRef.current = map;
    streetRef.current = street;
    satelliteRef.current = satellite;
    markersRef.current = markers;
    polygonsRef.current = polygons;

    const resize = () => {
      map.invalidateSize();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(node);
    const frame = requestAnimationFrame(resize);

    const restyle = () => {
      if (!mapRef.current) {
        return;
      }
      syncGeofenceLayers(
        mapRef.current,
        polygons,
        categoryVisibilityRef.current,
        selectedGeofenceRef.current,
      );
    };
    const themeObserver = new MutationObserver(restyle);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-mode', 'data-theme'],
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      streetRef.current = null;
      satelliteRef.current = null;
      markersRef.current = new Map();
      polygonsRef.current = new Map();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const street = streetRef.current;
    const satellite = satelliteRef.current;
    if (!map || !street || !satellite) {
      return;
    }

    if (basemap === 'satellite') {
      map.removeLayer(street);
      satellite.addTo(map);
      return;
    }

    map.removeLayer(satellite);
    street.addTo(map);
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!map) {
      return;
    }

    for (const asset of MAP_ASSETS) {
      const pin = markers.get(asset.id);
      if (!pin) {
        continue;
      }

      const selected = asset.id === selectedId;
      pin.setIcon(markerIcon(asset.alert, selected));
      pin.setZIndexOffset(selected ? 1000 : 0);
    }

    if (!selectedId) {
      return;
    }

    const asset = MAP_ASSETS.find((item) => item.id === selectedId);
    if (!asset) {
      return;
    }

    map.setView([asset.latitude, asset.longitude], Math.max(map.getZoom(), MAP_ZOOM), {
      animate: true,
    });
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    const polygons = polygonsRef.current;
    if (!map) {
      return;
    }

    syncGeofenceLayers(map, polygons, categoryVisibility, selectedGeofenceId);
  }, [categoryVisibility, selectedGeofenceId]);

  useEffect(() => {
    const map = mapRef.current;
    const polygons = polygonsRef.current;
    if (!map || !selectedGeofenceId) {
      return;
    }

    const selected = polygons.get(selectedGeofenceId);
    if (!selected || !map.hasLayer(selected.shape)) {
      return;
    }

    map.fitBounds(selected.shape.getBounds(), {
      animate: true,
      maxZoom: Math.max(map.getZoom(), MAP_ZOOM),
      padding: [32, 32],
    });
  }, [selectedGeofenceId]);

  return <div ref={containerRef} aria-label="Device map" className="map-canvas" role="region" />;
});
