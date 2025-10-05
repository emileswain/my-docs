import { useEffect } from 'react';

export function useScrollPosition(
  currentFile: string | null,
  contentAreaRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (currentFile && contentAreaRef.current) {
      const savedScroll = localStorage.getItem('scrollPosition');
      if (savedScroll) {
        setTimeout(() => {
          if (contentAreaRef.current) {
            contentAreaRef.current.scrollTop = parseInt(savedScroll);
          }
        }, 150);
      }
    }
  }, [currentFile]);
}
