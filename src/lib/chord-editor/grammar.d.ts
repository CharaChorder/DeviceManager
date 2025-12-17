declare module "*.grammar" {
  export const parser: import("@lezer/lr").LRParser;
}
