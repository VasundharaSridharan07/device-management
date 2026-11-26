import {
  ModusWcAccordion,
  ModusWcButton,
  ModusWcButtonGroup,
  ModusWcCollapse,
  ModusWcIcon,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcPanel,
  ModusWcSelect,
  ModusWcSwitch,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ISelectOption } from '@trimble-oss/moduswebcomponents';
import { useState, type RefObject } from 'react';

import {
  assetRowDetail,
  deviceRowDetail,
  type MapAssetItem,
  type MapDeviceItem,
} from '../../data/mapEntities';
import {
  GEOFENCE_GROUPS,
  MAP_GEOFENCES,
  isMapFilter,
  type MapEntityView,
  type MapFilter,
  type MapGeofence,
  type MapGeofenceCategory,
  type MapPanelView,
} from '../../data/mapScene';

const FILTER_OPTIONS: ISelectOption[] = [
  { label: 'All devices', value: 'all' },
  { label: 'Alerts', value: 'alerts' },
  { label: 'Report unavailable', value: 'unavailable' },
];

type DevicesPanelProps = {
  assetQuery: string;
  assetSearchRef: RefObject<HTMLModusWcTextInputElement | null>;
  assets: MapAssetItem[];
  categoryVisibility: Record<MapGeofenceCategory, boolean>;
  devices: MapDeviceItem[];
  entityView: MapEntityView;
  filter: MapFilter;
  geofenceQuery: string;
  geofenceSearchRef: RefObject<HTMLModusWcTextInputElement | null>;
  geofences: MapGeofence[];
  hidden: boolean;
  query: string;
  searchRef: RefObject<HTMLModusWcTextInputElement | null>;
  selectedGeofenceId: string | null;
  selectedId: string | null;
  view: MapPanelView;
  visibleAssetIds: string[];
  visibleDeviceIds: string[];
  onAssetQueryChange: (query: string) => void;
  onCategoryVisibilityChange: (category: MapGeofenceCategory, visible: boolean) => void;
  onClose: () => void;
  onFilterChange: (filter: MapFilter) => void;
  onGeofenceQueryChange: (query: string) => void;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onSelectGeofence: (id: string) => void;
  onViewChange: (view: MapPanelView) => void;
};

function DeviceRow({
  device,
  hidden,
  selected,
  onSelect,
}: {
  device: MapDeviceItem;
  hidden: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <ModusWcMenuItem
      hidden={hidden}
      label={device.name}
      selected={selected}
      size="sm"
      subLabel={deviceRowDetail(device)}
      value={device.id}
      onItemSelect={() => onSelect(device.id)}
    >
      <span className="map-device-icons" slot="start-icon">
        <img
          alt=""
          className="map-list-marker"
          height={24}
          src={device.markerUrl}
          width={24}
        />
        <ModusWcIcon
          aria-label="Alert"
          customClass="map-device-alert"
          decorative={false}
          hidden={!device.alert}
          name="warning"
          size="sm"
        />
      </span>
    </ModusWcMenuItem>
  );
}

function AssetRow({
  asset,
  hidden,
  selected,
  onSelect,
}: {
  asset: MapAssetItem;
  hidden: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <ModusWcMenuItem
      hidden={hidden}
      label={asset.name}
      selected={selected}
      size="sm"
      subLabel={assetRowDetail(asset)}
      value={asset.id}
      onItemSelect={() => onSelect(asset.id)}
    >
      <img
        alt=""
        className="map-list-marker"
        height={24}
        slot="start-icon"
        src={asset.markerUrl}
        width={24}
      />
    </ModusWcMenuItem>
  );
}

function readControlChecked(event: CustomEvent<InputEvent>): boolean {
  const target = event.detail?.target;
  if (target instanceof HTMLInputElement) {
    return target.checked;
  }

  return false;
}

function readControlValue(event: CustomEvent<InputEvent>): string {
  const target = event.detail?.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.value;
  }

  return '';
}

function readView(label: string | undefined): MapPanelView | null {
  if (label === 'Devices' || label === 'Assets') {
    return 'devices';
  }
  if (label === 'Geofences') {
    return 'geofences';
  }
  return null;
}

export function DevicesPanel({
  assetQuery,
  assetSearchRef,
  assets,
  categoryVisibility,
  devices,
  entityView,
  filter,
  geofenceQuery,
  geofenceSearchRef,
  geofences,
  hidden,
  query,
  searchRef,
  selectedGeofenceId,
  selectedId,
  view,
  visibleAssetIds,
  visibleDeviceIds,
  onAssetQueryChange,
  onCategoryVisibilityChange,
  onClose,
  onFilterChange,
  onGeofenceQueryChange,
  onQueryChange,
  onSelect,
  onSelectGeofence,
  onViewChange,
}: DevicesPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<MapGeofenceCategory, boolean>>({
    geofence: true,
    'project-boundary': true,
    avoidance: true,
  });
  const geofenceView = view === 'geofences';
  const assetView = entityView === 'assets';
  const listLabel = assetView ? 'Assets' : 'Devices';
  const visibleDevices = new Set(visibleDeviceIds);
  const visibleAssets = new Set(visibleAssetIds);

  return (
    <div className="map-devices-panel" hidden={hidden}>
      <ModusWcPanel
        aria-label={geofenceView ? 'Geofences' : listLabel}
        floating
        height="100%"
        width="320px"
      >
        <div className="map-devices-header" slot="header">
          <div className="map-devices-title">
            <ModusWcButtonGroup
              aria-label="Map list"
              color="tertiary"
              selectionType="single"
              variant="outlined"
              onButtonGroupClick={(event) => {
                const next = readView(event.detail.button.textContent?.trim());
                if (next) {
                  onViewChange(next);
                }
              }}
            >
              <ModusWcButton pressed={view === 'devices'} size="sm">
                <span>{listLabel}</span>
              </ModusWcButton>
              <ModusWcButton pressed={view === 'geofences'} size="sm">
                Geofences
              </ModusWcButton>
            </ModusWcButtonGroup>
            <ModusWcButton
              aria-label={geofenceView ? 'Close geofences' : `Close ${listLabel.toLowerCase()}`}
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
              onButtonClick={onClose}
            >
              <ModusWcIcon decorative name="close" size="xs" />
            </ModusWcButton>
          </div>
          <div className="map-device-tools" hidden={geofenceView || assetView}>
            <ModusWcTextInput
              ref={searchRef}
              aria-label="Search devices"
              includeSearch
              placeholder="Search"
              size="sm"
              value={query}
              onInputChange={(event) => onQueryChange(readControlValue(event))}
            />
            <ModusWcSelect
              aria-label="Filter devices"
              options={FILTER_OPTIONS}
              size="sm"
              value={filter}
              onInputChange={(event) => {
                const next = readControlValue(event);
                if (isMapFilter(next)) {
                  onFilterChange(next);
                }
              }}
            />
          </div>
          <div className="map-device-tools" hidden={geofenceView || !assetView}>
            <ModusWcTextInput
              ref={assetSearchRef}
              aria-label="Search assets"
              includeSearch
              placeholder="Search"
              size="sm"
              value={assetQuery}
              onInputChange={(event) => onAssetQueryChange(readControlValue(event))}
            />
          </div>
          <div className="map-geofence-tools" hidden={!geofenceView}>
            <ModusWcTextInput
              ref={geofenceSearchRef}
              aria-label="Search geofences"
              includeSearch
              placeholder="Search"
              size="sm"
              value={geofenceQuery}
              onInputChange={(event) => onGeofenceQueryChange(readControlValue(event))}
            />
            <ModusWcButton
              aria-label="Add geofence"
              color="tertiary"
              shape="square"
              size="sm"
              variant="outlined"
            >
              <ModusWcIcon decorative name="add" size="xs" />
            </ModusWcButton>
          </div>
        </div>
        <div className="map-devices-body" slot="body">
          <div hidden={geofenceView || assetView}>
            <ModusWcTypography
              customClass="app-muted map-devices-empty"
              hidden={visibleDeviceIds.length > 0}
              label="No devices match this search."
            />
            <ModusWcMenu
              aria-label="Devices"
              customClass="map-device-list"
              hidden={visibleDeviceIds.length === 0}
              selectionMode="single"
              size="sm"
            >
              {devices.map((device) => (
                <DeviceRow
                  key={device.id}
                  device={device}
                  hidden={!visibleDevices.has(device.id)}
                  selected={selectedId === device.id}
                  onSelect={onSelect}
                />
              ))}
            </ModusWcMenu>
          </div>
          <div hidden={geofenceView || !assetView}>
            <ModusWcTypography
              customClass="app-muted map-devices-empty"
              hidden={visibleAssetIds.length > 0}
              label="No assets match this search."
            />
            <ModusWcMenu
              aria-label="Assets"
              customClass="map-device-list"
              hidden={visibleAssetIds.length === 0}
              selectionMode="single"
              size="sm"
            >
              {assets.map((asset) => (
                <AssetRow
                  key={asset.id}
                  asset={asset}
                  hidden={!visibleAssets.has(asset.id)}
                  selected={selectedId === asset.id}
                  onSelect={onSelect}
                />
              ))}
            </ModusWcMenu>
          </div>
          <div hidden={!geofenceView}>
            <ModusWcTypography
              customClass="app-muted map-devices-empty"
              hidden={geofences.length > 0}
              label="No geofences match this search."
            />
            <ModusWcAccordion
              aria-label="Geofence categories"
              customClass="map-geofence-groups"
              hidden={geofences.length === 0}
            >
              {GEOFENCE_GROUPS.map((group) => {
                const matches = geofences.filter((item) => item.category === group.category);
                return (
                  <ModusWcCollapse
                    key={group.category}
                    bordered
                    collapseId={`geofence-group-${group.category}`}
                    expanded={expandedGroups[group.category]}
                    hidden={matches.length === 0}
                    onExpandedChange={(event) => {
                      setExpandedGroups((current) => ({
                        ...current,
                        [group.category]: event.detail.expanded,
                      }));
                    }}
                  >
                    <div slot="header" className="map-geofence-group-header">
                      <ModusWcTypography
                        customClass="map-geofence-group-title"
                        size="sm"
                        weight="semibold"
                        label={`${group.label} (${matches.length})`}
                      />
                      <span
                        className="map-geofence-visibility"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <ModusWcSwitch
                          aria-label={`Show ${group.label} on map`}
                          size="sm"
                          value={categoryVisibility[group.category]}
                          onInputChange={(event) => {
                            onCategoryVisibilityChange(
                              group.category,
                              readControlChecked(event),
                            );
                          }}
                        />
                      </span>
                    </div>
                    <div slot="content">
                      <ModusWcMenu
                        aria-label={group.label}
                        customClass="map-geofence-list"
                        selectionMode="single"
                        size="sm"
                      >
                        {MAP_GEOFENCES.filter((item) => item.category === group.category).map(
                          (item) => (
                            <ModusWcMenuItem
                              key={item.id}
                              hidden={!matches.some((match) => match.id === item.id)}
                              label={item.name}
                              selected={selectedGeofenceId === item.id}
                              size="sm"
                              subLabel={group.itemLabel}
                              value={item.id}
                              onItemSelect={() => onSelectGeofence(item.id)}
                            >
                              <ModusWcIcon
                                customClass={`map-geofence-icon map-geofence-icon-${group.category}`}
                                decorative
                                name={group.icon}
                                size="sm"
                                slot="start-icon"
                              />
                            </ModusWcMenuItem>
                          ),
                        )}
                      </ModusWcMenu>
                    </div>
                  </ModusWcCollapse>
                );
              })}
            </ModusWcAccordion>
          </div>
        </div>
      </ModusWcPanel>
    </div>
  );
}
