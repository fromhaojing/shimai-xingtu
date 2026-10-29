import type { Group } from './types';

export const groupInfo: Record<Group, { label: string; eyebrow: string; title: string; description: string }> = {
  all: { label: '总览', eyebrow: 'CURATED ARCHIVE / 馆藏总览', title: '让历史重新连起来', description: '在人物、思想、诗句、器物与故事之间，找到同一时代的不同侧面。' },
  emperor: { label: '帝王', eyebrow: 'POWER & TIME / 帝王谱系', title: '帝王与时代', description: '从隋到清，沿着七朝帝王的一生，理解转折如何发生。' },
  thought: { label: '思想', eyebrow: 'IDEAS & TEXTS / 思想源流', title: '思想与经典', description: '儒、道、佛、诸子与理学心学，让思想回到它出现的处境。' },
  poetry: { label: '诗词', eyebrow: 'WORDS & LIVES / 诗词鉴赏', title: '诗人与作品', description: '先认识写诗的人，再读懂他们留下的句子。' },
  craft: { label: '格物', eyebrow: 'MAKING & KNOWING / 格物致知', title: '器物与知识', description: '从工艺、农学到医药与算历，观察古人如何理解世界。' },
  myth: { label: '神话', eyebrow: 'MYTH & IMAGINATION / 神话异志', title: '神话与异志', description: '循着古代文本中的山川、异兽与故事，辨认想象的版图。' },
  case: { label: '史事', eyebrow: 'HISTORY IN QUESTION / 历史公案', title: '历史现场与疑问', description: '把背景、经过、结果与不同看法放在一起，自己读出判断。' },
};

export const groupOrder: Exclude<Group, 'all'>[] = ['emperor', 'thought', 'poetry', 'craft', 'myth', 'case'];

export const featuredSource: Partial<Record<Group, [Exclude<Group, 'all'>, string]>> = {
  all: ['poetry', 'dufu'],
  emperor: ['emperor', 'tang-emp-taizong'],
  thought: ['thought', 'lunyu'],
  poetry: ['poetry', 'dufu'],
  craft: ['craft', 'tiangongkaiwu'],
  myth: ['myth', 'shanhaijing'],
};
