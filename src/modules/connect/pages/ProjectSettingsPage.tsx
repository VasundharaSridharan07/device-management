import { useParams } from 'react-router-dom';

import { ProductPlaceholder } from '../../../components/common/ProductPlaceholder';
import { PROJECT_RECORDS } from '../../../data/projects';

export function ConnectProjectSettingsPage() {
  const { projectId = '' } = useParams();
  const project = PROJECT_RECORDS.find((record) => record.id === projectId);

  if (!project) {
    return (
      <ProductPlaceholder
        appName="Trimble Connect"
        message="This project is not in the prototype."
        title="Project settings"
      />
    );
  }

  return (
    <ProductPlaceholder
      appName="Trimble Connect"
      message="Project settings will appear here."
      title={project.name}
    />
  );
}
