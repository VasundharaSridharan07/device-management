/** Group nearby pins in screen space. Zooming past the split level opens the group. */

export type PinSite = {
  id: string;
  latitude: number;
  longitude: number;
};

export type PinPlacement =
  | { kind: 'pin'; id: string; latitude: number; longitude: number }
  | {
      kind: 'cluster';
      ids: string[];
      latitude: number;
      longitude: number;
      sites: PinSite[];
    };

type Point = { x: number; y: number };

const CLUSTER_RADIUS_PX = 40;
const STACKED_PX = 8;
const SPIDER_RADIUS_PX = 26;

function pixelDistance(left: Point, right: Point): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

export function placePins(
  sites: PinSite[],
  zoom: number,
  splitZoom: number,
  project: (latitude: number, longitude: number) => Point,
  unproject: (point: Point) => { latitude: number; longitude: number },
): PinPlacement[] {
  const groups: { anchor: Point; sites: PinSite[] }[] = [];

  for (const site of sites) {
    const point = project(site.latitude, site.longitude);
    const group = groups.find(
      (candidate) => pixelDistance(point, candidate.anchor) <= CLUSTER_RADIUS_PX,
    );

    if (!group) {
      groups.push({ anchor: point, sites: [site] });
      continue;
    }

    group.sites.push(site);
  }

  const placements: PinPlacement[] = [];

  for (const group of groups) {
    if (group.sites.length === 1) {
      const site = group.sites[0];
      placements.push({
        kind: 'pin',
        id: site.id,
        latitude: site.latitude,
        longitude: site.longitude,
      });
      continue;
    }

    const latitude = group.sites.reduce((sum, site) => sum + site.latitude, 0) / group.sites.length;
    const longitude =
      group.sites.reduce((sum, site) => sum + site.longitude, 0) / group.sites.length;
    const stacked = group.sites.every(
      (site) => pixelDistance(project(site.latitude, site.longitude), group.anchor) <= STACKED_PX,
    );

    if (zoom < splitZoom) {
      placements.push({
        kind: 'cluster',
        ids: group.sites.map((site) => site.id),
        latitude,
        longitude,
        sites: group.sites,
      });
      continue;
    }

    const center = project(latitude, longitude);
    group.sites.forEach((site, index) => {
      if (!stacked) {
        placements.push({
          kind: 'pin',
          id: site.id,
          latitude: site.latitude,
          longitude: site.longitude,
        });
        return;
      }

      const angle = (2 * Math.PI * index) / group.sites.length - Math.PI / 2;
      const placed = unproject({
        x: center.x + Math.cos(angle) * SPIDER_RADIUS_PX,
        y: center.y + Math.sin(angle) * SPIDER_RADIUS_PX,
      });
      placements.push({
        kind: 'pin',
        id: site.id,
        latitude: placed.latitude,
        longitude: placed.longitude,
      });
    });
  }

  return placements;
}
