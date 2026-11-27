import { ModusWcBadge } from '@trimble-oss/moduswebcomponents-react';

import { reportingLabel, type ReportingState } from '../../../data/mapMarkers';

export function reportingColor(state: ReportingState): 'success' | 'warning' | 'default' {
  if (state === 'warning') {
    return 'warning';
  }
  if (state === 'active') {
    return 'success';
  }
  return 'default';
}

export function ReportingBadge({ state }: { state: ReportingState }) {
  const label = reportingLabel(state);
  return (
    <ModusWcBadge color={reportingColor(state)} size="sm" variant="filled">
      <span>{label}</span>
    </ModusWcBadge>
  );
}

export function reportingBadgeElement(state: ReportingState): HTMLElement {
  const badge = document.createElement('modus-wc-badge') as HTMLModusWcBadgeElement;
  const color = reportingColor(state);
  badge.color = color;
  badge.size = 'sm';
  badge.variant = 'filled';
  const label = document.createElement('span');
  label.textContent = reportingLabel(state);
  badge.append(label);
  return badge;
}

export function openRowButton(name: string, onOpen: () => void): HTMLElement {
  const button = document.createElement('modus-wc-button') as HTMLModusWcButtonElement;
  button.color = 'tertiary';
  button.variant = 'borderless';
  button.size = 'sm';
  button.buttonAriaLabel = `Open ${name}`;
  const label = document.createElement('span');
  label.textContent = 'Open';
  button.append(label);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onOpen();
  });
  return button;
}
