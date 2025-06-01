import { useEffect, useState } from "react";

export const BREAKPOINTS = {
  xs: 0, // X-Small: None <576px
  sm: 576, // Small: ≥576px
  md: 768, // Medium: ≥768px
  lg: 992, // Large: ≥992px
  xl: 1200, // Extra large: ≥1200px
  xxl: 1400, // Extra extra large: ≥1400px
};

export const getBreakpoint = () => {
  const width = window.innerWidth;
  for (const [key, value] of Object.entries(BREAKPOINTS)) {
    if (width >= value) {
      return key;
    }
  }
  return "xl";
};

export type BreakpointKey = keyof typeof BREAKPOINTS;

export function useDownBreakpoint(breakpointKey: BreakpointKey): boolean {
  const [isBelow, setIsBelow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < BREAKPOINTS[breakpointKey];
  });

  useEffect(() => {
    const handleResize = () => {
      setIsBelow(window.innerWidth < BREAKPOINTS[breakpointKey]);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpointKey]);

  return isBelow;
}
