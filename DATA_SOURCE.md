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

## 本地勘误

以下是对固定上游版本的有依据修订。最初导入的上游原件仍可从本仓库首次提交的 Git 历史追溯；当前文件与上游固定提交因此不再逐字相同。原项目的其余数据也不应被视作已获逐条史实核准。

| 本地文件 | 原问题 | 更正 | 依据（URL） |
| --- | --- | --- | --- |
| `public/data/qing/map-events.json` | “三藩”摘要把响应者写为尚可喜。 | 改为尚之信，并写明吴三桂起兵后耿精忠、尚之信相继响应。 | <https://www.dpm.org.cn/court/event/160317.html> |
| `public/data/qing/map-events.json`、`public/data/qing/events.json` | 武昌地图点用 1912 年“宣统退位”的 ID，时间、地点与所指事件不符。 | 地图点和新增事件统一为 1911-10-10“武昌起义”（`qing-ev-1911-wuchang`）；原 `qing-ev-1912` 保留为 1912-02-12“宣统退位”。 | <https://www.dpm.org.cn/court/lineage/226255.html> |
| `public/data/qing/emperors/wenzong.json` | 简介误称太平天国把咸丰帝“赶出北京”，且模糊出逃时序。 | 改为英法联军逼近北京时出逃热河，次年在避暑山庄病逝。 | <https://www.dpm.org.cn/court/lineage/226247.html> |
| `public/data/qing/emperors/taiZong.json` | “改国号为清”却仍称其为最后一任大汗，遗漏 1636 年称帝。 | 写明先继汗位，1636 年称帝并改国号为大清。 | <https://www.dpm.org.cn/court/event/159873.html> |
| `public/data/qing/emperors/shizu.json` | 以“出家之谜”作事实化标题，正文暗示因董鄂妃逝世而出家。 | 写明 1661 年染天花去世，出家属于后世传说。 | <https://www.dpm.org.cn/court/lineage/226262.html> |
| `public/data/qing/emperors/xuanzong.json` | 写作道光帝本人“签了《南京条约》”。 | 改为其在位期间清政府代表与英国签约。 | <https://www.dpm.org.cn/court/lineage/226239.html> |
| `public/data/qing/emperors/muzong.json` | “傀儡皇帝”“在位十三年基本是母亲垂帘”遮蔽成年后亲政。 | 写明幼年两宫太后垂帘、1873 年开始亲政且未及两年病逝。 | <https://www.dpm.org.cn/court/lineage/226248.html>、<https://www.dpm.org.cn/court/event/157160.html> |
| `public/data/lixue/books/taitushuo.json` | 称“二程都自认”周敦颐继承者、张载听其讲《易》、朱熹亲自使其从祀孔庙。 | 改为二程少年短暂受教、朱熹推重并注解周敦颐著作；周敦颐 1241 年从祀，在朱熹去世之后。 | <https://iep.utm.edu/zhou-dun/>、<https://plato.stanford.edu/entries/zhu-xi/> |
| `public/lineages.json` | 将缺乏独立证据的周敦颐→张载画为影响关系，二程受教边暗示直接道统传授，早期后金列在“清”组。 | 删除周→张边，注明二程少年短暂受教与道统解释的区别，组名改为“后金—清”。 | <https://iep.utm.edu/zhou-dun/>、<https://iep.utm.edu/zhang-zai-chang-tsai/>、<https://www.dpm.org.cn/court/event/159873.html> |
| `public/data/wudai/events.json` | 938 年“燕云十六州割让”地图点引用的 `wudai-ev-yanyun-ge` 在事件库中缺失，原有 936 年事件对应石敬瑭求援建后晋。 | 增补独立的 938 年正式割让事件，使地图 ID 唯一对应且区分前期许割与后期交割。 | <https://www.dpm.org.cn/Uploads/File/2023/07/19/u64b7500e18409.pdf> |
| `public/data/gewu/books/`（15 个文件） | 52 条 `golden.explain` 的解读与同条引文不符；《黄帝内经》卷数自相矛盾，另混入《后汉书》引文。 | 逐条改成与所列原文相符的简释，移除跨书引文；《素问》《灵枢》各 9 卷、全书 18 卷。 | 逐条对照本仓库引文与释义；卷数参见 <https://wjw.fujian.gov.cn/jggk/csxx/zyyglcszyyglj/gzdt/202306/P020230612429554460643.pdf> |
| `public/data/shiwen/books/caoxueqin.json` | 将有争议的父系和生年写成定论，且把第一回自题诗误标为第五回《枉凝眉》。 | 对身世与年龄保留考证分歧，按《红楼梦》第一回校正诗句的回目和解读。 | <https://study.bjwomen.gov.cn/thought/knowledge/2022/01/19/1991.shtml>、<https://zh.wikisource.org/zh-hans/%E7%B4%85%E6%A8%93%E5%A4%A2/%E7%AC%AC001%E5%9B%9E> |
| `public/data/rujia/`、`daojia/`、`foxue/`、`zhuzi/`、`shiwen/` 的 10 个书籍文件 | 少量引文出处、诗作场景和写作时间被误记或写为定论。 | 更正《春秋繁露》《法华经》《史记》相关引文来源，校正杜甫、王勃、陆游、苏轼等条目的背景，给《短歌行》时间争议留出余地。 | <https://ftp3.budaedu.org/ghosa3/C038/T043U/ref/T043U_064.pdf>、<https://ctext.org/shiji/zhang-yi-lie-zhuan>、<https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/chi-edu/recommended-passages/KS3_09.pdf> |
| `public/data/myth/books/jinghua.json` | 一条 `golden` 引文是明显损坏的 `Til til til` 文本。 | 删除损坏项，保留其余条目。 | <https://github.com/fromhaojing/shimai-xingtu/blob/2647da6/public/data/myth/books/jinghua.json> |

## 本轮校验范围

程序校验覆盖全部 228 个原始 JSON / GeoJSON 的解析、141 个地图点的事件关联、77 位帝王与 27 条思想记录的族谱引用，并重建目录及 3D 图谱。人工重点核对首页 152 条主记录摘要、格物类 17 本书的 68 条引文释义，以及 3D 样机的 18 个节点和关系。其余引文真伪与细部史事仍需后续逐条核实。
