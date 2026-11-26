import { ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';

export type DetailField = {
  label: string;
  value: string;
};

export function DetailFields({ fields }: { fields: DetailField[] }) {
  return (
    <dl className="device-info-fields">
      {fields.map((field) => (
        <div key={field.label} className="device-info-row">
          <dt>
            <ModusWcTypography
              customClass="device-info-label"
              hierarchy="p"
              label={field.label}
              size="sm"
            />
          </dt>
          <dd>
            <ModusWcTypography
              customClass="device-info-value"
              hierarchy="p"
              label={field.value}
              size="sm"
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
