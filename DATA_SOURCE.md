# 数据来源与使用说明

本项目的历史知识数据和人物配图取自 [zinging/chinese-history-atlas](https://github.com/zinging/chinese-history-atlas)，固定于上游提交 [`0a514c9449acc5d71e638d3f0791c118b1496902`](https://github.com/zinging/chinese-history-atlas/commit/0a514c9449acc5d71e638d3f0791c118b1496902)。原项目版权为 **Copyright (c) 2026 chen_ye_code**，以 MIT 许可证发布；原版权与完整许可文本保存在 [THIRD_PARTY_LICENSE](THIRD_PARTY_LICENSE)。

## 本仓库收录的内容

- `public/data/`：228 个正式 JSON / GeoJSON 文件，保留上游目录结构。没有复制生成用的 `search-index.json` 和隐藏的索引备份。
- `public/data/portraits/`：315 张人物与条目配图，供目录卡片显示。没有复制大型器物、事件和神话舆图原图。
- `public/catalog.json`：由 `scripts/build-catalog.mjs` 从上游索引及详情生成的统一目录，包含 152 条主记录与 76 条疑案。需要重建时运行 `node scripts/build-catalog.mjs`。

网页的历史知识数据直接从本仓库的静态文件读取，不调用上游网站或 MCP 服务。

## 阅读提示

原项目说明：人物画像为 **AI 生成的示意图**，不是历史人物肖像。`data/boundaries/` 中的唐、元、明、清 GeoJSON 为**手绘简化疆域示意**，并非精确行政边界；地理范围与历史解释应结合各文件的 `meta` 字段和史料核对。神话内容属于原著叙事，不应与真实历史地理混同。

原项目的[边界数据说明](https://github.com/zinging/chinese-history-atlas/blob/0a514c9449acc5d71e638d3f0791c118b1496902/data/boundaries/README.md)及[主页说明](https://github.com/zinging/chinese-history-atlas/tree/0a514c9449acc5d71e638d3f0791c118b1496902)提供了更多背景。
