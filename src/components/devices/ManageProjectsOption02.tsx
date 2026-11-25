import {
  ModusWcButton,
  ModusWcModal,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';

import { closeModusDialog } from './modusDialog';

export const MANAGE_PROJECTS_OPTION_02_MODAL_ID = 'manage-device-projects-option-02';

type ManageProjectsOption02Props = {
  deviceName: string;
  serialNumber: string;
};

export function ManageProjectsOption02({ deviceName, serialNumber }: ManageProjectsOption02Props) {
  const subtitle = `${deviceName} · ${serialNumber} · Option 02`;

  return (
    <ModusWcModal aria-label="Manage projects option 02" modalId={MANAGE_PROJECTS_OPTION_02_MODAL_ID}>
      <div slot="header" className="manage-projects-header">
        <ModusWcTypography hierarchy="h2" label="Manage projects" size="md" weight="semibold">
          Manage projects
        </ModusWcTypography>
        <ModusWcTypography customClass="app-muted" hierarchy="p" label={subtitle} size="sm">
          {subtitle}
        </ModusWcTypography>
      </div>
      <div slot="content" className="prototype-option-placeholder">
        <ModusWcTypography
          hierarchy="p"
          label="Option 02 is reserved for the next manage-projects design."
          size="sm"
        >
          Option 02 is reserved for the next manage-projects design.
        </ModusWcTypography>
        <ModusWcTypography
          customClass="app-muted"
          hierarchy="p"
          label="Switch to Option 01 in Prototype settings to use the current assign and remove dialog."
          size="sm"
        >
          Switch to Option 01 in Prototype settings to use the current assign and remove dialog.
        </ModusWcTypography>
      </div>
      <div slot="footer" className="device-modal-actions">
        <ModusWcButton
          color="tertiary"
          size="sm"
          variant="outlined"
          onButtonClick={() => closeModusDialog(MANAGE_PROJECTS_OPTION_02_MODAL_ID)}
        >
          Close
        </ModusWcButton>
      </div>
    </ModusWcModal>
  );
}
