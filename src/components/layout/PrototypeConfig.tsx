import {
  ModusWcButton,
  ModusWcDivider,
  ModusWcIcon,
  ModusWcModal,
  ModusWcRadio,
  ModusWcTooltip,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import { useEffect, useState } from 'react';

import {
  MANAGE_PROJECTS_VARIANTS,
  PERSONAS,
  type ManageProjectsVariantId,
  type PersonaId,
} from '../../experiments/config';
import { useExperiment } from '../../experiments/ExperimentContext';
import { closeModusDialog, findModusDialog, showModusDialog } from '../devices/modusDialog';

const PROTOTYPE_CONFIG_MODAL_ID = 'prototype-config-modal';
const SETTINGS_TOOLTIP_ID = 'prototype-settings-tip';

function readChecked(event: CustomEvent<InputEvent>): boolean {
  const target = event.detail?.target;
  return target instanceof HTMLInputElement && target.checked;
}

export function PrototypeConfig() {
  const { config, setPersona, setManageProjects } = useExperiment();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dialog: HTMLDialogElement | null = null;
    let frame = 0;

    const handleClose = () => {
      setOpen(false);
    };

    const attach = () => {
      dialog = findModusDialog(PROTOTYPE_CONFIG_MODAL_ID);
      if (!dialog) {
        frame = requestAnimationFrame(attach);
        return;
      }

      dialog.addEventListener('close', handleClose);
    };

    attach();

    return () => {
      cancelAnimationFrame(frame);
      dialog?.removeEventListener('close', handleClose);
    };
  }, []);

  const openPanel = () => {
    setOpen(true);
    showModusDialog(PROTOTYPE_CONFIG_MODAL_ID);
  };

  const closePanel = () => {
    closeModusDialog(PROTOTYPE_CONFIG_MODAL_ID);
    setOpen(false);
  };

  const selectPersona = (persona: PersonaId) => (event: CustomEvent<InputEvent>) => {
    if (readChecked(event)) {
      setPersona(persona);
    }
  };

  const selectVariant = (variant: ManageProjectsVariantId) => (event: CustomEvent<InputEvent>) => {
    if (readChecked(event)) {
      setManageProjects(variant);
    }
  };

  return (
    <>
      <ModusWcTooltip
        content="Prototype settings"
        position="bottom"
        tooltipId={SETTINGS_TOOLTIP_ID}
      >
        <ModusWcButton
          aria-describedby={SETTINGS_TOOLTIP_ID}
          aria-label="Prototype settings"
          aria-pressed={open}
          color="tertiary"
          shape="square"
          size="md"
          variant="borderless"
          onButtonClick={openPanel}
        >
          <ModusWcIcon decorative name="settings" size="sm" />
        </ModusWcButton>
      </ModusWcTooltip>
      <ModusWcModal
        aria-label="Prototype settings"
        customClass="prototype-config-modal"
        modalId={PROTOTYPE_CONFIG_MODAL_ID}
      >
        <div slot="header" className="prototype-config-header">
          <ModusWcTypography
            hierarchy="h2"
            label="Prototype settings"
            size="md"
            weight="semibold"
          >
            Prototype settings
          </ModusWcTypography>
          <ModusWcTypography
            customClass="app-muted"
            hierarchy="p"
            label="Choices apply immediately and stay on this browser."
            size="sm"
          >
            Choices apply immediately and stay on this browser.
          </ModusWcTypography>
        </div>
        <div slot="content" className="prototype-config-body">
          <fieldset className="prototype-config-group">
            <legend>
              <ModusWcTypography hierarchy="h3" label="Persona" size="sm" weight="semibold">
                Persona
              </ModusWcTypography>
            </legend>
            {PERSONAS.map((persona) => (
              <div key={persona.id} className="prototype-config-choice">
                <ModusWcRadio
                  aria-label={persona.label}
                  inputId={`prototype-persona-${persona.id}`}
                  label={persona.label}
                  name="prototype-persona"
                  size="sm"
                  value={config.persona === persona.id}
                  onInputChange={selectPersona(persona.id)}
                />
                <ModusWcTypography
                  customClass="app-muted prototype-config-hint"
                  hierarchy="p"
                  label={persona.description}
                  size="sm"
                >
                  <span>{persona.description}</span>
                </ModusWcTypography>
              </div>
            ))}
          </fieldset>
          <ModusWcDivider />
          <fieldset className="prototype-config-group">
            <legend>
              <ModusWcTypography
                hierarchy="h3"
                label="A/B testing"
                size="sm"
                weight="semibold"
              >
                A/B testing
              </ModusWcTypography>
            </legend>
            <ModusWcTypography
              customClass="app-muted"
              hierarchy="p"
              label="Manage projects"
              size="sm"
              weight="semibold"
            >
              Manage projects
            </ModusWcTypography>
            {MANAGE_PROJECTS_VARIANTS.map((variant) => (
              <div key={variant.id} className="prototype-config-choice">
                <ModusWcRadio
                  aria-label={variant.label}
                  inputId={`prototype-manage-projects-${variant.id}`}
                  label={variant.label}
                  name="prototype-manage-projects"
                  size="sm"
                  value={config.manageProjects === variant.id}
                  onInputChange={selectVariant(variant.id)}
                />
                <ModusWcTypography
                  customClass="app-muted prototype-config-hint"
                  hierarchy="p"
                  label={variant.description}
                  size="sm"
                >
                  <span>{variant.description}</span>
                </ModusWcTypography>
              </div>
            ))}
            <ModusWcTypography
              customClass="app-muted"
              hierarchy="p"
              label="Licensed Admin opens the selected variant from a device. Product User reviews membership only."
              size="sm"
            >
              Licensed Admin opens the selected variant from a device. Product User reviews
              membership only.
            </ModusWcTypography>
          </fieldset>
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closePanel}>
            Close
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </>
  );
}
