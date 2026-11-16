import {
  ModusWcButton,
  ModusWcDivider,
  ModusWcIcon,
  ModusWcModal,
  ModusWcTable,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ITableColumn } from '@trimble-oss/moduswebcomponents';
import { useMemo, useState } from 'react';

import { ACCOUNT_NAME, projectsForDevice, type Project } from '../../data/projects';
import { closeModusDialog, showModusDialog } from './modusDialog';

const MANAGE_PROJECTS_MODAL_ID = 'manage-device-projects-modal';
const VISIBLE_PROJECT_NAMES = 2;

const PROJECT_COLUMNS: ITableColumn[] = [
  {
    id: 'name',
    accessor: 'name',
    header: 'Project',
    sortable: true,
  },
];

type DeviceProjectsProps = {
  deviceId: string;
  projects: Project[];
  onAdd: (projectIds: string[]) => void;
  onRemove: (projectId: string) => void;
};

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

export function DeviceProjects({ deviceId, projects, onAdd, onRemove }: DeviceProjectsProps) {
  const [pickerIds, setPickerIds] = useState<string[]>([]);
  const [pickerSession, setPickerSession] = useState(0);
  const assigned = useMemo(() => projectsForDevice(projects, deviceId), [projects, deviceId]);
  const assignedIds = useMemo(() => assigned.map((project) => project.id), [assigned]);
  const preview = assigned.slice(0, VISIBLE_PROJECT_NAMES);
  const hiddenCount = assigned.length - preview.length;
  const pickerRows = useMemo(
    () => projects.map((project) => ({ id: project.id, name: project.name })),
    [projects],
  );
  const pickerKey = `${pickerSession}|${pickerRows.map((row) => row.id).join('|')}`;
  const selectionUnchanged = sameIds(pickerIds, assignedIds);

  const openPicker = () => {
    setPickerIds(assignedIds);
    setPickerSession((session) => session + 1);
    showModusDialog(MANAGE_PROJECTS_MODAL_ID);
  };

  const closePicker = () => {
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
    setPickerIds([]);
  };

  const confirmSave = () => {
    if (selectionUnchanged) {
      return;
    }

    const selected = new Set(pickerIds);
    const current = new Set(assignedIds);
    const toAdd = pickerIds.filter((id) => !current.has(id));
    const toRemove = assignedIds.filter((id) => !selected.has(id));

    if (toAdd.length > 0) {
      onAdd(toAdd);
    }

    toRemove.forEach((projectId) => onRemove(projectId));
    closePicker();
  };

  return (
    <section aria-label="Projects" className="device-projects">
      <ModusWcDivider orientation="horizontal" />
      <div className="device-projects-heading">
        <ModusWcTypography hierarchy="h3" label="Projects" size="sm" weight="semibold">
          Projects
        </ModusWcTypography>
        <ModusWcTypography hierarchy="p" label={String(assigned.length)} size="sm">
          {assigned.length}
        </ModusWcTypography>
      </div>
      {assigned.length === 0 ? (
        <ModusWcTypography
          customClass="app-muted"
          hierarchy="p"
          label="Not assigned to any projects."
          size="sm"
        >
          Not assigned to any projects.
        </ModusWcTypography>
      ) : (
        <div className="device-project-names">
          {preview.map((project) => (
            <ModusWcTypography
              key={project.id}
              customClass="device-project-name"
              hierarchy="p"
              label={project.name}
              size="sm"
            >
              {project.name}
            </ModusWcTypography>
          ))}
          {hiddenCount > 0 ? (
            <ModusWcTypography
              customClass="app-muted"
              hierarchy="p"
              label={`${hiddenCount} more`}
              size="sm"
            >
              {hiddenCount} more
            </ModusWcTypography>
          ) : null}
        </div>
      )}
      <div>
        <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={openPicker}>
          Manage
        </ModusWcButton>
      </div>
      <ModusWcModal
        aria-label="Projects"
        customClass="device-picker-modal"
        modalId={MANAGE_PROJECTS_MODAL_ID}
      >
        <div slot="header">
          <ModusWcTypography hierarchy="h2" label="Projects" size="md" weight="semibold">
            Projects
          </ModusWcTypography>
        </div>
        <div slot="content">
          <ModusWcTypography
            customClass="app-muted device-modal-copy"
            hierarchy="p"
            label={ACCOUNT_NAME}
            size="sm"
          >
            {ACCOUNT_NAME}
          </ModusWcTypography>
          <div className="device-picker">
            <ModusWcTable
              key={pickerKey}
              caption="Projects in this account"
              columns={PROJECT_COLUMNS}
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
            disabled={selectionUnchanged}
            size="sm"
            variant="filled"
            onButtonClick={confirmSave}
          >
            <ModusWcIcon decorative name="save_disk" size="xs" />
            Save
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </section>
  );
}
