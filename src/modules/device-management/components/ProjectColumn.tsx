import {
  ModusWcBadge,
  ModusWcButton,
  ModusWcIcon,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { projectViewUrl, type Project } from '../../../data/projects';

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
  action: 'assign' | 'remove';
  isActive: (project: Project) => boolean;
  onQueryChange: (query: string) => void;
  onAssign?: (projectId: string) => void;
  onRemove?: (project: Project) => void;
};

export function ProjectColumn({
  title,
  count,
  query,
  searchLabel,
  emptyLabel,
  projects,
  action,
  isActive,
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
            const active = isActive(project);
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
