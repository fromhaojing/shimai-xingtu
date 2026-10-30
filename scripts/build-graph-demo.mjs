import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const catalogue = JSON.parse(fs.readFileSync(path.join(publicDir, 'catalog.json'), 'utf8'));
const lineages = JSON.parse(fs.readFileSync(path.join(publicDir, 'lineages.json'), 'utf8'));
const entryById = new Map(catalogue.records.map(entry => [entry.id, entry]));
const qing = lineages.dynasties.find(group => group.id === 'qing');
const lixue = lineages.schools.find(group => group.id === 'lixue');

if (!qing || !lixue) throw new Error('Required lineage groups are missing');

const qingPosition = index => [
  Number((1.35 + index * 0.68).toFixed(2)),
  Number((Math.sin(index * 0.77) * 1.64 + (index % 2 ? 0.18 : -0.18)).toFixed(2)),
  Number((Math.cos(index * 0.69) * 1.35).toFixed(2)),
];

const lixuePositions = [
  [-8.3, 0.4, 0.3],
  [-6.65, 2.0, -0.75],
  [-6.42, -0.75, 1.15],
  [-7.72, -2.35, -1.05],
  [-4.55, 0.38, 0.35],
  [-2.55, 0.96, -0.62],
];

const nodes = [];
for (const [group, kind] of [[qing, 'emperor'], [lixue, 'thought']]) {
  const staged = group.stages.flatMap(stage => stage.nodes.map(id => ({ id, stageLabel: stage.label })));
  if (staged.length !== (group.id === 'qing' ? 12 : 6)) {
    throw new Error('Unexpected node count for ' + group.id);
  }
  staged.forEach(({ id, stageLabel }, order) => {
    const entry = entryById.get(id);
    if (!entry || entry.group !== kind) throw new Error('Missing or mismatched entry: ' + id);
    if (entry.portrait) {
      const portrait = path.resolve(publicDir, entry.portrait);
      if (!portrait.startsWith(publicDir + path.sep) || !fs.existsSync(portrait)) {
        throw new Error('Missing portrait: ' + entry.portrait);
      }
    }
    nodes.push({
      id: entry.id,
      title: entry.title,
      subtitle: entry.subtitle,
      period: entry.period,
      description: entry.description,
      portrait: entry.portrait,
      group: group.id,
      stageLabel,
      order,
      position: group.id === 'qing' ? qingPosition(order) : lixuePositions[order],
    });
  });
}

const ids = new Set(nodes.map(node => node.id));
if (ids.size !== nodes.length) throw new Error('Duplicate graph node');
const edges = [...qing.edges, ...lixue.edges].map(edge => {
  if (!ids.has(edge.from) || !ids.has(edge.to)) throw new Error('Edge endpoint is outside the demo: ' + edge.from + ' -> ' + edge.to);
  const evidence = path.resolve(publicDir, edge.evidencePath);
  if (!evidence.startsWith(publicDir + path.sep) || !fs.existsSync(evidence)) {
    throw new Error('Missing edge evidence: ' + edge.evidencePath);
  }
  return {
    from: edge.from,
    to: edge.to,
    type: edge.type,
    label: edge.label,
    evidencePath: edge.evidencePath,
    ...(edge.note ? { note: edge.note } : {}),
  };
});

fs.writeFileSync(path.join(publicDir, 'graph-demo.json'), JSON.stringify({ nodes, edges }, null, 2) + '\n');
console.log('3D graph demo: ' + nodes.length + ' nodes, ' + edges.length + ' evidenced edges.');
