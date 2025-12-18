export interface CompiledLayout {
  name: string;
  size: [number, number];
  keys: CompiledLayoutKey[];
}

export interface CompiledLayoutKey {
  id: number;
  shape: "quarter-circle" | "square";
  cornerRadius: number;
  size: [number, number];
  pos: [number, number];
  rotate: number;
}

declare module "*.layout.yml" {
  const layout: CompiledLayout;
  export default layout;
}
