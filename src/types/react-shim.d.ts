declare module 'react' {
  const React: any;
  export default React;
  export const useState: any;
  export const useEffect: any;
  export type FC<P = {}> = any;
  export type ReactNode = any;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}
