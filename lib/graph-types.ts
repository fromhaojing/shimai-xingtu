export type DemoGroup = 'qing' | 'lixue';
export type DemoRelationType = 'succession' | 'parent' | 'adoptive' | 'sibling' | 'uncle' | 'grandparent' | 'cousin' | 'teacher' | 'influence' | 'response';

export interface DemoNode {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  description: string;
  portrait: string | null;
  group: DemoGroup;
  stageLabel: string;
  order: number;
  position: [number, number, number];
}

export interface DemoEdge {
  from: string;
  to: string;
  type: DemoRelationType;
  label: string;
  evidencePath: string;
  note?: string;
}

export interface DemoGraph {
  nodes: DemoNode[];
  edges: DemoEdge[];
}
