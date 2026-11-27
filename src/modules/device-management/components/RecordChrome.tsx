import { ModusWcButton, ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { backLabel, backLocation, detailsStateFrom } from '../../../data/detailsNavigation';
import { writeListSession } from '../../../data/listSession';
import { DM_DEVICES_PATH } from '../paths';

export function RecordBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = detailsStateFrom(location.state);
  const label = backLabel(state);

  return (
    <ModusWcButton
      aria-label={label}
      color="tertiary"
      size="sm"
      variant="outlined"
      onButtonClick={() => {
        if (location.key !== 'default') {
          navigate(-1);
          return;
        }

        const target = backLocation(state);
        if (target.pathname === DM_DEVICES_PATH && target.state?.entityView) {
          writeListSession({ entityView: target.state.entityView });
        }
        navigate(target.pathname, { state: target.state });
      }}
    >
      <span>Back</span>
    </ModusWcButton>
  );
}

export function RecordHeading({ title }: { title: string }) {
  return (
    <div className="record-heading">
      <RecordBackButton />
      <ModusWcTypography customClass="record-title" hierarchy="h1" label={title} size="2xl" />
    </div>
  );
}

export function MissingRecord({ title, message }: { title: string; message: string }) {
  return (
    <div className="record-page">
      <RecordHeading title={title} />
      <ModusWcCard bordered padding="compact">
        <ModusWcTypography customClass="app-muted" hierarchy="p" label={message} />
      </ModusWcCard>
    </div>
  );
}
