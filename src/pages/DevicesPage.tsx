import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useMemo, useState } from 'react';

import { DeviceGroups } from '../components/devices/DeviceGroups';
import { DeviceInfoPanel } from '../components/devices/DeviceInfoPanel';
import { DeviceTable } from '../components/devices/DeviceTable';
import {
  ALL_DEVICES_GROUP_ID,
  DEVICES,
  INITIAL_GROUPS,
  addDevicesToGroup,
  createGroup,
  devicesForView,
  devicesOutsideGroup,
  removeDevicesFromGroup,
  type DeviceGroup,
} from '../data/devices';
import {
  INITIAL_PROJECTS,
  addDeviceToProjects,
  removeDeviceFromProject,
  type Project,
} from '../data/projects';

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

function visibleDeviceId(
  id: string | null,
  groups: DeviceGroup[],
  groupId: string,
  query: string,
): string | null {
  if (!id) {
    return null;
  }

  return devicesForView(groups, groupId, query).some((device) => device.id === id) ? id : null;
}

export function DevicesPage() {
  const [groups, setGroups] = useState<DeviceGroup[]>(INITIAL_GROUPS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_DEVICES_GROUP_ID);
  const [query, setQuery] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [layoutEl, setLayoutEl] = useState<HTMLDivElement | null>(null);
  const devices = useMemo(
    () => devicesForView(groups, selectedGroupId, query),
    [groups, selectedGroupId, query],
  );
  const checkedIds = useMemo(
    () => selectedRowIds.filter((id) => devices.some((device) => device.id === id)),
    [devices, selectedRowIds],
  );
  const editingGroup = selectedGroupId !== ALL_DEVICES_GROUP_ID;
  const activeDevice = useMemo(
    () => DEVICES.find((device) => device.id === activeDeviceId) ?? null,
    [activeDeviceId],
  );

  return (
    <div className="devices-page">
      <ModusWcTypography hierarchy="h1" label="Devices" />
      <div className={activeDevice ? 'devices-stage devices-stage-open' : 'devices-stage'}>
        <div className="devices-layout" ref={setLayoutEl}>
          <DeviceGroups
            checkedCount={checkedIds.length}
            groups={groups}
            selectedGroupId={selectedGroupId}
            onCreate={(name) => {
              const group = createGroup(name, checkedIds);
              const nextGroups = [...groups, group];
              setGroups(nextGroups);
              setSelectedGroupId(group.id);
              setSelectedRowIds([]);
              setActiveDeviceId((current) =>
                visibleDeviceId(current, nextGroups, group.id, query),
              );
            }}
            onSelect={(groupId) => {
              setSelectedGroupId(groupId);
              setActiveDeviceId((current) => visibleDeviceId(current, groups, groupId, query));
            }}
          />
          <DeviceTable
            canEditGroup={editingGroup}
            canRemove={checkedIds.length > 0}
            candidates={devicesOutsideGroup(groups, selectedGroupId)}
            devices={devices}
            query={query}
            selectedRowIds={selectedRowIds}
            onAddDevices={(ids) => {
              setGroups((current) => addDevicesToGroup(current, selectedGroupId, ids));
            }}
            onDeviceOpen={setActiveDeviceId}
            onQueryChange={(nextQuery) => {
              setQuery(nextQuery);
              setActiveDeviceId((current) =>
                visibleDeviceId(current, groups, selectedGroupId, nextQuery),
              );
            }}
            onRemoveDevices={() => {
              const removed = new Set(checkedIds);
              setGroups((current) =>
                removeDevicesFromGroup(current, selectedGroupId, checkedIds),
              );
              setSelectedRowIds([]);
              setActiveDeviceId((current) => (current && removed.has(current) ? null : current));
            }}
            onSelectedRowIdsChange={(ids) => {
              setSelectedRowIds((current) => (sameIds(current, ids) ? current : ids));
            }}
          />
        </div>
        <DeviceInfoPanel
          device={activeDevice}
          expanded={activeDevice != null}
          projects={projects}
          targetElement={layoutEl}
          onAddToProjects={(deviceId, projectIds) => {
            setProjects((current) => addDeviceToProjects(current, deviceId, projectIds));
          }}
          onClose={() => setActiveDeviceId(null)}
          onRemoveFromProject={(deviceId, projectId) => {
            setProjects((current) => removeDeviceFromProject(current, deviceId, projectId));
          }}
        />
      </div>
    </div>
  );
}
