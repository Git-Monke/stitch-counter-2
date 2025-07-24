import { useState, useEffect } from 'react';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => 
    window.innerHeight === screen.height
  );

  useEffect(() => {
    const handleResize = () => {
      setIsFullscreen(window.innerHeight === screen.height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isFullscreen;
}