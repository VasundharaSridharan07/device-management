import { ModusWcButton, ModusWcModal, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';

import { closeModusDialog } from './modusDialog';

export const DEVICE_PROJECT_SAVE_IMPACT =
  'Removing the device from a project removes the corresponding project data from the device.';

export const ASSET_PROJECT_SAVE_IMPACT =
  'Removing the asset from a project removes the corresponding project data from the asset and its devices.';

type ProjectSaveConfirmProps = {
  modalId: string;
  message: string;
  onSave: () => void;
};

export function ProjectSaveConfirm({ modalId, message, onSave }: ProjectSaveConfirmProps) {
  const closeConfirm = () => {
    closeModusDialog(modalId);
  };

  return (
    <ModusWcModal
      aria-label="Save project changes"
      backdrop="static"
      customClass="project-save-confirm"
      modalId={modalId}
    >
      <div slot="header">
        <ModusWcTypography hierarchy="h2" label="Save project changes" size="md" weight="semibold">
          Save project changes
        </ModusWcTypography>
      </div>
      <div slot="content">
        <ModusWcTypography hierarchy="p" label={message} size="md">
          <span>{message}</span>
        </ModusWcTypography>
      </div>
      <div slot="footer" className="device-modal-actions">
        <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closeConfirm}>
          Cancel
        </ModusWcButton>
        <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={onSave}>
          Save
        </ModusWcButton>
      </div>
    </ModusWcModal>
  );
}
