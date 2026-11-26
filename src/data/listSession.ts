import type { MapEntityView } from './mapScene';

/** Remembers the devices list so Back can restore device or asset view. */
export type ListSession = {
  entityView: MapEntityView;
  deviceQuery: string;
  assetQuery: string;
};

const INITIAL_SESSION: ListSession = {
  entityView: 'devices',
  deviceQuery: '',
  assetQuery: '',
};

let session: ListSession = { ...INITIAL_SESSION };

export function readListSession(): ListSession {
  return session;
}

export function writeListSession(next: Partial<ListSession>): void {
  session = { ...session, ...next };
}
