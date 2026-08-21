declare module 'react' {
  export type ReactNode = any;
  export function useState<T>(initial: T | (() => T)):
    [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  export function useMemo<T>(fn: () => T, deps?: any[]): T;
  export const Fragment: any;
  const React: {
    createElement: any;
    Fragment: any;
  };
  export default React;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicAttributes {
    [key: string]: any;
  }
}
