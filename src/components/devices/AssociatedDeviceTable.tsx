import { ModusWcTable, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';
import { useMemo } from 'react';

import { displayValue } from '../../data/assets';
import { DEVICES } from '../../data/devices';
import { deviceReportingState, type ReportingState } from '../../data/mapMarkers';
import { openRowButton, reportingBadgeElement } from './reportingDisplay';

type AssociatedDeviceRow = {
  id: string;
  name: string;
  model: string;
  reportingState: ReportingState;
  lastReported: string;
};

type AssociatedDeviceTableProps = {
  deviceIds: string[];
  onOpen: (id: string) => void;
};

export function AssociatedDeviceTable({ deviceIds, onOpen }: AssociatedDeviceTableProps) {
  const rows = useMemo<AssociatedDeviceRow[]>(
    () =>
      deviceIds.flatMap((deviceId) => {
        const device = DEVICES.find((item) => item.id === deviceId);
        if (!device) {
          return [];
        }

        return [
          {
            id: device.id,
            name: device.name,
            model: device.model,
            reportingState: deviceReportingState(device),
            lastReported: displayValue(device.lastUpdated),
          },
        ];
      }),
    [deviceIds],
  );
  const columns = useMemo<ITableColumn[]>(
    () => [
      { id: 'name', accessor: 'name', header: 'Name', sortable: true },
      { id: 'model', accessor: 'model', header: 'Model', sortable: true },
      {
        id: 'reporting',
        accessor: 'reportingState',
        header: 'Reporting',
        sortable: true,
        cellRenderer: (value) => {
          const state: ReportingState =
            value === 'warning' || value === 'active' || value === 'notreporting'
              ? value
              : 'notreporting';
          return reportingBadgeElement(state);
        },
      },
      { id: 'lastReported', accessor: 'lastReported', header: 'Last reported', sortable: true },
      {
        id: 'open',
        accessor: 'id',
        header: 'Actions',
        width: '6rem',
        cellRenderer: (value, row) => {
          const record = row as AssociatedDeviceRow;
          const id = typeof value === 'string' ? value : record.id;
          return openRowButton(record.name, () => onOpen(id));
        },
      },
    ],
    [onOpen],
  );
  const tableKey = rows.map((row) => row.id).join('|');

  return (
    <div>
      <div hidden={rows.length > 0}>
        <ModusWcTypography
          customClass="app-muted"
          hierarchy="p"
          label="No associated devices."
          size="sm"
        />
      </div>
      <div hidden={rows.length === 0}>
        <ModusWcTable
          key={tableKey}
          caption="Associated devices"
          columns={columns}
          data={rows}
          density="compact"
          hover
          sortable
          zebra
          onRowClick={(event) => {
            const id = event.detail?.row?.id;
            if (typeof id === 'string') {
              onOpen(id);
            }
          }}
        />
      </div>
    </div>
  );
}
