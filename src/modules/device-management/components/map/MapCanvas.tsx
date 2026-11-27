import {
  divIcon,
  latLngBounds,
  layerGroup,
  map as createMap,
  marker,
  polygon,
  tileLayer,
  type LayerGroup,
  type Map as LeafletMap,
  type PathOptions,
  type Polygon,
  type TileLayer,
} from 'leaflet';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import type { MapPin } from '../../../../data/mapEntities';
import {
  MAP_CENTER,
  MAP_GEOFENCES,
  MAP_ZOOM,
  type MapBasemap,
  type MapGeofenceCategory,
} from '../../../../data/mapScene';
import type { MapCamera } from '../../../../data/mapSession';
import { placePins } from './clusterPins';

const STREET_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_TILES =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const PIN_SIZE = 40;

export type MapCanvasHandle = {
  zoomIn: () => void;
  getCamera: () => MapCamera | null;
};

type MapCanvasProps = {
  basemap: MapBasemap;
  categoryVisibility: Record<MapGeofenceCategory, boolean>;
  initialCamera: MapCamera | null;
  pinKind: 'device' | 'asset';
  pins: MapPin[];
  selectedGeofenceId: string | null;
  selectedId: string | null;
  onCameraChange: (camera: MapCamera) => void;
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

function motionOk(): boolean {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pinIcon(url: string, selected: boolean) {
  const className = selected ? 'map-pin map-pin-selected' : 'map-pin';
  return divIcon({
    className,
    html: `<img class="map-pin-image" alt="" src="${url}" width="${PIN_SIZE}" height="${PIN_SIZE}" />`,
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, PIN_SIZE],
  });
}

function clusterIcon(count: number, selected: boolean) {
  const className = selected ? 'map-cluster map-cluster-selected' : 'map-cluster';
  return divIcon({
    className,
    html: `<span class="map-cluster-count">${count}</span>`,
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_SIZE / 2, PIN_SIZE / 2],
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

function readCamera(map: LeafletMap): MapCamera {
  const center = map.getCenter();
  return { latitude: center.lat, longitude: center.lng, zoom: map.getZoom() };
}

export const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(function MapCanvas(
  {
    basemap,
    categoryVisibility,
    initialCamera,
    pinKind,
    pins,
    selectedGeofenceId,
    selectedId,
    onCameraChange,
    onSelect,
    onSelectGeofence,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const streetRef = useRef<TileLayer | null>(null);
  const satelliteRef = useRef<TileLayer | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const polygonsRef = useRef<Map<string, DrawnGeofence>>(new Map());
  const pinsRef = useRef(pins);
  const selectedGeofenceRef = useRef(selectedGeofenceId);
  const categoryVisibilityRef = useRef(categoryVisibility);
  const onSelectRef = useRef(onSelect);
  const onSelectGeofenceRef = useRef(onSelectGeofence);
  const onCameraChangeRef = useRef(onCameraChange);
  const initialCameraRef = useRef(initialCamera);
  const skipInitialPan = useRef(true);
  const skipInitialGeofence = useRef(true);
  const [mapReady, setMapReady] = useState(false);
  const [viewRevision, setViewRevision] = useState(0);

  useEffect(() => {
    pinsRef.current = pins;
    onSelectRef.current = onSelect;
    onSelectGeofenceRef.current = onSelectGeofence;
    onCameraChangeRef.current = onCameraChange;
    selectedGeofenceRef.current = selectedGeofenceId;
    categoryVisibilityRef.current = categoryVisibility;
    initialCameraRef.current = initialCamera;
  }, [
    categoryVisibility,
    initialCamera,
    onCameraChange,
    onSelect,
    onSelectGeofence,
    pins,
    selectedGeofenceId,
  ]);

  useImperativeHandle(ref, () => ({
    zoomIn() {
      mapRef.current?.zoomIn();
    },
    getCamera() {
      const map = mapRef.current;
      return map ? readCamera(map) : null;
    },
  }));

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const start = initialCameraRef.current;
    const map = createMap(node, {
      attributionControl: true,
      scrollWheelZoom: true,
      zoomControl: false,
    }).setView(
      start ? [start.latitude, start.longitude] : MAP_CENTER,
      start?.zoom ?? MAP_ZOOM,
    );

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

    const markers = layerGroup().addTo(map);

    const publishView = () => {
      onCameraChangeRef.current(readCamera(map));
      setViewRevision((value) => value + 1);
    };
    map.on('moveend', publishView);

    mapRef.current = map;
    streetRef.current = street;
    satelliteRef.current = satellite;
    markersRef.current = markers;
    polygonsRef.current = polygons;
    onCameraChangeRef.current(readCamera(map));
    setMapReady(true);

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
      map.off('moveend', publishView);
      map.remove();
      mapRef.current = null;
      streetRef.current = null;
      satelliteRef.current = null;
      markersRef.current = null;
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
    if (!mapReady || !map || !markers) {
      return;
    }

    markers.clearLayers();
    const noun = pinKind === 'asset' ? 'asset' : 'device';
    const placements = placePins(
      pins,
      map.getZoom(),
      MAP_ZOOM,
      (latitude, longitude) => {
        const point = map.latLngToContainerPoint([latitude, longitude]);
        return { x: point.x, y: point.y };
      },
      (point) => {
        const latLng = map.containerPointToLatLng([point.x, point.y]);
        return { latitude: latLng.lat, longitude: latLng.lng };
      },
    );

    for (const placement of placements) {
      if (placement.kind === 'cluster') {
        const count = placement.ids.length;
        const label = `${count} ${count === 1 ? noun : `${noun}s`}`;
        const pin = marker([placement.latitude, placement.longitude], {
          icon: clusterIcon(count, placement.ids.includes(selectedId ?? '')),
          keyboard: true,
          title: label,
          zIndexOffset: placement.ids.includes(selectedId ?? '') ? 1000 : 500,
        });
        pin.on('click', () => {
          const bounds = latLngBounds(
            placement.sites.map((site) => [site.latitude, site.longitude] as [number, number]),
          );
          map.fitBounds(bounds, {
            animate: motionOk(),
            maxZoom: Math.max(map.getZoom() + 2, MAP_ZOOM),
            padding: [72, 72],
          });
        });
        pin.addTo(markers);
        continue;
      }

      const source = pins.find((item) => item.id === placement.id);
      if (!source) {
        continue;
      }
      const selected = source.id === selectedId;
      const pin = marker([placement.latitude, placement.longitude], {
        icon: pinIcon(source.markerUrl, selected),
        keyboard: true,
        title: source.name,
        zIndexOffset: selected ? 1000 : 0,
      });
      pin.on('click', () => {
        onSelectRef.current(source.id);
      });
      pin.addTo(markers);
    }
  }, [mapReady, pinKind, pins, selectedId, viewRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (skipInitialPan.current) {
      skipInitialPan.current = false;
      return;
    }
    if (!selectedId) {
      return;
    }

    const pin = pinsRef.current.find((item) => item.id === selectedId);
    if (!pin) {
      return;
    }

    map.setView([pin.latitude, pin.longitude], Math.max(map.getZoom(), MAP_ZOOM), {
      animate: motionOk(),
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
    if (!map) {
      return;
    }

    if (skipInitialGeofence.current) {
      skipInitialGeofence.current = false;
      return;
    }
    if (!selectedGeofenceId) {
      return;
    }

    const selected = polygons.get(selectedGeofenceId);
    if (!selected || !map.hasLayer(selected.shape)) {
      return;
    }

    map.fitBounds(selected.shape.getBounds(), {
      animate: motionOk(),
      maxZoom: Math.max(map.getZoom(), MAP_ZOOM),
      padding: [32, 32],
    });
  }, [selectedGeofenceId]);

  const regionLabel = pinKind === 'asset' ? 'Asset map' : 'Device map';
  return <div ref={containerRef} aria-label={regionLabel} className="map-canvas" role="region" />;
});
