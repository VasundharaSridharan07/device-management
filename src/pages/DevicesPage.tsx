import {
  ModusWcAlert,
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AssetTable, type AssetTableRow } from '../components/devices/AssetTable';
import { DeviceGroups } from '../components/devices/DeviceGroups';
import { DeviceTable } from '../components/devices/DeviceTable';
import {
  ALL_DEVICES_GROUP_ID,
  INITIAL_GROUPS,
  addDevicesToGroup,
  createGroup,
  devicesForView,
  devicesOutsideGroup,
  removeDevicesFromGroup,
  type DeviceGroup,
} from '../data/devices';
import { detailsStateFrom, listAssetState, listDeviceState } from '../data/detailsNavigation';
import { useFleet } from '../data/FleetContext';
import { readListSession, writeListSession } from '../data/listSession';
import type { MapEntityView } from '../data/mapScene';
import { projectMembershipLabel, projectsByIds } from '../data/projects';
import { canAdministerDevices, personaById, showsAssetView } from '../experiments/config';
import { useExperiment } from '../experiments/ExperimentContext';
import { usePageTitle } from '../hooks/usePageTitle';

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
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

export function DevicesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useExperiment();
  const admin = canAdministerDevices(config.persona);
  const assetViewsEnabled = showsAssetView(config.inventoryView);
  const persona = personaById(config.persona);
  const { assets, projects } = useFleet();
  const [groups, setGroups] = useState<DeviceGroup[]>(INITIAL_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState(ALL_DEVICES_GROUP_ID);
  const [query, setQuery] = useState(() => readListSession().deviceQuery);
  const [assetQuery, setAssetQuery] = useState(() => readListSession().assetQuery);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [entityView, setEntityView] = useState<MapEntityView>(() => {
    if (!assetViewsEnabled) {
      return 'devices';
    }
    const incoming = detailsStateFrom(location.state);
    if (incoming?.returnTo === 'devices' && incoming.entityView) {
      return incoming.entityView;
    }
    return readListSession().entityView;
  });
  usePageTitle('Devices');

  const devices = useMemo(
    () => devicesForView(groups, selectedGroupId, query),
    [groups, selectedGroupId, query],
  );
  const checkedIds = useMemo(
    () => selectedRowIds.filter((id) => devices.some((device) => device.id === id)),
    [devices, selectedRowIds],
  );
  const assetRows = useMemo<AssetTableRow[]>(() => {
    const needle = assetQuery.trim().toLowerCase();
    return assets.flatMap((asset) => {
      const assignedNames = projectsByIds(projects, asset.projectIds).map(
        (project) => project.name,
      );
      const row: AssetTableRow = {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        project: projectMembershipLabel(projects, asset.projectIds),
        location: asset.locationLabel,
        deviceCount: asset.deviceIds.length,
      };
      if (!needle) {
        return [row];
      }
      const haystack = `${row.name} ${row.type} ${assignedNames.join(' ')}`.toLowerCase();
      return haystack.includes(needle) ? [row] : [];
    });
  }, [assetQuery, assets, projects]);
  const editingGroup = admin && selectedGroupId !== ALL_DEVICES_GROUP_ID;
  const productUserNote = `${persona.user.name} can review devices, groups, and project membership. Creating groups, registering devices, and assigning projects stays with a licensed admin.`;
  const assetView = entityView === 'assets';

  useEffect(() => {
    if (!assetViewsEnabled && entityView === 'assets') {
      setEntityView('devices');
    }
  }, [assetViewsEnabled, entityView]);

  useEffect(() => {
    writeListSession({ entityView, deviceQuery: query, assetQuery });
  }, [assetQuery, entityView, query]);

  const openDevice = useCallback(
    (id: string) => {
      writeListSession({ entityView: 'devices', deviceQuery: query, assetQuery });
      navigate(`/devices/${id}`, { state: listDeviceState() });
    },
    [assetQuery, navigate, query],
  );

  const openAsset = useCallback(
    (id: string) => {
      writeListSession({ entityView: 'assets', deviceQuery: query, assetQuery });
      navigate(`/assets/${id}`, { state: listAssetState() });
    },
    [assetQuery, navigate, query],
  );

  return (
    <div className="devices-page">
      <div className="devices-heading">
        <ModusWcTypography
          customClass="devices-heading-title"
          hierarchy="h1"
          label="Devices"
          size="2xl"
        />
        <div className="map-title-toggle" hidden={!assetViewsEnabled}>
          <ModusWcButtonGroup
            aria-label="List view"
            color="tertiary"
            selectionType="single"
            variant="outlined"
            onButtonGroupClick={(event) => {
              const next = readEntityView(event.detail.button.textContent?.trim());
              if (next) {
                setEntityView(next);
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
      <div hidden={admin}>
        <ModusWcAlert
          alertDescription={productUserNote}
          alertTitle="Product user"
          icon="person"
          role="status"
          variant="neutral"
        />
      </div>
      <div hidden={assetView}>
        <div className="devices-layout">
          <DeviceGroups
            canCreate={admin}
            checkedCount={checkedIds.length}
            groups={groups}
            selectedGroupId={selectedGroupId}
            onCreate={(name) => {
              const group = createGroup(name, checkedIds);
              setGroups((current) => [...current, group]);
              setSelectedGroupId(group.id);
              setSelectedRowIds([]);
            }}
            onSelect={setSelectedGroupId}
          />
          <DeviceTable
            canEditGroup={editingGroup}
            canRegisterDevices={admin}
            canRemove={checkedIds.length > 0}
            candidates={devicesOutsideGroup(groups, selectedGroupId)}
            devices={devices}
            query={query}
            selectedRowIds={selectedRowIds}
            onAddDevices={(ids) => {
              setGroups((current) => addDevicesToGroup(current, selectedGroupId, ids));
            }}
            onDeviceOpen={openDevice}
            onQueryChange={setQuery}
            onRemoveDevices={() => {
              const removed = new Set(checkedIds);
              setGroups((current) => removeDevicesFromGroup(current, selectedGroupId, checkedIds));
              setSelectedRowIds((current) => current.filter((id) => !removed.has(id)));
            }}
            onSelectedRowIdsChange={(ids) => {
              setSelectedRowIds((current) => (sameIds(current, ids) ? current : ids));
            }}
          />
        </div>
      </div>
      <div hidden={!assetView}>
        <div className="devices-asset-view">
          <AssetTable
            query={assetQuery}
            rows={assetRows}
            onOpen={openAsset}
            onQueryChange={setAssetQuery}
          />
        </div>
      </div>
    </div>
  );
}
