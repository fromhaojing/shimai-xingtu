'use client';

import { useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { CanvasTexture, DoubleSide, QuadraticBezierCurve3, SRGBColorSpace, Vector3 } from 'three';
import type { DemoEdge, DemoGraph, DemoGroup, DemoNode, DemoRelationType } from '../lib/graph-types';
import styles from './graph-scene.module.css';

interface GraphSceneProps {
  graph: DemoGraph;
  selectedId: string | null;
  activeGroup: DemoGroup | 'all';
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  onSelectEdge?: (edge: DemoEdge) => void;
  reducedMotion?: boolean;
}

const nodeColors: Record<DemoGroup, { body: string; bright: string; halo: string }> = {
  qing: { body: '#c68c62', bright: '#f0c694', halo: '#c36c53' },
  lixue: { body: '#69a99c', bright: '#b1ead8', halo: '#5fbbaa' },
};

const edgeColors: Record<DemoRelationType, string> = {
  succession: '#d36f5c',
  parent: '#d8af72',
  adoptive: '#e3c28f',
  sibling: '#d8af72',
  uncle: '#c49a68',
  grandparent: '#c49a68',
  cousin: '#c49a68',
  teacher: '#8fdbc1',
  influence: '#65bea9',
  response: '#aa9ad6',
};

function createLabelTexture(title: string, subtitle: string, kind: 'node' | 'cluster', group: DemoGroup, active: boolean): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = kind === 'cluster' ? 228 : 176;
  const context = canvas.getContext('2d');
  if (!context) return new CanvasTexture(canvas);

  const width = canvas.width;
  const height = canvas.height;
  const accent = group === 'qing' ? '#e4b27b' : '#9bd6c4';
  context.clearRect(0, 0, width, height);
  context.shadowColor = '#02090ec9';
  context.shadowBlur = kind === 'cluster' ? 34 : 22;
  context.shadowOffsetY = 7;
  context.fillStyle = kind === 'cluster' ? '#0a2029e6' : active ? '#173136f2' : '#0b2229e0';
  context.fillRect(12, 12, width - 24, height - 24);
  context.shadowColor = 'transparent';
  context.lineWidth = active ? 4 : 2;
  context.strokeStyle = active ? accent : group === 'qing' ? '#ad89638c' : '#78a99b86';
  context.strokeRect(13, 13, width - 26, height - 26);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  if (kind === 'cluster') {
    context.fillStyle = group === 'qing' ? '#cbb69b' : '#a6c5ba';
    context.font = '700 29px "Microsoft YaHei", "Noto Sans SC", sans-serif';
    context.fillText(subtitle, width / 2, 70, width - 66);
    context.fillStyle = '#f1e4cb';
    context.font = '650 78px "Microsoft YaHei", "Noto Serif SC", serif';
    context.fillText(title, width / 2, 151, width - 70);
  } else {
    context.fillStyle = active ? '#fff1d5' : '#e9e4d5';
    context.font = '650 68px "Microsoft YaHei", "Noto Serif SC", serif';
    context.fillText(title, width / 2, active ? 74 : 89, width - 58);
    if (active && subtitle) {
      context.fillStyle = '#b9ccc2';
      context.font = '36px "Microsoft YaHei", "Noto Sans SC", sans-serif';
      context.fillText(subtitle, width / 2, 132, width - 70);
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function LabelSprite({ title, subtitle, kind, group, active = false, faded = false, position }: {
  title: string;
  subtitle: string;
  kind: 'node' | 'cluster';
  group: DemoGroup;
  active?: boolean;
  faded?: boolean;
  position: [number, number, number];
}) {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  useEffect(() => {
    const next = createLabelTexture(title, subtitle, kind, group, active);
    setTexture(next);
    return () => { next.dispose(); };
  }, [title, subtitle, kind, group, active]);
  if (!texture) return null;

  const scale: [number, number, number] = kind === 'cluster' ? [3.2, 0.96, 1] : active ? [1.7, 0.39, 1] : [1.48, 0.34, 1];
  return <sprite position={position} scale={scale} renderOrder={20}>
    <spriteMaterial map={texture} transparent opacity={faded ? 0.25 : 1} depthWrite={false} depthTest={false} />
  </sprite>;
}

function averagePosition(nodes: DemoNode[], group: DemoGroup): Vector3 {
  const matching = nodes.filter(node => node.group === group);
  if (!matching.length) return new Vector3();
  const total = matching.reduce((sum, node) => sum.add(new Vector3(...node.position)), new Vector3());
  return total.multiplyScalar(1 / matching.length);
}

function ViewRig({ nodes, selectedId, activeGroup, reducedMotion }: {
  nodes: DemoNode[];
  selectedId: string | null;
  activeGroup: DemoGroup | 'all';
  reducedMotion: boolean;
}) {
  const { camera, invalidate, size } = useThree();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  const destinationRef = useRef<{ eye: Vector3; target: Vector3 } | null>(null);

  useEffect(() => {
    const selected = nodes.find(node => node.id === selectedId);
    const isNarrow = size.width < 720;
    let target: Vector3;
    let offset: Vector3;

    if (selected) {
      target = new Vector3(...selected.position);
      offset = isNarrow ? new Vector3(1.9, 1.8, 8.4) : new Vector3(3.1, 2.1, 7.6);
    } else if (activeGroup !== 'all') {
      target = averagePosition(nodes, activeGroup);
      offset = isNarrow ? new Vector3(0.5, 2.4, activeGroup === 'qing' ? 24 : 19) : new Vector3(1.8, 2.8, 13.8);
    } else {
      target = new Vector3(0, 0, 0);
      offset = isNarrow ? new Vector3(0, 3.8, 52) : new Vector3(0, 3.3, 26);
    }

    const eye = target.clone().add(offset);
    if (reducedMotion && controlsRef.current) {
      controlsRef.current.target.copy(target);
      camera.position.copy(eye);
      controlsRef.current.update();
      destinationRef.current = null;
    } else {
      destinationRef.current = { eye, target };
    }
    invalidate();
  }, [activeGroup, camera, invalidate, nodes, reducedMotion, selectedId, size.width]);

  useFrame((state, delta) => {
    const destination = destinationRef.current;
    const controls = controlsRef.current;
    if (!destination || !controls) return;
    const step = 1 - Math.exp(-Math.min(delta, 0.1) * 3.3);
    state.camera.position.lerp(destination.eye, step);
    controls.target.lerp(destination.target, step);
    controls.update();
    if (state.camera.position.distanceToSquared(destination.eye) < 0.0025 && controls.target.distanceToSquared(destination.target) < 0.0025) {
      state.camera.position.copy(destination.eye);
      controls.target.copy(destination.target);
      controls.update();
      destinationRef.current = null;
    } else {
      state.invalidate();
    }
  });

  return <OrbitControls
    ref={controlsRef}
    makeDefault
    enableDamping={!reducedMotion}
    dampingFactor={0.08}
    minDistance={3.6}
    maxDistance={60}
    minPolarAngle={0.25}
    maxPolarAngle={Math.PI - 0.25}
    onStart={() => { destinationRef.current = null; }}
  />;
}

function ClusterHalo({ group, center, faded }: { group: DemoGroup; center: Vector3; faded: boolean }) {
  const color = nodeColors[group].halo;
  return <group position={[center.x, center.y - 2.3, center.z]}>
    {[2.45, 3.05, 3.65].map((radius, index) => <mesh key={radius} rotation={[-Math.PI / 2.8, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.014, 96]} />
      <meshBasicMaterial color={color} transparent opacity={faded ? 0.035 : 0.11 - index * 0.018} depthWrite={false} side={DoubleSide} />
    </mesh>)}
    <mesh rotation={[-Math.PI / 2.8, 0, 0]}>
      <circleGeometry args={[2.45, 96]} />
      <meshBasicMaterial color={color} transparent opacity={faded ? 0.009 : 0.026} depthWrite={false} side={DoubleSide} />
    </mesh>
  </group>;
}

function NodeMarker({ node, selected, related, faded, labeled, hovered, onSelect, onHover }: {
  node: DemoNode;
  selected: boolean;
  related: boolean;
  faded: boolean;
  labeled: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}) {
  const palette = nodeColors[node.group];
  const active = selected || hovered;
  const radius = node.group === 'qing' ? 0.27 : 0.31;
  const opacity = faded ? 0.27 : 1;

  return <group position={node.position}>
    <mesh scale={active ? 1.85 : related ? 1.6 : 1.35}>
      <sphereGeometry args={[radius, 20, 16]} />
      <meshBasicMaterial color={palette.halo} transparent opacity={faded ? 0.025 : active ? 0.14 : 0.065} depthWrite={false} />
    </mesh>
    <mesh rotation={[0.35, 0.3, 0]}>
      <torusGeometry args={[radius * (active ? 1.6 : 1.42), active ? 0.021 : 0.012, 8, 40]} />
      <meshBasicMaterial color={active ? palette.bright : palette.body} transparent opacity={faded ? 0.16 : active ? 0.84 : 0.45} />
    </mesh>
    <mesh
      onClick={event => { event.stopPropagation(); onSelect(node.id); }}
      onPointerOver={event => { event.stopPropagation(); document.body.style.cursor = 'pointer'; onHover?.(node.id); }}
      onPointerOut={() => { document.body.style.cursor = ''; onHover?.(null); }}
      scale={active ? 1.16 : 1}
    >
      <icosahedronGeometry args={[radius, 2]} />
      <meshStandardMaterial
        color={active ? palette.bright : palette.body}
        metalness={0.54}
        roughness={0.33}
        emissive={palette.halo}
        emissiveIntensity={faded ? 0.08 : active ? 0.43 : related ? 0.31 : 0.17}
        transparent
        opacity={opacity}
      />
    </mesh>
    <mesh scale={0.32}>
      <sphereGeometry args={[radius, 12, 10]} />
      <meshBasicMaterial color={palette.bright} transparent opacity={faded ? 0.2 : 0.82} />
    </mesh>
    {labeled && !faded && <LabelSprite
      title={node.title}
      subtitle={active ? node.subtitle || node.stageLabel : ''}
      kind="node"
      group={node.group}
      active={active}
      position={[0, radius + (active ? 0.7 : 0.57), 0]}
    />}
  </group>;
}

function relationPoints(edge: DemoEdge, nodeById: Map<string, DemoNode>, parallelIndex: number, parallelCount: number): Vector3[] {
  const start = new Vector3(...nodeById.get(edge.from)!.position);
  const end = new Vector3(...nodeById.get(edge.to)!.position);
  const direction = end.clone().sub(start);
  const perpendicular = new Vector3(-direction.y, direction.x, direction.z * 0.25);
  if (perpendicular.lengthSq() < 0.0001) perpendicular.set(0, 1, 0);
  perpendicular.normalize();
  const offset = (parallelIndex - (parallelCount - 1) / 2) * 0.28;
  const middle = start.clone().add(end).multiplyScalar(0.5).addScaledVector(perpendicular, offset);
  middle.z += 0.12;
  return new QuadraticBezierCurve3(start, middle, end).getPoints(20);
}

function EdgeStroke({ edge, points, faded, emphasized, onSelectEdge }: {
  edge: DemoEdge;
  points: Vector3[];
  faded: boolean;
  emphasized: boolean;
  onSelectEdge?: (edge: DemoEdge) => void;
}) {
  const dashed = edge.type === 'influence' || edge.type === 'response' || edge.type === 'adoptive';
  return <Line
    points={points}
    color={edgeColors[edge.type]}
    lineWidth={emphasized ? 2.5 : edge.type === 'succession' ? 1.6 : 1.25}
    transparent
    opacity={faded ? 0.09 : emphasized ? 0.95 : 0.46}
    dashed={dashed}
    dashSize={0.26}
    gapSize={0.17}
    onClick={event => { if (onSelectEdge) { event.stopPropagation(); onSelectEdge(edge); } }}
    onPointerOver={event => { if (onSelectEdge) { event.stopPropagation(); document.body.style.cursor = 'pointer'; } }}
    onPointerOut={() => { document.body.style.cursor = ''; }}
  />;
}

function Network({ graph, selectedId, activeGroup, hoveredId, onSelect, onHover, onSelectEdge }: GraphSceneProps & { hoveredId: string | null }) {
  const nodeById = useMemo(() => new Map(graph.nodes.map(node => [node.id, node])), [graph.nodes]);
  const relatedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedId) return ids;
    graph.edges.forEach(edge => {
      if (edge.from === selectedId) ids.add(edge.to);
      if (edge.to === selectedId) ids.add(edge.from);
    });
    return ids;
  }, [graph.edges, selectedId]);
  const anchorIds = useMemo(() => {
    const ids = new Set<string>();
    (['qing', 'lixue'] as const).forEach(group => {
      const ordered = graph.nodes.filter(node => node.group === group).sort((a, b) => a.order - b.order);
      [ordered[0], ordered[Math.floor(ordered.length / 2)], ordered[ordered.length - 1]].forEach(node => { if (node) ids.add(node.id); });
    });
    return ids;
  }, [graph.nodes]);
  const centers = useMemo(() => ({ qing: averagePosition(graph.nodes, 'qing'), lixue: averagePosition(graph.nodes, 'lixue') }), [graph.nodes]);
  const edgeGeometry = useMemo(() => {
    const counts = new Map<string, number>();
    const used = new Map<string, number>();
    graph.edges.forEach(edge => { const key = [edge.from, edge.to].sort().join('|'); counts.set(key, (counts.get(key) || 0) + 1); });
    return graph.edges.filter(edge => nodeById.has(edge.from) && nodeById.has(edge.to)).map(edge => {
      const key = [edge.from, edge.to].sort().join('|');
      const index = used.get(key) || 0;
      used.set(key, index + 1);
      return { edge, points: relationPoints(edge, nodeById, index, counts.get(key) || 1) };
    });
  }, [graph.edges, nodeById]);

  return <>
    <ambientLight intensity={0.72} />
    <pointLight position={[-7, 7, 8]} intensity={28} color="#83d5bd" distance={18} decay={2} />
    <pointLight position={[7, 5, 6]} intensity={27} color="#e1a06f" distance={18} decay={2} />
    <ClusterHalo group="lixue" center={centers.lixue} faded={activeGroup === 'qing'} />
    <ClusterHalo group="qing" center={centers.qing} faded={activeGroup === 'lixue'} />
    {(['lixue', 'qing'] as const).map(group => {
      const hidden = activeGroup !== 'all' && activeGroup !== group;
      const center = centers[group];
      return <LabelSprite
        key={group}
        title={group === 'qing' ? '后金—清世系' : '理学心学'}
        subtitle={group === 'qing' ? 'LATER JIN—QING / 1616—1912' : 'SCHOOL / 宋—明'}
        kind="cluster"
        group={group}
        faded={hidden}
        position={[center.x, center.y + 3.2, center.z]}
      />;
    })}
    {edgeGeometry.map(({ edge, points }, index) => {
      const source = nodeById.get(edge.from)!;
      const target = nodeById.get(edge.to)!;
      const outsideGroup = activeGroup !== 'all' && source.group !== activeGroup && target.group !== activeGroup;
      const emphasized = !!selectedId && (edge.from === selectedId || edge.to === selectedId);
      return <EdgeStroke
        key={edge.from + '-' + edge.to + '-' + edge.type + '-' + index}
        edge={edge}
        points={points}
        faded={outsideGroup || (!!selectedId && !emphasized)}
        emphasized={emphasized}
        onSelectEdge={onSelectEdge}
      />;
    })}
    {graph.nodes.map(node => {
      const selected = selectedId === node.id;
      const related = relatedIds.has(node.id);
      const outsideGroup = activeGroup !== 'all' && node.group !== activeGroup;
      const faded = outsideGroup || (!!selectedId && !selected && !related);
      return <NodeMarker
        key={node.id}
        node={node}
        selected={selected}
        related={related}
        faded={faded}
        labeled={selected || hoveredId === node.id || (activeGroup === 'all' ? anchorIds.has(node.id) : node.group === activeGroup && (anchorIds.has(node.id) || related))}
        hovered={hoveredId === node.id}
        onSelect={onSelect}
        onHover={onHover}
      />;
    })}
  </>;
}

export default function GraphScene({ graph, selectedId, activeGroup, onSelect, onHover, onSelectEdge, reducedMotion = false }: GraphSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const handleHover = (id: string | null) => { setHoveredId(id); onHover?.(id); };

  return <div className={styles.root} role="img" aria-label="后金—清世系和理学心学的三维关系图；可以通过搜索与条目目录选择节点">
    <div className={styles.atmosphere} aria-hidden="true" />
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 3.3, 26], fov: 46, near: 0.1, far: 120 }}
      dpr={[1, 1.65]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop="demand"
      fallback={<div className={styles.fallback}>此设备暂不能显示 3D 图谱。请使用搜索或条目目录浏览资料。</div>}
    >
      <ViewRig nodes={graph.nodes} selectedId={selectedId} activeGroup={activeGroup} reducedMotion={reducedMotion} />
      <Network graph={graph} selectedId={selectedId} activeGroup={activeGroup} hoveredId={hoveredId} onSelect={onSelect} onHover={handleHover} onSelectEdge={onSelectEdge} />
    </Canvas>
    <div className={styles.vignette} aria-hidden="true" />
  </div>;
}
