import { ModusWcCard, ModusWcTable, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';
import { useMemo } from 'react';

import { displayValue, type ReportedComponent } from '../../data/assets';

const COLUMNS: ITableColumn[] = [
  { id: 'model', accessor: 'model', header: 'Model', sortable: true },
  { id: 'serialNumber', accessor: 'serialNumber', header: 'Serial number', sortable: true },
  { id: 'firmware', accessor: 'firmware', header: 'Firmware', sortable: true },
  { id: 'location', accessor: 'location', header: 'Location', sortable: true },
  { id: 'connection', accessor: 'connection', header: 'Connection', sortable: true },
];

type ReportedComponentsProps = {
  components: ReportedComponent[];
};

export function ReportedComponents({ components }: ReportedComponentsProps) {
  const rows = useMemo(
    () =>
      components.map((component, index) => ({
        id: `component-${index}`,
        model: displayValue(component.model),
        serialNumber: displayValue(component.serialNumber),
        firmware: displayValue(component.firmware),
        location: displayValue(component.location),
        connection: component.connected ? 'Connected' : 'Not connected',
      })),
    [components],
  );

  return (
    <ModusWcCard bordered padding="compact">
      <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
        <ModusWcTypography
          hierarchy="h2"
          label="Reported components"
          size="lg"
          weight="semibold"
        />
      </div>
      <div>
        <ModusWcTypography
          customClass="app-muted record-help"
          hierarchy="p"
          label="These parts stay on the asset and cannot be opened."
          size="sm"
        />
        <div hidden={rows.length > 0}>
          <ModusWcTypography
            customClass="app-muted"
            hierarchy="p"
            label="No reported components."
            size="sm"
          />
        </div>
        <div hidden={rows.length === 0}>
          <ModusWcTable
            caption="Reported components"
            columns={COLUMNS}
            data={rows}
            density="compact"
            hover={false}
            sortable
            zebra
          />
        </div>
      </div>
    </ModusWcCard>
  );
}
