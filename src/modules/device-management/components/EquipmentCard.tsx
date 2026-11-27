import { ModusWcCard, ModusWcTypography } from '@trimble-oss/moduswebcomponents-react';

import type { Asset } from '../../../data/assets';
import { AssetProjects } from './AssetProjects';
import { DetailFields, type DetailField } from './DetailFields';

type EquipmentCardProps = {
  asset: Asset;
  fields: DetailField[];
};

export function EquipmentCard({ asset, fields }: EquipmentCardProps) {
  return (
    <ModusWcCard bordered padding="compact">
      <div slot="title" className="mb-4 flex w-full min-w-0 items-center justify-start gap-2">
        <ModusWcTypography hierarchy="h2" label="Equipment" size="lg" weight="semibold" />
      </div>
      <div>
        <DetailFields fields={fields} />
        <AssetProjects key={asset.id} asset={asset} />
      </div>
    </ModusWcCard>
  );
}
