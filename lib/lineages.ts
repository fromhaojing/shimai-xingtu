import { readFileSync } from 'node:fs';
import path from 'node:path';

export type LineageEdgeType = 'succession' | 'parent' | 'adoptive' | 'sibling' | 'grandparent' | 'cousin' | 'uncle' | 'teacher' | 'influence' | 'response';
export interface LineageStage { id: string; label: string; nodes: string[]; }
export interface LineageEdge { from: string; to: string; type: LineageEdgeType; label: string; evidencePath: string; note?: string; }
export interface LineageGroup { id: string; label: string; description: string; stages: LineageStage[]; edges: LineageEdge[]; }
export interface LineageCollection { dynasties: LineageGroup[]; schools: LineageGroup[]; }

export const lineages = JSON.parse(readFileSync(path.join(process.cwd(), 'public', 'lineages.json'), 'utf8')) as LineageCollection;
