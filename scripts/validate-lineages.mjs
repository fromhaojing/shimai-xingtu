import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.join(process.cwd(), 'public');
const catalogue = JSON.parse(fs.readFileSync(path.join(publicDir, 'catalog.json'), 'utf8'));
const lineages = JSON.parse(fs.readFileSync(path.join(publicDir, 'lineages.json'), 'utf8'));
const entries = new Map(catalogue.records.map(entry => [entry.id, entry]));
const allowedTypes = new Set(['succession', 'parent', 'adoptive', 'sibling', 'grandparent', 'cousin', 'uncle', 'teacher', 'influence', 'response']);
const errors = [];
const seenGroupIds = new Set();
let edgeCount = 0;

for (const [collectionName, entryGroup] of [['dynasties', 'emperor'], ['schools', 'thought']]) {
  const groups = lineages[collectionName];
  if (!Array.isArray(groups) || groups.length === 0) {
    errors.push(`${collectionName}: missing groups`);
    continue;
  }
  const seenEntryIds = new Set();
  for (const group of groups) {
    if (!group.id || seenGroupIds.has(group.id)) errors.push(`duplicate or empty group id: ${group.id}`);
    seenGroupIds.add(group.id);
    if (!group.label || !group.description) errors.push(`${group.id}: missing label or description`);
    const stageIds = new Set();
    if (!Array.isArray(group.stages) || group.stages.length === 0) errors.push(`${group.id}: missing stages`);
    for (const stage of group.stages || []) {
      if (!stage.id || stageIds.has(stage.id)) errors.push(`${group.id}: duplicate or empty stage id ${stage.id}`);
      stageIds.add(stage.id);
      if (!stage.label || !Array.isArray(stage.nodes) || stage.nodes.length === 0) errors.push(`${group.id}/${stage.id}: missing label or nodes`);
      for (const id of stage.nodes || []) {
        const entry = entries.get(id);
        if (!entry || entry.group !== entryGroup) errors.push(`${group.id}/${stage.id}: invalid ${entryGroup} node ${id}`);
        if (seenEntryIds.has(id)) errors.push(`${collectionName}: duplicate node ${id}`);
        seenEntryIds.add(id);
      }
    }
    const edgeKeys = new Set();
    for (const edge of group.edges || []) {
      edgeCount += 1;
      if (!entries.has(edge.from) || !entries.has(edge.to)) errors.push(`${group.id}: unknown edge endpoint ${edge.from} → ${edge.to}`);
      if (!allowedTypes.has(edge.type)) errors.push(`${group.id}: unsupported relation ${edge.type}`);
      if (!edge.label || !edge.evidencePath) errors.push(`${group.id}: missing edge label or evidence: ${edge.from} → ${edge.to}`);
      const key = `${edge.from}/${edge.to}/${edge.type}`;
      if (edgeKeys.has(key)) errors.push(`${group.id}: duplicate edge ${key}`);
      edgeKeys.add(key);
      const evidence = path.resolve(publicDir, edge.evidencePath || '');
      if (!evidence.startsWith(publicDir + path.sep) || !fs.existsSync(evidence)) errors.push(`${group.id}: missing evidence file ${edge.evidencePath}`);
    }
  }
  const expected = catalogue.records.filter(entry => entry.group === entryGroup).map(entry => entry.id);
  for (const id of expected) if (!seenEntryIds.has(id)) errors.push(`${collectionName}: record not staged ${id}`);
  if (seenEntryIds.size !== expected.length) errors.push(`${collectionName}: expected ${expected.length} unique nodes, found ${seenEntryIds.size}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Lineages valid: ${catalogue.records.filter(entry => entry.group === 'emperor').length} emperors, ${catalogue.records.filter(entry => entry.group === 'thought').length} thought records, ${edgeCount} evidenced relations.`);
}
