import {
  ModusWcButton,
  ModusWcIcon,
  ModusWcMenu,
  ModusWcMenuItem,
  ModusWcModal,
  ModusWcTextInput,
  ModusWcTypography,
} from '@trimble-oss/moduswebcomponents-react';
import type { IInputFeedbackProp } from '@trimble-oss/moduswebcomponents';
import { useState } from 'react';

import {
  ALL_DEVICES_GROUP_ID,
  deviceCountLabel,
  groupNameError,
  memberCount,
  type DeviceGroup,
} from '../../data/devices';
import { closeModusDialog, showModusDialog } from './modusDialog';

const NEW_GROUP_MODAL_ID = 'new-group-modal';

type DeviceGroupsProps = {
  groups: DeviceGroup[];
  selectedGroupId: string;
  checkedCount: number;
  canCreate: boolean;
  onSelect: (groupId: string) => void;
  onCreate: (name: string) => void;
};

function memberHint(count: number): string {
  if (count === 0) {
    return 'No devices are selected. This group will be empty.';
  }

  if (count === 1) {
    return '1 selected device will be added.';
  }

  return `${count} selected devices will be added.`;
}

export function DeviceGroups({
  groups,
  selectedGroupId,
  checkedCount,
  canCreate,
  onSelect,
  onCreate,
}: DeviceGroupsProps) {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<IInputFeedbackProp | undefined>(undefined);

  const openModal = () => {
    setName('');
    setNameError(undefined);
    showModusDialog(NEW_GROUP_MODAL_ID);
  };

  const closeModal = () => {
    closeModusDialog(NEW_GROUP_MODAL_ID);
    setName('');
    setNameError(undefined);
  };

  const createGroup = () => {
    const error = groupNameError(groups, name);
    if (error === 'empty') {
      setNameError({ level: 'error', message: 'Enter a group name.' });
      return;
    }

    if (error === 'duplicate') {
      setNameError({ level: 'error', message: 'A group with this name already exists.' });
      return;
    }

    onCreate(name.trim());
    closeModal();
  };

  return (
    <aside aria-label="Device groups" className="devices-groups">
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <ModusWcTypography hierarchy="h2" label="Groups" size="sm" weight="semibold" />
        {canCreate ? (
          <ModusWcButton color="tertiary" size="sm" variant="borderless" onButtonClick={openModal}>
            New Group
          </ModusWcButton>
        ) : null}
      </div>
      <ModusWcMenu aria-label="All devices" selectionMode="single" size="sm">
        <ModusWcMenuItem
          label="All Devices"
          selected={selectedGroupId === ALL_DEVICES_GROUP_ID}
          size="sm"
          subLabel={deviceCountLabel(memberCount(groups, ALL_DEVICES_GROUP_ID))}
          value={ALL_DEVICES_GROUP_ID}
          onItemSelect={(event) => {
            if (event.detail?.value === ALL_DEVICES_GROUP_ID) {
              onSelect(ALL_DEVICES_GROUP_ID);
            }
          }}
        >
          <ModusWcIcon decorative name="people_group" size="sm" slot="start-icon" />
        </ModusWcMenuItem>
      </ModusWcMenu>
      <div className="devices-groups-label">
        <ModusWcTypography hierarchy="p" label="Custom Groups" size="sm" />
      </div>
      <ModusWcMenu aria-label="Custom groups" selectionMode="single" size="sm">
        {groups.map((group) => (
          <ModusWcMenuItem
            key={group.id}
            label={group.label}
            selected={selectedGroupId === group.id}
            size="sm"
            subLabel={deviceCountLabel(group.deviceIds.length)}
            value={group.id}
            onItemSelect={(event) => {
              if (event.detail?.value === group.id) {
                onSelect(group.id);
              }
            }}
          >
            <ModusWcIcon decorative name="people_group" size="sm" slot="start-icon" />
          </ModusWcMenuItem>
        ))}
      </ModusWcMenu>
      <ModusWcModal aria-label="New group" modalId={NEW_GROUP_MODAL_ID}>
        <div slot="header">
          <ModusWcTypography hierarchy="h2" label="New group" size="md" weight="semibold" />
        </div>
        <div slot="content">
          <ModusWcTypography
            customClass="app-muted device-modal-copy"
            hierarchy="p"
            label={memberHint(checkedCount)}
            size="sm"
          />
          <ModusWcTextInput
            customClass="device-name-field"
            feedback={nameError}
            label="Group name"
            value={name}
            onInputChange={(event) => {
              const target = event.detail?.target;
              setName(target instanceof HTMLInputElement ? target.value : '');
              setNameError(undefined);
            }}
          />
        </div>
        <div slot="footer" className="device-modal-actions">
          <ModusWcButton color="tertiary" size="sm" variant="outlined" onButtonClick={closeModal}>
            Cancel
          </ModusWcButton>
          <ModusWcButton color="primary" size="sm" variant="filled" onButtonClick={createGroup}>
            <ModusWcIcon decorative name="add" size="xs" />
            Create
          </ModusWcButton>
        </div>
      </ModusWcModal>
    </aside>
  );
}
