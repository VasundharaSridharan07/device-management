import { useEffect, useState } from 'react';

import { PUSH_LAYOUT_MIN_PX } from '../theme/shell';

export function useViewportWidth(): number {
  const [width, setWidth] = useState(() =>
    typeof window === 'undefined' ? PUSH_LAYOUT_MIN_PX : window.innerWidth,
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
