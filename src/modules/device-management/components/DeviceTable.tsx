import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcModal,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';
import { useEffect, useMemo, useRef, useState } from 'react';

import deviceIcon from '../../../assets/custom-icons/device.svg';
import { NO_ASSOCIATED_ASSET } from '../../../data/assets';
import type { Device } from '../../../data/devices';
import { useFleet } from '../../../data/FleetContext';
import { closeModusDialog, showModusDialog } from './modusDialog';
import { openRowButton } from './reportingDisplay';

const ADD_DEVICES_MODAL_ID = 'add-devices-modal';

type DeviceTableProps = {
  devices: Device[];
  candidates: Device[];
  query: string;
  selectedRowIds: string[];
  canEditGroup: boolean;
  canRegisterDevices: boolean;
  canRemove: boolean;
  onQueryChange: (query: string) => void;
  onSelectedRowIdsChange: (ids: string[]) => void;
  onDeviceOpen: (id: string) => void;
  onAddDevices: (ids: string[]) => void;
  onRemoveDevices: () => void;
};

const DEVICE_ICON_SIZE = '24px';

function renderDeviceName(value: unknown): HTMLElement {
  const row = document.createElement('span');
  row.style.display = 'inline-flex';
  row.style.alignItems = 'center';
  row.style.gap = 'var(--modus-wc-spacing-sm, 0.5rem)';
  row.style.minWidth = '0';

  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.style.display = 'inline-block';
  icon.style.width = DEVICE_ICON_SIZE;
  icon.style.height = DEVICE_ICON_SIZE;
  icon.style.flexShrink = '0';
  icon.style.backgroundColor = 'currentColor';
  const mask = `url("${deviceIcon}") center / ${DEVICE_ICON_SIZE} ${DEVICE_ICON_SIZE} no-repeat`;
  icon.style.mask = mask;
  icon.style.setProperty('-webkit-mask', mask);

  const label = document.createElement('span');
  label.textContent = typeof value === 'string' ? value : '';

  row.append(icon, label);
  return row;
}

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

const COLUMNS: ITableColumn[] = [
  {
    id: 'name',
    accessor: 'name',
    header: 'Device Name',
    sortable: true,
    cellRenderer: renderDeviceName,
  },
  {
    id: 'model',
    accessor: 'model',
    header: 'Device Model',
    sortable: true,
  },
  {
    id: 'lastUpdated',
    accessor: 'lastUpdated',
    header: 'Last Reported',
    sortable: true,
  },
  {
    id: 'serialNumber',
    accessor: 'serialNumber',
    header: 'Serial Number',
    sortable: true,
  },
  {
    id: 'currentFirmware',
    accessor: 'currentFirmware',
    header: 'Current Firmware',
    sortable: true,
  },
  {
    id: 'availableFirmware',
    accessor: 'availableFirmware',
    header: 'Available',
    sortable: true,
  },
  {
    id: 'associatedAsset',
    accessor: 'associatedAsset',
    header: 'Associated asset',
    sortable: true,
  },
];

const PICKER_COLUMNS: ITableColumn[] = COLUMNS.filter(
  (column) => column.id === 'name' || column.id === 'serialNumber',
);

function readInputValue(event: CustomEvent<InputEvent>): string {
  const target = event.detail?.target;
  if (target instanceof HTMLInputElement) {
    return target.value;
  }

  return '';
}

function focusSearchField(host: HTMLElement | null) {
  const input =
    host?.querySelector('input') ?? host?.shadowRoot?.querySelector('input') ?? null;
  input?.focus();
}

export function DeviceTable({
  devices,
  candidates,
  query,
  selectedRowIds,
  canEditGroup,
  canRegisterDevices,
  canRemove,
  onQueryChange,
  onSelectedRowIdsChange,
  onDeviceOpen,
  onAddDevices,
  onRemoveDevices,
}: DeviceTableProps) {
  const { assetForDevice } = useFleet();
  const [searchOpen, setSearchOpen] = useState(query.trim().length > 0);
  const [pickerIds, setPickerIds] = useState<string[]>([]);
  const [pickerSession, setPickerSession] = useState(0);
  const searchRef = useRef<HTMLModusWcTextInputElement>(null);
  const columns = useMemo<ITableColumn[]>(
    () => [
      ...COLUMNS,
      {
        id: 'open',
        accessor: 'id',
        header: 'Actions',
        width: '6rem',
        cellRenderer: (value, row) => {
          const record = row as { id?: string; name?: string };
          const id = typeof record.id === 'string' ? record.id : typeof value === 'string' ? value : '';
          const name = typeof record.name === 'string' ? record.name : 'device';
          return openRowButton(name, () => onDeviceOpen(id));
        },
      },
    ],
    [onDeviceOpen],
  );
  const rows = useMemo(
    () =>
      devices.map((device) => ({
        id: device.id,
        name: device.name,
        model: device.model,
        lastUpdated: device.lastUpdated,
        serialNumber: device.serialNumber,
        currentFirmware: device.currentFirmware,
        availableFirmware: device.availableFirmware,
        associatedAsset: assetForDevice(device.id)?.name ?? NO_ASSOCIATED_ASSET,
      })),
    [assetForDevice, devices],
  );
  // Remount when the visible rows change so the table body repaints.
  const tableKey = rows.map((row) => `${row.id}:${row.associatedAsset}`).join('|');

  useEffect(() => {
    if (searchOpen) {
      focusSearchField(searchRef.current);
    }
  }, [searchOpen]);

  const pickerRows = useMemo(
    () =>
      candidates.map((device) => ({
        id: device.id,
        name: device.name,
        serialNumber: device.serialNumber,
      })),
    [candidates],
  );
  const pickerKey = `${pickerSession}|${pickerRows.map((row) => row.id).join('|')}`;

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) {
        onQueryChange('');
      }
      return !open;
    });
  };

  const openPicker = () => {
    setPickerIds([]);
    setPickerSession((session) => session + 1);
    showModusDialog(ADD_DEVICES_MODAL_ID);
  };

  const closePicker = () => {
    closeModusDialog(ADD_DEVICES_MODAL_ID);
    setPickerIds([]);
  };

  const confirmAdd = () => {
    if (pickerIds.length === 0) {
      return;
    }

    onAddDevices(pickerIds);
    closePicker();
  };

  return (
    <section aria-label="Device inventory" className="devices-table">
      <div className="flex flex-wrap items-center justify-end gap-2 px-2 py-2">
        {searchOpen ? (
          <div className="devices-search">
            <ModusWcTextInput
              ref={searchRef}
              aria-label="Search devices"
              includeClear
              placeholder="Search devices"
              size="sm"
              type="search"
              value={query}
              onClearClick={() => onQueryChange('')}
              onInputChange={(event) => onQueryChange(readInputValue(event))}
            />
          </div>
        ) : null}
        <ModusWcButton
          aria-label="Search devices"
          color="tertiary"
          pressed={searchOpen}
          shape="square"
          size="sm"
          variant="borderless"
          onButtonClick={toggleSearch}
        >
          <ModusWcIcon decorative name="search" size="xs" />
        </ModusWcButton>
        <ModusWcButton
          aria-label="Filter devices"
          color="tertiary"
          shape="square"
          size="sm"
          variant="borderless"
        >
          <ModusWcIcon decorative name="filter" size="xs" />
        </ModusWcButton>
        {canEditGroup ? (
          <>
            <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={openPicker}>
              Add devices
            </ModusWcButton>
            <ModusWcButton
              color="tertiary"
              disabled={!canRemove}
              size="sm"
              variant="outlined"
              onButtonClick={onRemoveDevices}
            >
              <ModusWcIcon decorative name="remove" size="xs" />
              Remove
            </ModusWcButton>
          </>
        ) : null}
        {canRegisterDevices ? (
          <ModusWcButton color="primary" size="sm" variant="filled">
            <ModusWcIcon decorative name="add" size="xs" />
            Add
          </ModusWcButton>
        ) : null}
      </div>
      <ModusWcTable
        key={tableKey}
        caption="Devices"
        columns={columns}
        data={rows}
        density="compact"
        hover
        selectable="multi"
        selectedRowIds={selectedRowIds}
        sortable
        onRowClick={(event) => {
          const id = event.detail?.row?.id;
          if (typeof id === 'string') {
            onDeviceOpen(id);
          }
        }}
        onRowSelectionChange={(event) => {
          onSelectedRowIdsChange(event.detail?.selectedRowIds ?? []);
        }}
      />
      <ModusWcModal
        aria-label="Add devices"
        customClass="device-picker-modal"
        modalId={ADD_DEVICES_MODAL_ID}
      >
        <div slot="header">
          <ModusWcTypography hierarchy="h2" label="Add devices" size="md" weight="semibold" />
        </div>
        <div slot="content">
          <div className="device-picker">
            <ModusWcTable
              key={pickerKey}
              caption="Devices not in this group"
              columns={PICKER_COLUMNS}
              data={pickerRows}
              density="compact"
              hover
              selectable="multi"
              selectedRowIds={pickerIds}
              sortable
              onRowSelectionChange={(event) => {
                const ids = event.detail?.selectedRowIds ?? [];
                setPickerIds((current) => (sameIds(current, ids) ? current : ids));
              }}
            />
          </div>
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closePicker}>
            Cancel
          </ModusWcButton>
          <ModusWcButton
            color="primary"
            disabled={pickerIds.length === 0}
            size="sm"
            variant="filled"
            onButtonClick={confirmAdd}
          >
            <ModusWcIcon decorative name="add" size="xs" />
            Add
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </section>
  );
}
