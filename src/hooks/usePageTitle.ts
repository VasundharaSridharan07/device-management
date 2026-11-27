import { useEffect } from 'react';

const APP_NAME = 'Device Management';

export function usePageTitle(page: string, appName = APP_NAME) {
  useEffect(() => {
    document.title = `${page} | ${appName}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [appName, page]);
}
