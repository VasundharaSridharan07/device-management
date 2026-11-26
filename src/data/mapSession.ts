import type { MapEntityView, MapPanelView } from './mapScene';

export type MapCamera = {
  latitude: number;
  longitude: number;
  zoom: number;
};

/** Survives leaving the map so View details can return to the same view. */
export type MapSession = {
  entityView: MapEntityView;
  panelView: MapPanelView;
  panelOpen: boolean;
  selectedId: string | null;
  selectedGeofenceId: string | null;
  camera: MapCamera | null;
};

const INITIAL_SESSION: MapSession = {
  entityView: 'devices',
  panelView: 'devices',
  panelOpen: true,
  selectedId: null,
  selectedGeofenceId: null,
  camera: null,
};

let session: MapSession = { ...INITIAL_SESSION };

export function readMapSession(): MapSession {
  return session;
}

export function writeMapSession(next: MapSession): void {
  session = next;
}
