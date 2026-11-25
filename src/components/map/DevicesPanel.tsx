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
  GEOFENCE_GROUPS,
  MAP_ASSETS,
  MAP_GEOFENCES,
  isMapFilter,
  type MapAsset,
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
  assets: MapAsset[];
  categoryVisibility: Record<MapGeofenceCategory, boolean>;
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
  asset,
  hidden,
  selected,
  onSelect,
}: {
  asset: MapAsset;
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
      subLabel={`Last Report: ${asset.lastReport}`}
      value={asset.id}
      onItemSelect={() => onSelect(asset.id)}
    >
      <span className="map-device-icons" slot="start-icon">
        <ModusWcIcon decorative name="in_field_device" size="sm" />
        <ModusWcIcon
          aria-label="Alert"
          customClass="map-device-alert"
          decorative={false}
          hidden={!asset.alert}
          name="warning"
          size="sm"
        />
      </span>
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
  if (label === 'Devices') {
    return 'devices';
  }
  if (label === 'Geofences') {
    return 'geofences';
  }
  return null;
}

export function DevicesPanel({
  assets,
  categoryVisibility,
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

  return (
    <div className="map-devices-panel" hidden={hidden}>
      <ModusWcPanel
        aria-label={geofenceView ? 'Geofences' : 'Devices'}
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
                Devices
              </ModusWcButton>
              <ModusWcButton pressed={view === 'geofences'} size="sm">
                Geofences
              </ModusWcButton>
            </ModusWcButtonGroup>
            <ModusWcButton
              aria-label={geofenceView ? 'Close geofences' : 'Close devices'}
              color="tertiary"
              shape="square"
              size="sm"
              variant="borderless"
              onButtonClick={onClose}
            >
              <ModusWcIcon decorative name="close" size="xs" />
            </ModusWcButton>
          </div>
          <div className="map-device-tools" hidden={geofenceView}>
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
          <div hidden={geofenceView}>
            <ModusWcTypography
              customClass="app-muted map-devices-empty"
              hidden={assets.length > 0}
              label="No devices match this search."
            />
            <ModusWcMenu
              aria-label="Devices"
              customClass="map-device-list"
              hidden={assets.length === 0}
              selectionMode="single"
              size="sm"
            >
              {MAP_ASSETS.map((asset) => (
                <DeviceRow
                  key={asset.id}
                  asset={asset}
                  hidden={!assets.some((item) => item.id === asset.id)}
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
