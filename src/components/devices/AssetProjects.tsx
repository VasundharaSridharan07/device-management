import {
  ModusWcButton,
  ModusWcDivider,
  ModusWcModal,
  ModusWcSelect,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { ISelectOption } from '@trimble-oss/moduswebcomponents';
import { useEffect, useMemo, useRef, useState } from 'react';

import { serverLocationForDevices, type Asset } from '../../data/assets';
import { SERVER_LOCATIONS, serverLocationLabel } from '../../data/devices';
import { useFleet } from '../../data/FleetContext';
import {
  activeAssetProjectCount,
  isAssetActiveInProject,
  projectsByIds,
  type Project,
} from '../../data/projects';
import { canAdministerDevices, manageProjectsVariant } from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { closeModusDialog, ignoreDialogCancel, showModusDialog } from './modusDialog';
import { ProjectColumn } from './ProjectColumn';
import { ASSET_PROJECT_SAVE_IMPACT, ProjectSaveConfirm } from './ProjectSaveConfirm';

const MANAGE_PROJECTS_MODAL_ID = 'manage-asset-projects-modal';
const SAVE_CONFIRM_MODAL_ID = 'save-asset-projects-modal';
const VISIBLE_PROJECT_NAMES = 2;

type AssetProjectsProps = {
  asset: Asset;
};

function readFieldValue(event: CustomEvent<InputEvent>): string {
  const target = event.detail?.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
    return target.value;
  }

  return '';
}

export function AssetProjects({ asset }: AssetProjectsProps) {
  const { projects, addAssetProjects, removeAssetProject } = useFleet();
  const { config } = useExperiment();
  const canManage = canAdministerDevices(config.persona);
  const variant = manageProjectsVariant(config.manageProjects);
  const cleanup = variant.id === 'option-01';
  const home = serverLocationForDevices(asset.deviceIds);
  const [locationId, setLocationId] = useState<string>(home.locationId);
  const [assignedQuery, setAssignedQuery] = useState('');
  const [availableQuery, setAvailableQuery] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const pendingOpen = useRef(false);

  const assigned = useMemo(
    () => projectsByIds(projects, asset.projectIds),
    [projects, asset.projectIds],
  );
  const draftAssigned = useMemo(
    () => projects.filter((project) => draftIds.includes(project.id)),
    [projects, draftIds],
  );
  const assignedHere = useMemo(
    () =>
      cleanup
        ? draftAssigned
        : draftAssigned.filter((project) => project.regionId === locationId),
    [cleanup, draftAssigned, locationId],
  );
  const availableHere = useMemo(
    () =>
      projects.filter(
        (project) => project.regionId === locationId && !draftIds.includes(project.id),
      ),
    [projects, locationId, draftIds],
  );
  const activeCount = useMemo(
    () => activeAssetProjectCount(projects, asset.projectIds, asset.deviceIds),
    [projects, asset.projectIds, asset.deviceIds],
  );
  const outsideCount = draftAssigned.filter((project) => project.regionId !== locationId).length;
  const preview = assigned.slice(0, VISIBLE_PROJECT_NAMES);
  const hiddenCount = assigned.length - preview.length;
  const locationOptions: ISelectOption[] = SERVER_LOCATIONS.map((location) => ({
    value: location.id,
    label: location.label,
  }));
  const serial = asset.serialNumber?.trim() ?? '';
  const subtitle = serial.length > 0 ? `${asset.name} · ${serial}` : asset.name;
  const includesDevices = cleanup
    ? `Removing a project includes the devices on ${asset.name}.`
    : `Assigning or removing a project includes the devices on ${asset.name}.`;
  const outsideLabel = `Also assigned in other server locations (${outsideCount}).`;
  const activeLabel = `Active in ${activeCount}`;
  const columnClass = cleanup
    ? 'manage-projects-columns manage-projects-columns-single'
    : 'manage-projects-columns';

  useEffect(() => {
    closeModusDialog(SAVE_CONFIRM_MODAL_ID);
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
    const stopConfirmCancel = ignoreDialogCancel(SAVE_CONFIRM_MODAL_ID);
    const stopManageCancel = ignoreDialogCancel(MANAGE_PROJECTS_MODAL_ID);
    return () => {
      stopConfirmCancel();
      stopManageCancel();
    };
  }, [asset.id, canManage, variant.id]);

  const openPicker = () => {
    pendingOpen.current = true;
    setLocationId(home.locationId);
    setAssignedQuery('');
    setAvailableQuery('');
    setDraftIds(assigned.map((project) => project.id));
  };

  useEffect(() => {
    if (!pendingOpen.current) {
      return;
    }

    pendingOpen.current = false;
    showModusDialog(MANAGE_PROJECTS_MODAL_ID);
  }, [draftIds]);

  const closePicker = () => {
    setDraftIds(assigned.map((project) => project.id));
    closeModusDialog(SAVE_CONFIRM_MODAL_ID);
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
  };

  const requestSave = () => {
    const original = new Set(assigned.map((project) => project.id));
    const changed =
      draftIds.length !== original.size || draftIds.some((id) => !original.has(id));
    if (!changed) {
      closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
      return;
    }

    showModusDialog(SAVE_CONFIRM_MODAL_ID);
  };

  const confirmSave = () => {
    const original = new Set(assigned.map((project) => project.id));
    const next = new Set(draftIds);
    const added = draftIds.filter((id) => !original.has(id));
    for (const projectId of original) {
      if (!next.has(projectId)) {
        removeAssetProject(asset.id, projectId);
      }
    }
    if (added.length > 0) {
      addAssetProjects(asset.id, added);
    }
    closeModusDialog(SAVE_CONFIRM_MODAL_ID);
    closeModusDialog(MANAGE_PROJECTS_MODAL_ID);
  };

  const assignProject = (projectId: string) => {
    setDraftIds((current) => (current.includes(projectId) ? current : [...current, projectId]));
  };

  const removeProject = (project: Project) => {
    setDraftIds((current) => current.filter((id) => id !== project.id));
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
            Manage projects
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
        backdrop="static"
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
          <div hidden={cleanup} className="manage-projects-body">
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
            <div hidden={outsideCount === 0}>
              <ModusWcTypography customClass="app-muted" hierarchy="p" label={outsideLabel} size="sm">
                <span>{outsideLabel}</span>
              </ModusWcTypography>
            </div>
          </div>
          <ModusWcTypography customClass="app-muted" hierarchy="p" label={includesDevices} size="sm">
            <span>{includesDevices}</span>
          </ModusWcTypography>
          <div className={columnClass}>
            <ProjectColumn
              action="remove"
              count={assignedHere.length}
              emptyLabel={
                cleanup
                  ? 'Not assigned to any projects.'
                  : `Not assigned to any projects in ${serverLocationLabel(locationId)}.`
              }
              isActive={(project) => isAssetActiveInProject(project, asset.deviceIds)}
              projects={assignedHere}
              query={assignedQuery}
              searchLabel="Search assigned projects"
              title="Assigned"
              onQueryChange={setAssignedQuery}
              onRemove={removeProject}
            />
            <div hidden={cleanup}>
              <ProjectColumn
                action="assign"
                count={availableHere.length}
                emptyLabel={`No projects left to assign in ${serverLocationLabel(locationId)}.`}
                isActive={(project) => isAssetActiveInProject(project, asset.deviceIds)}
                projects={availableHere}
                query={availableQuery}
                searchLabel="Search available projects"
                title="Available"
                onAssign={assignProject}
                onQueryChange={setAvailableQuery}
              />
            </div>
          </div>
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closePicker}>
            Close
          </ModusWcButton>
          <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={requestSave}>
            Save
          </ModusWcButton>
        </div>
      </ModusWcModal>
      <ProjectSaveConfirm
        message={ASSET_PROJECT_SAVE_IMPACT}
        modalId={SAVE_CONFIRM_MODAL_ID}
        onSave={confirmSave}
      />
    </section>
  );
}
