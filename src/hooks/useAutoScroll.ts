import { useEffect, useRef, useCallback } from 'react';

interface UseAutoScrollOptions {
  scrollElement?: HTMLElement | null;
  dependencies?: any[];
  threshold?: number;
  enabled?: boolean;
  behavior?: ScrollBehavior;
}

export const useAutoScroll = ({
  scrollElement,
  dependencies = [],
  threshold = 100,
  enabled = true,
  behavior = 'smooth'
}: UseAutoScrollOptions) => {
  const lastScrollTop = useRef<number>(0);
  const userScrolledUp = useRef<boolean>(false);

  const scrollToBottom = useCallback(() => {
    if (!scrollElement || !enabled) return;

    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior
    });
  }, [scrollElement, enabled, behavior]);

  const handleScroll = useCallback(() => {
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    // If user scrolled up significantly, mark as user-initiated scroll
    if (scrollTop < lastScrollTop.current - 5) {
      userScrolledUp.current = !isNearBottom;
    }

    // If user scrolled to near bottom, reset the flag
    if (isNearBottom) {
      userScrolledUp.current = false;
    }

    lastScrollTop.current = scrollTop;
  }, [scrollElement, threshold]);

  // Set up scroll listener
  useEffect(() => {
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollElement, handleScroll]);

  // Auto-scroll when dependencies change (new content)
  useEffect(() => {
    if (!enabled || userScrolledUp.current) return;

    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50); // Small delay to ensure DOM is updated

    return () => clearTimeout(timeoutId);
  }, [...dependencies, enabled]);

  return {
    scrollToBottom,
    userScrolledUp: userScrolledUp.current,
    isAtBottom: !userScrolledUp.current,
    isUserScrolling: userScrolledUp.current
  };
};