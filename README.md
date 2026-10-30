# 史脉星图

基于 [中华历史图谱](https://github.com/zinging/chinese-history-atlas) 数据重新设计的中国历史浏览网页。采用 Next.js App Router + TypeScript，构建为纯静态文件，可部署到 GitHub Pages。网页不需要 MCP 服务。

`/lineage/` 提供帝王与思想两种传承图谱，可按朝代或学派逐代浏览，并查看有来源依据的关系。相邻节点只是馆藏顺序；具体的父子、继位、受教、影响或回应由标注的关系边表示。

## 3D 历史关系星图样机

打开 `/graph/` 可体验后金—清世系（12 节点）与理学心学（6 节点）的 3D 关系图。29 条关系来自 `public/lineages.json`，每条均有原始数据出处。页面保留搜索、聚焦、关系检查与时间序列浏览；这是全站 3D 改造的第一版样机。

`node scripts/build-graph-demo.mjs` 会从馆藏目录和已核实关系重建 `public/graph-demo.json`。

## 本地开发

需要 Node.js 20.9 或更新版本。

```bash
npm ci
npm run dev
```

打开 <http://localhost:3000>。

## 构建

```bash
npm run typecheck
npm run build
```

`npm run build` 会把静态站点导出到 `out/`。GitHub Actions 工作流会在 `main` 分支推送后构建并部署。首次部署需要在仓库的 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

`next.config.ts` 在 Pages 构建（`GITHUB_PAGES=true`）时设置 `/shimai-xingtu` 为 `basePath`，并把同一值暴露为 `NEXT_PUBLIC_BASE_PATH`。本地开发时两者为空。访问 `public/` 中的 `catalog.json`、`data/` 和图片时，客户端路径需要加上 `NEXT_PUBLIC_BASE_PATH`。

## 数据与授权

- `public/catalog.json`：152 条主记录、76 条疑案的统一目录。
- `public/lineages.json`：帝王世系与思想传承的分代展示及带来源的关系边。
- `public/data/`：来自上游的正式 JSON/GeoJSON 数据和人物配图。
- `node scripts/build-catalog.mjs`：在编辑数据后重新生成目录。

数据来源、固定版本及历史图像说明见 [DATA_SOURCE.md](DATA_SOURCE.md)。原项目版权及 MIT 许可见 [THIRD_PARTY_LICENSE](THIRD_PARTY_LICENSE)。人物画像是 AI 生成示意图；疆域边界是手绘简化示意，不能当作精确行政地图。
