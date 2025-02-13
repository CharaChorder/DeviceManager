export interface KeymapCategory {
  name: string;
  description: string;
  icon?: string;
  display?: string;
  type?: "unassigned";
  actions: Record<number, Partial<ActionInfo>>;
}

export interface ActionInfo {
  id: string;
  title: string;
  icon: string;
  display: string;
  description: string;
  variant: "left" | "right";
  variantOf: number;
  keyCode: string;
}
