export const ALL_DEVICES_GROUP_ID = 'all';

export type DeviceGroup = {
  id: string;
  label: string;
  deviceIds: string[];
};

export type GroupNameError = 'empty' | 'duplicate';

export type Device = {
  id: string;
  name: string;
  serialNumber: string;
  currentFirmware: string;
  availableFirmware: string;
  lastUpdated: string;
  approximateLocation: string;
  latitude: string;
  longitude: string;
  updateFrequency: string;
  battery: string;
  signal: string;
};

type SeedGroupId = 'group-2' | 'group-3' | 'group-4' | 'group-5';

type SeedDevice = {
  name: string;
  serialNumber?: string;
  groupId: SeedGroupId;
};

const CURRENT_FIRMWARE = '4.2.1';
const AVAILABLE_FIRMWARE = '4.3.5';

const NAMED_DEVICES: SeedDevice[] = [
  { name: 'M13RC-HNZ-1E', serialNumber: '3140302550', groupId: 'group-2' },
  { name: 'S23E-D1-Bench', serialNumber: '1277100511', groupId: 'group-2' },
  { name: 'S23E-D1-Bench', serialNumber: '3100302690', groupId: 'group-2' },
  { name: '27ND1041', serialNumber: '17311430XT', groupId: 'group-2' },
  { name: 'HS-XL-TABLE', serialNumber: '2140301243', groupId: 'group-3' },
  { name: 'A1-Drawer', serialNumber: '19003000C5', groupId: 'group-3' },
  { name: 'CT-Desk-Model', serialNumber: '21348004EF', groupId: 'group-3' },
  { name: 'M4-Table', serialNumber: '19003051GH', groupId: 'group-3' },
  { name: 'Neu-x-Shelf', serialNumber: '1211100831', groupId: 'group-4' },
  { name: 'X5-Round-Table', serialNumber: '2301300766', groupId: 'group-4' },
  { name: 'O1-Conference-Table', serialNumber: '1992301-MAN', groupId: 'group-4' },
  { name: 'B2-Writing-Desk', serialNumber: '145030050P', groupId: 'group-5' },
  { name: 'C3-Workstation', serialNumber: '17503032QS', groupId: 'group-5' },
  { name: 'Garnet-Table', serialNumber: '15980225T', groupId: 'group-5' },
];

const EXTRA_DEVICES: SeedDevice[] = [
  { name: 'N2-Bench', groupId: 'group-2' },
  { name: 'P4-Cabinet', groupId: 'group-2' },
  { name: 'Q7-Shelf', groupId: 'group-2' },
  { name: 'R1-Stand', groupId: 'group-2' },
  { name: 'S8-Cart', groupId: 'group-2' },
  { name: 'T3-Locker', groupId: 'group-2' },
  { name: 'U6-Bench', groupId: 'group-2' },
  { name: 'V9-Rack', groupId: 'group-2' },
  { name: 'W2-Table', groupId: 'group-3' },
  { name: 'Y4-Desk', groupId: 'group-3' },
  { name: 'Z1-Station', groupId: 'group-3' },
  { name: 'AA-Monitor-Arm', groupId: 'group-3' },
  { name: 'AB-File-Cabinet', groupId: 'group-3' },
  { name: 'AC-Side-Table', groupId: 'group-3' },
  { name: 'AD-Credenza', groupId: 'group-3' },
  { name: 'AE-Bench-Seat', groupId: 'group-3' },
  { name: 'AF-Tool-Chest', groupId: 'group-3' },
  { name: 'AG-Parts-Bin', groupId: 'group-3' },
  { name: 'AH-Work-Light', groupId: 'group-3' },
  { name: 'AJ-Cable-Cart', groupId: 'group-3' },
  { name: 'AK-Label-Station', groupId: 'group-3' },
  { name: 'AL-Pack-Table', groupId: 'group-3' },
  { name: 'AM-Draft-Table', groupId: 'group-4' },
  { name: 'AN-Plotter', groupId: 'group-4' },
  { name: 'AP-Scanner', groupId: 'group-4' },
  { name: 'AQ-Printer-Stand', groupId: 'group-4' },
  { name: 'AR-Mail-Slot', groupId: 'group-4' },
  { name: 'AS-Reception-Desk', groupId: 'group-4' },
  { name: 'AT-Guest-Chair', groupId: 'group-4' },
  { name: 'AU-Lab-Bench', groupId: 'group-5' },
  { name: 'AV-Scope-Cart', groupId: 'group-5' },
  { name: 'AW-Sample-Fridge', groupId: 'group-5' },
  { name: 'AX-Fume-Hood', groupId: 'group-5' },
  { name: 'AY-Balance-Table', groupId: 'group-5' },
  { name: 'AZ-Glass-Cabinet', groupId: 'group-5' },
  { name: 'BA-Sink-Unit', groupId: 'group-5' },
  { name: 'BB-Drying-Rack', groupId: 'group-5' },
  { name: 'BC-Supply-Shelf', groupId: 'group-5' },
];

const STREETS = [
  'Anita Drive',
  'Ben Adhem Rd',
  'Richmond Ave',
  'Harbor Blvd',
  'Oak Grove',
  'Maple Court',
  'Cedar Lane',
  'Pine Street',
] as const;

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const UPDATE_FREQUENCIES = ['5 min', '15 min', '30 min', '60 min'] as const;

function deviceDetails(index: number): Pick<
  Device,
  | 'lastUpdated'
  | 'approximateLocation'
  | 'latitude'
  | 'longitude'
  | 'updateFrequency'
  | 'battery'
  | 'signal'
> {
  const hour = 8 + (index % 10);
  const minute = (index * 7) % 60;
  const day = 1 + (index % 28);
  const streetNumber = 120 + ((index * 37) % 800);
  const latitude = 37.50106 + ((index % 17) - 8) * 0.0021;
  const longitude = 122.403785 + ((index % 13) - 6) * 0.0018;

  return {
    lastUpdated: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${MONTHS[index % MONTHS.length]} ${day} 2026`,
    approximateLocation: `${streetNumber} ${STREETS[index % STREETS.length]}`,
    latitude: latitude.toFixed(5),
    longitude: longitude.toFixed(6),
    updateFrequency: UPDATE_FREQUENCIES[index % UPDATE_FREQUENCIES.length],
    battery: `${(index * 13) % 101}%`,
    signal: 'Connected',
  };
}

const SEEDED_GROUPS: Array<{ id: SeedGroupId; label: string }> = [
  { id: 'group-2', label: 'Group 2' },
  { id: 'group-3', label: 'Group 3' },
  { id: 'group-4', label: 'Group 4' },
  { id: 'group-5', label: 'Group 5' },
];

function toDevice(source: SeedDevice, index: number): Device {
  return {
    id: `device-${String(index + 1).padStart(2, '0')}`,
    name: source.name,
    serialNumber: source.serialNumber ?? `41003${String(index + 1).padStart(5, '0')}`,
    currentFirmware: CURRENT_FIRMWARE,
    availableFirmware: AVAILABLE_FIRMWARE,
    ...deviceDetails(index),
  };
}

const SEED_DEVICES: SeedDevice[] = [...NAMED_DEVICES, ...EXTRA_DEVICES];

export const DEVICES: Device[] = SEED_DEVICES.map(toDevice);

export const INITIAL_GROUPS: DeviceGroup[] = SEEDED_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  deviceIds: SEED_DEVICES.flatMap((source, index) =>
    source.groupId === group.id ? [DEVICES[index].id] : [],
  ),
}));

export function deviceCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'Device' : 'Devices'}`;
}

export function memberCount(groups: DeviceGroup[], groupId: string): number {
  if (groupId === ALL_DEVICES_GROUP_ID) {
    return DEVICES.length;
  }

  return groups.find((group) => group.id === groupId)?.deviceIds.length ?? 0;
}

export function devicesForView(groups: DeviceGroup[], groupId: string, query: string): Device[] {
  const needle = query.trim().toLowerCase();
  const members =
    groupId === ALL_DEVICES_GROUP_ID
      ? null
      : new Set(groups.find((group) => group.id === groupId)?.deviceIds ?? []);

  return DEVICES.filter((device) => {
    if (members && !members.has(device.id)) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return (
      device.name.toLowerCase().includes(needle) ||
      device.serialNumber.toLowerCase().includes(needle)
    );
  });
}

export function devicesOutsideGroup(groups: DeviceGroup[], groupId: string): Device[] {
  const members = new Set(groups.find((group) => group.id === groupId)?.deviceIds ?? []);
  return DEVICES.filter((device) => !members.has(device.id));
}

export function groupNameError(groups: DeviceGroup[], name: string): GroupNameError | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'empty';
  }

  const needle = trimmed.toLowerCase();
  const duplicate =
    needle === 'all devices' ||
    groups.some((group) => group.label.trim().toLowerCase() === needle);
  if (duplicate) {
    return 'duplicate';
  }

  return null;
}

export function createGroup(name: string, deviceIds: string[]): DeviceGroup {
  const known = new Set(DEVICES.map((device) => device.id));
  return {
    id: `group-${crypto.randomUUID()}`,
    label: name.trim(),
    deviceIds: [...new Set(deviceIds.filter((id) => known.has(id)))],
  };
}

export function addDevicesToGroup(
  groups: DeviceGroup[],
  groupId: string,
  deviceIds: string[],
): DeviceGroup[] {
  const known = new Set(DEVICES.map((device) => device.id));
  return groups.map((group) => {
    if (group.id !== groupId) {
      return group;
    }

    const next = new Set(group.deviceIds);
    for (const id of deviceIds) {
      if (known.has(id)) {
        next.add(id);
      }
    }

    return { ...group, deviceIds: [...next] };
  });
}

export function removeDevicesFromGroup(
  groups: DeviceGroup[],
  groupId: string,
  deviceIds: string[],
): DeviceGroup[] {
  const drop = new Set(deviceIds);
  return groups.map((group) => {
    if (group.id !== groupId) {
      return group;
    }

    return { ...group, deviceIds: group.deviceIds.filter((id) => !drop.has(id)) };
  });
}
