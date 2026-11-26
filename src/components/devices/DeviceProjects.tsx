import {
  ModusWcBadge,
  ModusWcButton,
  ModusWcDivider,
  ModusWcIcon,
  ModusWcModal,
  ModusWcSelect,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ISelectOption } from '@trimble-oss/moduswebcomponents';
import { useEffect, useMemo, useState } from 'react';

import { SERVER_LOCATIONS, serverLocationLabel } from '../../data/devices';
import {
  activeProjectCount,
  assignedOutsideRegionCount,
  isDeviceActiveInProject,
  projectViewUrl,
  projectsAvailableInRegion,
  projectsForDevice,
  projectsForDeviceInRegion,
  type Project,
} from '../../data/projects';
import { canAdministerDevices, manageProjectsVariant } from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { ManageProjectsOption02, MANAGE_PROJECTS_OPTION_02_MODAL_ID } from './ManageProjectsOption02';
import { closeModusDialog, showModusDialog } from './modusDialog';

const MANAGE_PROJECTS_MODAL_ID = 'manage-device-projects-modal';
const REMOVE_PROJECT_MODAL_ID = 'remove-device-project-modal';
const VISIBLE_PROJECT_NAMES = 2;

type DeviceProjectsProps = {
  deviceId: string;
  deviceName: string;
  serialNumber: string;
  serverLocationId: string;
  projects: Project[];
  onAdd: (projectIds: string[]) => void;
  onRemove: (projectId: string) => void;
};

function readFieldValue(event: CustomEvent<InputEvent>): string {
  const target = event.detail?.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
    return target.value;
  }

  return '';
}

function matchesQuery(project: Project, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return needle.length === 0 || project.name.toLowerCase().includes(needle);
}

function openProject(projectId: string) {
  window.open(projectViewUrl(projectId), '_blank', 'noopener,noreferrer');
}

type ProjectColumnProps = {
  title: string;
  count: number;
  query: string;
  searchLabel: string;
  emptyLabel: string;
  projects: Project[];
  deviceId: string;
  action: 'assign' | 'remove';
  onQueryChange: (query: string) => void;
  onAssign?: (projectId: string) => void;
  onRemove?: (project: Project) => void;
};

function ProjectColumn({
  title,
  count,
  query,
  searchLabel,
  emptyLabel,
  projects,
  deviceId,
  action,
  onQueryChange,
  onAssign,
  onRemove,
}: ProjectColumnProps) {
  const visible = projects.filter((project) => matchesQuery(project, query));
  const emptyMessage =
    projects.length === 0 ? emptyLabel : `No ${title.toLowerCase()} projects match this search.`;

  return (
    <section aria-label={title} className="manage-projects-column">
      <div className="manage-projects-column-heading">
        <ModusWcTypography hierarchy="h3" label={title} size="sm" weight="semibold">
          <span>{title}</span>
        </ModusWcTypography>
        <ModusWcTypography hierarchy="p" label={String(count)} size="sm">
          <span>{count}</span>
        </ModusWcTypography>
      </div>
      <ModusWcTextInput
        aria-label={searchLabel}
        includeClear
        includeSearch
        placeholder="Search"
        size="sm"
        value={query}
        onClearClick={() => onQueryChange('')}
        onInputChange={(event) => onQueryChange(readFieldValue(event))}
      />
      {visible.length === 0 ? (
        <ModusWcTypography customClass="app-muted" hierarchy="p" label={emptyMessage} size="sm">
          <span>{emptyMessage}</span>
        </ModusWcTypography>
      ) : (
        <ul className="manage-projects-list">
          {visible.map((project) => {
            const active = isDeviceActiveInProject(project, deviceId);
            return (
              <li key={project.id}>
                <a
                  className="manage-projects-name"
                  href={projectViewUrl(project.id)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ModusWcTypography hierarchy="p" label={project.name} size="sm">
                    <span>{project.name}</span>
                  </ModusWcTypography>
                </a>
                {active ? (
                  <span className="manage-projects-badge">
                    <ModusWcBadge color="success" size="sm" variant="filled">
                      Active
                    </ModusWcBadge>
                  </span>
                ) : null}
                <div className="manage-projects-row-actions">
                  <ModusWcButton
                    aria-label={`View ${project.name}`}
                    color="tertiary"
                    size="sm"
                    variant="borderless"
                    onButtonClick={() => openProject(project.id)}
                  >
                    <ModusWcIcon decorative name="launch" size="xs" />
                    View
                  </ModusWcButton>
                  {action === 'remove' ? (
                    <ModusWcButton
                      color="tertiary"
                      size="sm"
                      variant="outlined"
                      onButtonClick={() => onRemove?.(project)}
                    >
                      Remove
                    </ModusWcButton>
                  ) : (
                    <ModusWcButton
                      color="tertiary"
                      size="sm"
                      variant="outlined"
                      onButtonClick={() => onAssign?.(project.id)}
                    >
                      <ModusWcIcon decorative name="add" size="xs" />
                      Assign
                    </ModusWcButton>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function DeviceProjects({
  deviceId,
  deviceName,
  serialNumber,
  serverLocationId,
  projects,
  onAdd,
  onRemove,
}: DeviceProjectsProps) {
  const { config } = useExperiment();
  const canManage = canAdministerDevices(config.persona);
  const variant = manageProjectsVariant(config.manageProjects);
  const [locationId, setLocationId] = useState(serverLocationId);
  const [assignedQuery, setAssignedQuery] = useState('');
  const [availableQuery, setAvailableQuery] = useState('');
  const [pendingRemove, setPendingRemove] = useState<Project | null>(null);

  const assigned = useMemo(() => projectsForDevice(projects, deviceId), [projects, deviceId]);
  const assignedHere = useMemo(
    () => projectsForDeviceInRegion(projects, deviceId, locationId),
    [projects, deviceId, locationId],
  );
  const availableHere = useMemo(
    () => projectsAvailableInRegion(projects, deviceId, locationId),
    [projects, deviceId, locationId],
  );
  const activeCount = useMemo(
    () => activeProjectCount(projects, deviceId),
    [projects, deviceId],
  );
  const outsideCount = assignedOutsideRegionCount(projects, deviceId, locationId);
  const preview = assigned.slice(0, VISIBLE_PROJECT_NAMES);
  const hiddenCount = assigned.length - preview.length;
  const locationOptions: ISelectOption[] = SERVER_LOCATIONS.map((location) => ({
    value: location.id,
    label:
      location.id === serverLocationId
        ? `${location.label} (this device)`
        : location.label,
  }));
  const pendingActive = pendingRemove
    ? isDeviceActiveInProject(pendingRemove, deviceId)
    : false;
  const confirmMessage = pendingRemove
    ? pendingActive
      ? `${deviceName} is currently active in ${pendingRemove.name}. Remove it from this project?`
      : `Remove ${deviceName} from ${pendingRemove.name}?`
    : '';
  const subtitle = `${deviceName} · ${serialNumber}`;
  const outsideLabel = `Also assigned in other server locations (${outsideCount}).`;
  const activeLabel = `Active in ${activeCount}`;

  useEffect(() => {
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
    closeModusDialog(MANAGE_PROJECTS_OPTION_02_MODAL_ID);
    closeModusDialog(REMOVE_PROJECT_MODAL_ID);
  }, [canManage, variant.id]);

  const openPicker = () => {
    if (variant.id === 'option-02') {
      showModusDialog(MANAGE_PROJECTS_OPTION_02_MODAL_ID);
      return;
    }

    setLocationId(serverLocationId);
    setAssignedQuery('');
    setAvailableQuery('');
    setPendingRemove(null);
    showModusDialog(MANAGE_PROJECTS_MODAL_ID);
  };

  const closePicker = () => {
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
  };

  const askRemove = (project: Project) => {
    setPendingRemove(project);
    showModusDialog(REMOVE_PROJECT_MODAL_ID);
  };

  const cancelRemove = () => {
    closeModusDialog(REMOVE_PROJECT_MODAL_ID);
    setPendingRemove(null);
  };

  const confirmRemove = () => {
    if (!pendingRemove) {
      return;
    }

    onRemove(pendingRemove.id);
    closeModusDialog(REMOVE_PROJECT_MODAL_ID);
    setPendingRemove(null);
  };

  return (
    <section aria-label="Projects" className="device-projects">
      <ModusWcDivider orientation="horizontal" />
      <div className="device-projects-heading">
        <ModusWcTypography hierarchy="h3" label="Projects" size="sm" weight="semibold">
          Projects
        </ModusWcTypography>
        <ModusWcTypography hierarchy="p" label={String(assigned.length)} size="sm">
          <span>{assigned.length}</span>
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
              <span>{project.name}</span>
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
          {activeCount > 0 ? (
            <ModusWcTypography customClass="app-muted" hierarchy="p" label={activeLabel} size="sm">
              <span>{activeLabel}</span>
            </ModusWcTypography>
          ) : null}
        </div>
      )}
      {canManage ? (
        <div>
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={openPicker}>
            Manage
          </ModusWcButton>
        </div>
      ) : (
        <ModusWcTypography
          customClass="app-muted"
          hierarchy="p"
          label="A licensed admin assigns projects."
          size="sm"
        >
          A licensed admin assigns projects.
        </ModusWcTypography>
      )}
      <ModusWcModal
        aria-label="Manage projects"
        customClass="manage-projects-modal"
        modalId={MANAGE_PROJECTS_MODAL_ID}
        showFullscreenToggle
      >
        <div slot="header" className="manage-projects-header">
          <ModusWcTypography hierarchy="h2" label="Manage projects" size="md" weight="semibold">
            Manage projects
          </ModusWcTypography>
          <ModusWcTypography customClass="app-muted" hierarchy="p" label={subtitle} size="sm">
            <span>{subtitle}</span>
          </ModusWcTypography>
        </div>
        <div slot="content" className="manage-projects-body">
          <div className="manage-projects-location">
            <ModusWcSelect
              label="Server location"
              options={locationOptions}
              size="sm"
              value={locationId}
              onInputChange={(event) => {
                const next = readFieldValue(event);
                if (SERVER_LOCATIONS.some((location) => location.id === next)) {
                  setLocationId(next);
                }
              }}
            />
          </div>
          <ModusWcTypography
            customClass="app-muted"
            hierarchy="p"
            label="Projects below are only from the selected server location."
            size="sm"
          >
            Projects below are only from the selected server location.
          </ModusWcTypography>
          {outsideCount > 0 ? (
            <ModusWcTypography customClass="app-muted" hierarchy="p" label={outsideLabel} size="sm">
              <span>{outsideLabel}</span>
            </ModusWcTypography>
          ) : null}
          <div className="manage-projects-columns">
            <ProjectColumn
              action="remove"
              count={assignedHere.length}
              deviceId={deviceId}
              emptyLabel={`Not assigned to any projects in ${serverLocationLabel(locationId)}.`}
              projects={assignedHere}
              query={assignedQuery}
              searchLabel="Search assigned projects"
              title="Assigned"
              onQueryChange={setAssignedQuery}
              onRemove={askRemove}
            />
            <ProjectColumn
              action="assign"
              count={availableHere.length}
              deviceId={deviceId}
              emptyLabel={`No projects left to assign in ${serverLocationLabel(locationId)}.`}
              projects={availableHere}
              query={availableQuery}
              searchLabel="Search available projects"
              title="Available"
              onAssign={(projectId) => onAdd([projectId])}
              onQueryChange={setAvailableQuery}
            />
          </div>
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closePicker}>
            Close
          </ModusWcButton>
        </div>
      </ModusWcModal>
      <ManageProjectsOption02 deviceName={deviceName} serialNumber={serialNumber} />
      <ModusWcModal aria-label="Remove from project" modalId={REMOVE_PROJECT_MODAL_ID}>
        <div slot="header">
          <ModusWcTypography hierarchy="h2" label="Remove from project" size="md" weight="semibold">
            Remove from project
          </ModusWcTypography>
        </div>
        <div slot="content">
          <ModusWcTypography hierarchy="p" label={confirmMessage} size="sm">
            <span>{confirmMessage}</span>
          </ModusWcTypography>
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={cancelRemove}>
            Cancel
          </ModusWcButton>
          <ModusWcButton color="danger" size="sm" variant="filled" onButtonClick={confirmRemove}>
            <ModusWcIcon decorative name="delete" size="xs" />
            Remove
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </section>
  );
}
