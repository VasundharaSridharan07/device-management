import {
  ModusWcThemeProvider,
  setAssetPath,
} from '@trimble-oss/moduswebcomponents-react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './index.css';

setAssetPath(`${window.location.origin}${import.meta.env.BASE_URL}`);

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element #root was not found');
}

createRoot(root).render(
  <ModusWcThemeProvider initialTheme={{ theme: 'modus-modern' }}>
    <App />
  </ModusWcThemeProvider>,
);
