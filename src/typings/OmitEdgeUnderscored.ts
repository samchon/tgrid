export type OmitEdgeUnderscored<T extends object> = {
  [P in keyof T]: P extends `_${string}`
    ? never
    : P extends `${string}_`
      ? never
      : T[P];
};
