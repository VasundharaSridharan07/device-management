import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcTable,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';
import { useEffect, useMemo, useRef, useState } from 'react';

import { openRowButton } from './reportingDisplay';

export type AssetTableRow = {
  id: string;
  name: string;
  type: string;
  project: string;
  location: string;
  deviceCount: number;
};

type AssetTableProps = {
  rows: AssetTableRow[];
  query: string;
  onQueryChange: (query: string) => void;
  onOpen: (id: string) => void;
};

function readInputValue(event: CustomEvent<InputEvent>): string {
  const target = event.detail?.target;
  if (target instanceof HTMLInputElement) {
    return target.value;
  }

  return '';
}

function focusSearchField(host: HTMLElement | null) {
  const input = host?.querySelector('input') ?? host?.shadowRoot?.querySelector('input') ?? null;
  input?.focus();
}

export function AssetTable({ rows, query, onQueryChange, onOpen }: AssetTableProps) {
  const [searchOpen, setSearchOpen] = useState(query.trim().length > 0);
  const searchRef = useRef<HTMLModusWcTextInputElement>(null);
  const columns = useMemo<ITableColumn[]>(
    () => [
      { id: 'name', accessor: 'name', header: 'Name', sortable: true },
      { id: 'type', accessor: 'type', header: 'Type', sortable: true },
      { id: 'project', accessor: 'project', header: 'Project', sortable: true },
      { id: 'location', accessor: 'location', header: 'Location', sortable: true },
      { id: 'deviceCount', accessor: 'deviceCount', header: 'Devices', sortable: true },
      {
        id: 'open',
        accessor: 'id',
        header: 'Actions',
        width: '6rem',
        cellRenderer: (value, row) => {
          const record = row as AssetTableRow;
          const id = typeof value === 'string' ? value : record.id;
          return openRowButton(record.name, () => onOpen(id));
        },
      },
    ],
    [onOpen],
  );
  const tableKey = rows.map((row) => `${row.id}:${row.project}:${row.deviceCount}`).join('|');
  const emptyLabel =
    query.trim().length > 0 ? 'No assets match this search.' : 'No assets to show.';

  useEffect(() => {
    if (searchOpen) {
      focusSearchField(searchRef.current);
    }
  }, [searchOpen]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) {
        onQueryChange('');
      }
      return !open;
    });
  };

  return (
    <section aria-label="Asset inventory" className="devices-table">
      <div className="flex flex-wrap items-center justify-end gap-2 px-2 py-2">
        <div className="devices-search" hidden={!searchOpen}>
          <ModusWcTextInput
            ref={searchRef}
            aria-label="Search assets"
            includeClear
            placeholder="Search assets"
            size="sm"
            type="search"
            value={query}
            onClearClick={() => onQueryChange('')}
            onInputChange={(event) => onQueryChange(readInputValue(event))}
          />
        </div>
        <ModusWcButton
          aria-label="Search assets"
          color="tertiary"
          pressed={searchOpen}
          shape="square"
          size="sm"
          variant="borderless"
          onButtonClick={toggleSearch}
        >
          <ModusWcIcon decorative name="search" size="xs" />
        </ModusWcButton>
      </div>
      <div className="px-2 py-4" hidden={rows.length > 0}>
        <ModusWcTypography customClass="app-muted" hierarchy="p" label={emptyLabel} size="sm" />
      </div>
      <div hidden={rows.length === 0}>
        <ModusWcTable
          key={tableKey}
          caption="Assets"
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
    </section>
  );
}
