# Terminal Atlas — 系统设计与 Codex Demo 开发规格书

> **版本**：v0.2 · 2026-10-13  
> **状态**：可交付 Codex 开发的产品规格（PRD + UX + 技术方案 + 验收标准）  
> **语言**：中文为主，命令/参数保留英文原文  
> **产品定位**：Ambient Command Knowledge System / 环境式命令学习与检索系统  
> **第一阶段交付**：**可运行的 Web Demo**，包含完整 Handbook 与 Ambient Memory 悬浮卡片预览  
> **第二阶段方向**：Tauri 2 macOS 置顶悬浮窗、壁纸导出和桌面集成

---

## 0. 给 Codex 的一页摘要（务必先读）

打造 **Terminal Atlas**，一个以“经常看见 → 自然熟悉 → 随时查阅”为目标的命令行知识产品，而非要求用户专门抽时间上课的教程。

**两个顶层模式：**

1. **Handbook Mode（完整 Web 知识库）**：Obsidian 风格的三栏结构，但**首页以多卡片网格（Card Grid）为主要内容**。用户可用 `↑ ↓ ← →` 在卡片间移动，使用 `1 / 2 / 3 / 0` 一键标记；选中后显示详细语法、英文名称/名称来源、中文解释、参数拆解、组合参数（如 `ls -lah`）及示例。支持分类、标签、搜索、收藏、关联、Markdown 笔记和内容编辑。
2. **Ambient Memory Mode（环境记忆模式）**：一个在 Web 页面中可拖动、可调整尺寸的半透明悬浮知识卡片预览，自动轮换内容。支持**自定义任意正整数分钟（特别需要支持 28 分钟）**、每屏显示卡片数、主题、展示密度、轮换策略、收藏与固定卡片。未来在 Tauri 中变为系统级始终置顶小窗。

**第一版必要条件：**
- 真正可运行、可点击、可编辑、刷新后保留设置与学习标签；不是静态效果图。
- Web 全模式的默认视图是**多张卡片**，不是只能点列表看详情。
- 中英文解释直观、准确，能拆解 `ls` 与 `-l -a -h` 的含义。
- 引入 **tldr-pages** 作为**经授权复用的基础内容来源**，同时补充自主编写的中文名称来源、参数拆解、安全说明；保留来源与许可信息。
- 界面符合现代 macOS 风格：克制的玻璃材质、渐进模糊、精致排版、多套主题；可读性优先。
- **浏览器中的“悬浮卡片”只能悬浮在网页里**，不要声称能跨应用置顶；真正 macOS 置顶需后续 Tauri 封装。
- 在 Demo 中**绝不直接执行用户看到的 Shell 命令**；仅供学习、复制。

### 成功判据

用户能在 1 分钟内：搜索 `ls` → 看见 `List`/中文说明 → 点开参数 `-l/-a/-h` 的解释 → 用方向键切到下一张卡 → 按 `3` 标“总是忘记” → 切到 Ambient Mode，设置 `28` 分钟、每次 `3` 张 → 刷新页面发现上述设置和标签仍在。

---

## 1. 设计理念与目标用户

### 1.1 核心理念

**Learn by Seeing, Not by Studying. / 不强迫记忆，通过高频低干扰接触熟悉知识。**

用户有大量科研、编程、论文或日常事务，没有时间系统学习 Terminal。TA 希望桌面随时显示少数命令，瞟几眼就能认得；忘了又可以立刻查。

### 1.2 五条原则

1. **Glanceable：一眼即懂**。先显示“命令 + 中文用途 + 一句参数说明”，详细知识按需展开。
2. **Keyboard-first：键盘优先**。命令卡片像一个可导航的知识空间，而非鼠标点来点去。
3. **Progressive Disclosure：渐进展开**。快览→翻面→右侧详情→编辑和个人笔记。
4. **Ambient, not intrusive：可见但低干扰**。允许低对比度、透明度、暂停和关闭自动轮换。
5. **Content-first：内容与界面分离**。Markdown Handbook 是可持续维护的资产，Web 和 macOS App 共用内容模型。

### 1.3 非目标

- 首版不做完整课程平台、不要求签到或答题。
- 首版不接入 AI 生成任意危险命令，也不提供一键执行终端代码。
- 首版不实现真正的 macOS 系统壁纸引擎，不伪装浏览器预览为系统级窗口。
- 首版不建设账号系统、云同步或后台服务器。

---

## 2. 现有命令资料：可复用范围、版权与导入方案

### 2.1 推荐资源清单

| 来源 | 地址 | 用途 | 处理原则 |
|---|---|---|---|
| **tldr-pages** | https://github.com/tldr-pages/tldr | **首选基础语料**；短解释、命令示例、macOS/Linux 分类与部分中文翻译 | Markdown pages 按 **CC BY 4.0** 署名、标明修改、保留许可链接 |
| tldr 官方页面 | https://tldr.sh/ | 浏览与核对示例 | 可参考；正式导入优先固定 Git revision 的仓库内容 |
| explainshell | https://explainshell.com/ | **参数逐段解释**的交互设计灵感 | 不批量复制其数据库；数据库中的 man page 各有不同版权 |
| Linux `man` 与 macOS `man` | 本机终端 `man <command>` | 技术验证，尤其是平台差异 | 参考核实，不将全文照搬进产品 |
| cheat.sh / cheat.sheets | https://github.com/chubin/cheat.sheets | 第二阶段可评估的辅助内容来源 | 必须逐仓库、逐文件核实版本和许可；不要默认聚合内容全可复制 |

**重要许可事项：**

- `tldr-pages/tldr` 的 Markdown 命令页采用 **Creative Commons Attribution 4.0 International（CC BY 4.0）**。参见其 [CONTRIBUTING](https://github.com/tldr-pages/tldr/blob/main/CONTRIBUTING.md) 与 [AGENTS.md](https://github.com/tldr-pages/tldr/blob/main/AGENTS.md)。不可把 tldr 内容当作“无来源的自有原创”。
- tldr 的 `scripts/` 与页面内容许可不完全相同。我们的导入工具自行编写，命令内容按页面许可管理。
- `explainshell` 源码为 GPLv3，**其发布数据库又含大量不同许可的 man page 内容**；因此本项目只借鉴“逐参数高亮解释”的**交互理念**，不复制其数据库。参考 [explainshell README](https://github.com/idank/explainshell)。
- 对每条导入内容记录：来源名称、URL、原始路径、许可证、导入日期、固定 revision/commit，以及是否改写/翻译。
- 界面提供 `Sources & Credits`；仓库提供 `ATTRIBUTION.md` / `LICENSES/`。导出的 Handbook 文件如包含 tldr 改编内容，也应带上必要署名与许可说明。
- 非 tldr 来源不得直接抓取整站内容；先检查其许可与 API / 服务条款。

### 2.2 内容导入策略

**阶段 A：Demo 预置内容**

- 内置不少于 **60** 条真实命令条目（可由合规的 tldr 数据转换而来）；不得用“Command 1、Command 2”占位。
- 其中至少 **20 条精选命令有完整中文字段、英文名称/名称来源、常用 flag 解释、组合参数分解、真实示例和平台信息**。其余命令至少有中文简述、语法或示例、来源标识。
- 先优先 macOS & Linux 共通命令，再处理特定平台差异。
- 启动时读取内置快照，无网络也能使用；**不要在每次页面加载时请求 GitHub**。

**阶段 B：导入器（不阻碍第一轮交付）**

1. 编写 `scripts/import-tldr.ts`，通过下载官方仓库快照或读取已克隆的 tldr 仓库来导入。
2. 优先扫描 `pages/common/`、`pages/osx/`、`pages/linux/`；中文目录按仓库现有 `pages.<locale>/` 命名识别，例如 `pages.zh/`，不要假设所有条目都有中文版本。
3. 解析 Markdown 标题、描述、示例；保留平台差异与来源记录。
4. 用项目内的 `overrides` 或人工策展内容补充解释和安全标注。
5. 版本化导入结果以便回滚，避免上游改动覆盖用户个性化内容。
6. 下载失败时不阻断 App：继续使用随项目打包的内容。

**字段优先级**：用户自定义覆盖层 > 项目编辑精选层 > 上游 tldr 基础层。上游更新时不得直接抹掉用户修改。

### 2.3 名称全称的准确性要求

用户希望知道 `ls` 是什么英文意思。必须避免把所有命令都硬解释成缩写！

- `ls` 可标注名称来源 `list（列出）`，但字段类型应是**英文含义/名称来源**，不是强制“官方全称”。
- 对并非缩写的命令，使用 `meaning_en` 和可选的 `etymology_note`；不确定时显示“暂无可靠名称来源”，禁止杜撰。
- 参数组合也须精确：`ls -lah` 中的 `-lah` 是可组合的短选项 `-l -a -h`；不是一个名为 `-lah` 的独立参数。**不应假设所有命令的短选项均可自由拼接**。

---

## 3. 产品信息架构与模式

### 3.1 顶层导航（只有两个产品模式）

- **Handbook**：完整 Web 应用，有 **Cards Grid（默认）** 与 **Document Detail（详情）** 两种视图。
- **Ambient**：网页中的可拖动预览卡片窗口；未来迁移至 Tauri 的独立 macOS 置顶窗口。

通用入口：快速搜索、主题切换、设置、导入/导出个人数据、键盘快捷键说明。

推荐路由：`/handbook`、`/handbook/:commandId`（选中后详情）、`/ambient`、`/settings`。刷新后可恢复合理的导航状态。

### 3.2 Handbook 三栏布局

```text
┌────────────────────────────────────────────────────────────────────────────┐
│  ● ● ●   Terminal Atlas      [ Search 命令 / 用途  ⌘K ]     [Theme] [⚙]    │
├─────────────────┬────────────────────────────────────────┬─────────────────┤
│  LIBRARY        │  COMMAND CARDS                         │  INSPECTOR      │
│                 │                                        │                 │
│  ▾ File System  │  86 Commands · macOS + Linux            │  ls             │
│     ls          │                                        │  list           │
│     cd          │  ┌────────────┐ ┌────────────┐         │  列出目录       │
│     pwd         │  │▸ ls        │ │  cd        │         │                 │
│  ▾ Search       │  │  list      │ │  change... │         │  ls -lah        │
│  ▾ Shell        │  │  列出目录  │ │  切换目录  │         │  -l 详细列表    │
│  ▾ Git          │  │  -l -a -h  │ │  cd ..     │         │  -a 隐藏文件    │
│  ▾ Python       │  │  [1][2][3] │ │  [1][2][3] │         │  -h 易读大小    │
│                 │  └────────────┘ └────────────┘         │                 │
│  ★ Favorites    │  ┌────────────┐ ┌────────────┐         │  Examples       │
│  # 常用         │  │  grep      │ │  find      │         │  Related links  │
│  # 已熟练       │  └────────────┘ └────────────┘         │  My Notes       │
│  # 总是忘记     │                                        │  Edit command   │
├─────────────────┴────────────────────────────────────────┴─────────────────┤
│  ↑ ↓ ← → Navigate    1 常用    2 已熟练    3 总忘    Space 翻面    ? Help   │
└────────────────────────────────────────────────────────────────────────────┘
```

- 左栏：分类树、标签、过滤器、收藏、最近查看与“总忘记”。可折叠。
- 中栏：**多卡片网格**（响应式 2～4 列），明显的键盘选中状态；支持密度设置和收藏角标。
- 右栏：选中卡片的完整详情、参数、示例、关联命令、Markdown 笔记和编辑按钮；可收起。
- 小屏幕（Mac 13 寸窗口较窄）时右栏变抽屉，不可让中间卡片过度变窄。
- 不要将搜索后的结果变成只有表格的页面；仍优先卡片。

### 3.3 卡片的三个信息层级

**Compact（扫一眼）**：命令名 + 英文含义 + 中文一句话 + 状态标记。  
**Standard（默认）**：Compact + 一个示例 + 两三个关键参数。  
**Detailed（深入）**：多参数拆解、平台差异和安全提醒（可翻面或用右栏详情显示）。

示例卡片：

```text
┌──────────────────────────────────────┐
│  FILE SYSTEM                   ☆  ③  │
│                                      │
│  ls                                  │
│  list                                │
│  列出目录内容                        │
│                                      │
│  $ ls -lah                           │
│  -l  详细列表                        │
│  -a  包含隐藏项                      │
│  -h  人类易读文件大小                │
│                                      │
│  [1 常用] [2 熟练] [3 总忘]          │
└──────────────────────────────────────┘
```

**卡片内信息开关**：`showEnglishMeaning`、`showChineseMeaning`、`showFlags`、`showExample`、`showPlatform`、`showRisk`，全局可设，且详情始终可见。

---

## 4. 核心交互：方向键 + 数字键 Tag

### 4.1 键盘映射（MVP 必须实现）

| 按键 | 功能 | 规则 |
|---|---|---|
| `↑ / ↓ / ← / →` | 按屏幕网格空间位置切换选中卡片 | 焦点自动滚动进可视区，选中描边可见；一列布局中 `↑ ↓` 可切换 |
| `1` | 切换 **常用** 标签 | 独立布尔状态，可与 2 或 3 共存 |
| `2` | 标记 **已熟练** | 与“总是忘记”互斥；再次按下可取消 |
| `3` | 标记 **总是忘记** | 与“已熟练”互斥；再次按下可取消；增加 Ambient 复现权重 |
| `0` | 清除这张卡上的上述学习标记 | 不删除收藏或笔记 |
| `Enter` | 打开/聚焦右侧完整详情 | 不破坏当前网格选中状态 |
| `Space` | 翻转当前卡片：概览 ↔ 示例/参数 | 不在输入焦点时才拦截空格 |
| `F` | 切换收藏 | 快捷键辅助，按钮仍可点击 |
| `P` | 切换 Ambient 固定展示 | 固定命令优先占 Ambient 名额 |
| `C` | 复制当前选中的示例命令 | 必须明显反馈“Copied”，复制失败可提示 |
| `/` | 聚焦搜索输入框 | 焦点在正文卡片时可用 |
| `?` | 打开快捷键帮助 | 帮助面板支持 Escape 关闭 |
| `Esc` | 关闭帮助/详情弹层或清空交互焦点 | 不丢用户编辑内容 |

**重要冲突规则**：在 `input`、`textarea`、`select`、`contenteditable`、代码编辑器、原生对话框输入焦点内，数字键、空格、方向键均属于输入行为，**绝不触发快捷操作**。输入法组合输入（IME composition）期间也不触发快捷键。不要拦截系统快捷键如 `Cmd+C`、`Cmd+Tab`。

**可访问性**：卡片是可聚焦元素，采用 roving `tabIndex` 或语义合理的键盘网格模式；选中与焦点有明显且不同的视觉表达；屏幕阅读器可读标签结果（`aria-live`）。每个快捷操作都同时有可点击的按钮。

### 4.2 “常用 / 熟练 / 总忘”不应混为一个数字优先级

设计为两个维度：

```ts
type LearningStatus = 'new' | 'mastered' | 'often_forgotten';

type UserCommandState = {
  commandId: string;
  isFrequent: boolean;               // 1：常用，可与任何熟练度并存
  learningStatus: LearningStatus;     // 2 已熟练 / 3 总忘 / new 默认
  isFavorite: boolean;
  isPinned: boolean;
  timesShown: number;
  lastShownAt?: string;              // ISO timestamp
  notesMarkdown?: string;
  updatedAt: string;
};
```

例子：`grep` 可能是**常用 + 总是忘记**。如果用一个互斥的三值优先级，就无法表达这个常见情况。

**UI 的最简表达仍然是 `1 / 2 / 3` 三个一键标记。** 底层数据则按上面两个维度存储。可使用小型颜色/图标标签，但不依赖颜色单独传达语义。

### 4.3 建议增加的轻量交互

- **Filter by State**：一键只看“总是忘记”、只看“常用未熟练”。
- **Pin for Today**：将当前任务相关命令固定在 Ambient 区（如 `npm`、`which`、`type`、`echo $PATH`）。
- **Front / Back**：正面看命令用法，反面看参数拆解，支持反复“瞟见”。
- **Peek Mode**：默认只显示命令与例子，悬停/点击展开中文解释；这是可选设置，不是强制考试。
- **Recently Seen**：记录最近展示过的命令；避免短时间重复过度。
- **No Forced Quiz**：不弹出强制答题、签到或通知。

---

## 5. Ambient Memory Mode — 环境记忆系统

### 5.1 产品行为

第一版网页展示独立的可拖拽浮动面板（**仅在浏览器页面内部**），提供真实交互和倒计时；未来改为 Tauri 独立窗口。

建议卡片默认样式：玻璃材质、圆角 `20–24px`、轻柔阴影、等宽命令文本与清晰中文正文；高度自适应内容。允许窗口位置/宽度调整，并保存状态。

### 5.2 可配置项（Demo 必须有）

| 配置 | 默认值 | 要求 |
|---|---:|---|
| `rotationMinutes` | **28** | 自定义正整数 **1～1440** 分钟；快捷预设 5、15、28、30、60 |
| `cardsPerRotation` | 3 | 用户自定义 **1～8**；容器不足时滚动/折叠，不截断文本 |
| `rotationMode` | `weighted` | `sequential` 顺序、`random` 随机、`weighted` 学习权重 |
| `contentScope` | 全部基础命令 | 选择类别、标签、平台、收藏等过滤器 |
| `cardDensity` | `standard` | `compact` / `standard` / `detailed` |
| `pauseOnHover` | `true` | 鼠标悬停延迟换页；编辑或选中文本时也不突兀地换页 |
| `showProgress` | `true` | 显示距下次轮换的时间和“立即切换”按钮 |
| `theme` | `Cupertino Frost` | 可用预设主题或自定义颜色 |
| `opacity` | 0.92 | **可调**；不能降低到不可读且不提醒 |
| `showEnglish/Chinese/Flags/Example` | `true` | 控制卡片内容密度 |
| `autoStart` | `true` | 允许暂停/恢复；关闭 Web 页后无需后台运行 |

### 5.3 定时器的准确语义

- 用户输入 `28` 表示**经过 28 分钟才切换下一批**，而不是每天固定 28 分钟的某一时点。
- 修改间隔、展示数或过滤范围时立即保存，并明确从当前时刻重算下一次切换（可给“立即应用”反馈）。
- **不要只靠 `setInterval` 累积计数**。Web 后台标签页可能被限速，应该保存 `nextRotationAt`（真实时间戳），恢复时根据 `Date.now()` 判断是否到期。
- 浏览器从后台恢复时，若错过多个时段，最多切换**一次**，避免连环动画。
- 暂停/悬停/编辑时不替换卡片；恢复时按产品定义重启一个完整周期，避免立刻闪烁。
- 所有策略使用可测试的纯函数，测试中可注入时钟，不要依赖真实等待 28 分钟。

### 5.4 内容选择：简单、可理解、可测试

默认 `weighted` 模式：

```text
初始权重 = 1.0
“常用”            × 1.5
“总是忘记”        × 3.0
“已熟练”          × 0.25
最近一轮刚展示过   × 0.2  （仅用于防重复）
固定的卡片         优先占展示名额，不参与抽样
```

规则：
1. 根据用户过滤器得出有效命令池。
2. 先放置固定卡片（`isPinned`），再按所选策略填充剩余名额。
3. **同一批绝不重复同一条命令**。候选数不足时展示尽可能多的唯一命令，并提示可调整过滤条件。
4. 权重仅是启发式排期，**不要声称它能自动推断用户已经记住**。`已熟练` 由用户自己标记。
5. 在前一批已经出现过的条目之外优先抽取其他候选；候选不足才允许跨轮重复。
6. 如果固定条目多于 `cardsPerRotation`，在设置区明确提示并限制可见数量；不能静默溢出。
7. `sequential` 使用稳定顺序；`random` 在同一轮内不重复；`weighted` 用上述权重。
8. 保存 `timesShown`、`lastShownAt`；只统计**实际展示**，不把页面不可见的漏掉时段记成已学习。

**建议 UI 给予用户即时反馈**：按 `3` 后出现“已标记：总是忘记 · 将更频繁出现”，而非无解释地改变颜色。

### 5.5 页面与系统浮窗的边界

- **Web Demo**：一个可拖拽的内部悬浮面板，可以设置位置/大小/透明度/间隔；可以单独打开 `/ambient` 作为简洁预览页。
- **macOS Tauri 版本**：另建真正独立、可置顶、可移动的窗口，支持始终置顶、关闭按钮、菜单栏入口和设置同步。依赖 Tauri 2 的窗口能力及必要权限配置。
- **壁纸**：静态 PNG 导出可随后加入；动态/交互壁纸涉及 macOS 桌面宿主与窗口层级，不能通过网页 CSS 自动获得。**`alwaysOnBottom` 不等同于真正壁纸层**。

---

## 6. 完整 Handbook 的内容详情与编辑

### 6.1 详情页信息顺序

1. 名称：`ls`；**英文含义/名称来源**：`list`；中文：`列出目录内容`。
2. 适用平台：macOS / Linux；风险：只读/修改/高风险；分类、标签。
3. 基础语法：`ls [options] [directory]`。
4. 组合示例：`ls -lah`，每个参数旁可视化高亮与解释。
5. 常用 flags：`-l` 长列表、`-a` 全部含隐藏项、`-h` 与详细列表搭配使文件大小易读。
6. 示例 + 一键复制：如 `ls -lah ~/Projects`。
7. macOS 与 Linux 选项差异（仅在真实存在时显示）。
8. 相关命令：`pwd`、`cd`、`find`（可点击跳转并显示 backlink）。
9. 个人 Markdown 笔记、收藏、标记、固定展示。
10. 来源与署名，显示上游链接、版本与“已改写”说明。

### 6.2 编辑能力（第一版必须真实可用）

- 支持自定义命令条目的 **英文含义/名称来源、中文解释、参数说明、组合参数解释、示例、标签、关联命令、个人笔记**。
- 对上游导入条目，用户编辑应保存为本地**覆盖层（override）**，不要原地破坏可追溯的上游源内容。
- 可创建自定义命令，最少填命令名和中文用途，其余内容允许逐步补充。
- 支持撤销未保存编辑、保存成功提示；刷新后仍保留。
- 搜索必须能搜到用户自定义的中文解释/别名。
- 支持导出用户修改与学习状态为 JSON 备份，并支持导回；Markdown 导出可后续补齐，具体状态需要在 UI 标明。

### 6.3 双向链接与笔记

Markdown 中允许以 `[[ls]]` 或 `[[command:ls]]` 引用另一个命令；解析为内部命令链接，详情可展示“被哪些笔记引用”。如果首版实现困难，至少实现“related links”和可编辑个人笔记，不要伪造可点但无用的链接。

---

## 7. 推荐的内容数据模型

### 7.1 概念模型

**CommandEntry（官方/策展内容）** 与 **UserCommandState（个人状态）** 分离。理由：上游内容更新、用户改写、学习标签具有不同生命周期。

```ts
type Platform = 'macos' | 'linux' | 'common';
type SafetyLevel = 'read_only' | 'modifies_data' | 'high_risk';

type CommandFlag = {
  token: string;                // '-l', '--all' 等
  descriptionZh: string;
  descriptionEn?: string;
  notes?: string;
};

type CommandExample = {
  titleZh: string;
  commandLine: string;
  explanationZh: string;
  platforms: Platform[];
  safety: SafetyLevel;
};

type CommandEntry = {
  id: string;                   // 如 'ls'、'git-status'；稳定、不随标题变化
  command: string;              // 'ls'
  meaningEn?: string;           // 'list'，不是强制官方全称
  etymologyNote?: string;       // 名称来源备注，不确定则空
  titleZh: string;
  summaryZh: string;
  summaryEn?: string;
  syntax: string;
  category: string;
  tags: string[];
  searchAliasesZh?: string[];
  platforms: Platform[];
  safety: SafetyLevel;
  flags: CommandFlag[];
  combinations?: { expression: string; explanationZh: string; tokens: string[] }[];
  examples: CommandExample[];
  relatedCommandIds: string[];
  markdownBody?: string;
  source: {
    provider: string;          // 'tldr-pages' | 'original' | ...
    url?: string;
    upstreamPath?: string;
    revision?: string;
    license: string;
    modified: boolean;
  };
};
```

### 7.2 Markdown 实例（策展覆盖条目示意）

项目内每条精选命令可以采用 **Markdown + YAML Frontmatter**。以下示例仅为内容结构示范，并非直接复制 tldr 原文：

```markdown
---
id: ls
command: ls
meaningEn: list
titleZh: 列出目录内容
summaryZh: 显示指定目录中的文件和文件夹
syntax: 'ls [options] [directory]'
category: filesystem
tags: [beginner, navigation, files]
searchAliasesZh: [查看文件, 列出文件, 隐藏文件]
platforms: [macos, linux]
safety: read_only
flags:
  - token: '-l'
    descriptionZh: 使用长列表格式显示详细信息
  - token: '-a'
    descriptionZh: 显示包括点号开头的隐藏项
  - token: '-h'
    descriptionZh: 在适当的显示格式下使用易读的文件大小单位
combinations:
  - expression: 'ls -lah'
    explanationZh: 以长列表格式显示所有文件，并使用易读大小单位
    tokens: ['-l', '-a', '-h']
examples:
  - titleZh: 查看项目文件（含隐藏项）
    commandLine: 'ls -lah ~/Projects'
    explanationZh: 列出 Projects 目录下文件，包括隐藏项，并显示详细信息
    platforms: [macos, linux]
    safety: read_only
relatedCommandIds: [pwd, cd, find]
source:
  provider: original
  license: original-editorial
  modified: false
---

# ls

> `ls` 常用于浏览目录。`-lah` 组合由 `-l`、`-a` 与 `-h` 组成。

## Notes

`-h` 通常与显示文件大小的选项搭配使用。
```

> 实际生成时请删除样例正文中可能出现的无意控制字符，并确保 Markdown 可被正确解析。以上字段可依需求调整，但必须维持**结构化参数**与**用户覆盖层**。

**重要**：浏览器通常无法直接覆写代码仓库的 Markdown 文件。首版应将打包的 Markdown 当作**只读知识库源**，用户编辑保存在 IndexedDB，并提供导出/导入；Tauri 版再支持写入本机用户知识库。不要把“点击保存后项目源码 Markdown 已更新”作为 Web 版承诺。

---

## 8. 视觉设计系统：macOS inspired, glass, gradients, themes

### 8.1 设计目标

采用当前 macOS 风格的克制视觉语言。**优先确保可读性和层级**，不要让每一张正文卡片都变成极高透明度的玻璃。Apple 的材料设计建议让玻璃主要服务于**工具栏、导航和浮层**，正文内容使用更稳定的材质以提高可读性。

参考：[Apple Human Interface Guidelines — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)。

### 8.2 外观约束

- 大圆角、轻度阴影、柔和边框、内容区域高对比；适度使用渐进模糊（底部/边缘可以更模糊）。
- 不以“macOS 27 的某个具体私有 API”作为第一版依赖；Web 用 CSS 模拟该视觉风格即可。
- 内容文字：系统无衬线字体栈；命令代码使用适合的等宽字体栈（不打包/分发未授权字体文件）。
- 卡片 hover 动效轻量、持续时间约 150–250ms；支持 `prefers-reduced-motion`。
- 对低性能机器提供关闭透明/模糊特效开关；纯色后备样式完整可用。
- 在 `prefers-reduced-transparency` 支持条件下做降级，并提供应用内“提高对比度”选项。
- 不要仅用颜色区分“常用/熟练/总忘”：同时显示文字或图标。

### 8.3 预设主题（功能必须真实可切换）

| 主题 | 气质 | 用途 |
|---|---|---|
| **Cupertino Frost**（默认） | 淡雾、银白玻璃、蓝灰点缀 | macOS 日间桌面 |
| **Midnight Glass** | 深色烟熏玻璃、低刺激高对比 | 夜间工作 |
| **Graphite Pro** | 石墨灰、低饱和、专业开发者风格 | 长时间查看 |
| **Paper Notes** | 柔和纸色、笔记本感 | Handbook 阅读 |
| **Terminal Green** | 克制的暗色终端绿 | 复古终端风格 |

用 CSS variables / Design Tokens 实现：颜色、玻璃透明度、模糊半径、边框、阴影、间距、圆角与字体尺度；不要为每个主题复制一整套组件。

### 8.4 页面尺寸与卡片体验

- 先适配 Mac 上常见的宽屏/笔记本窗口尺寸；支持窗口缩小时自适应列数。
- Handbook 网格至少可见 4～8 张卡片（视屏幕而定），不用滚动才能看到第一张。
- Ambient 面板默认宽度约 360–440 CSS px，可以拖动/调整尺寸；展示多条命令时纵向排布或内部滚动。
- 选中卡片的 outline 必须强于 hover，以便用户只用键盘也知道当前位置。

---

## 9. 技术架构与数据持久化

### 9.1 推荐技术栈（Web-first）

- **Vite + React + TypeScript**：Web Demo 与后续 Tauri 共用 React 前端。
- **Tailwind CSS + CSS variables**：响应式布局和主题 Design Tokens。
- **Motion**（可选）：只用于轻量过渡动画；避免大型视觉依赖。
- **react-markdown + rehype-sanitize**：安全渲染 Markdown；不直接执行导入的 HTML / 脚本。
- **gray-matter + YAML parser**：在构建或导入时解析 Markdown frontmatter。
- **Fuse.js** 或轻量索引：中英文字段、命令名、中文别名、示例搜索。
- **IndexedDB**（如 `idb` 或 Dexie）：保存用户设置、笔记、标签、覆盖层和展示历史。
- **Vitest + React Testing Library**：快捷键、标签、筛选、排期和持久化测试。
- **Tauri 2**：第二阶段封装真实 macOS 桌面悬浮窗，不是首版 Web 开发的前提。

**避免过度工程化**：Web Demo 无需后端、登录、SQLite 服务器、云同步、复杂 monorepo。后续桌面环境可继续使用 IndexedDB 或专门的数据层迁移策略。

### 9.2 推荐目录结构

```text
TerminalAtlas/
├── AGENTS.md                     # Codex 项目规范
├── README.md                     # 本地启动与功能说明
├── docs/
│   ├── PRODUCT_SPEC.md           # 本文件（或其复制）
│   ├── DESIGN_TOKENS.md
│   └── ATTRIBUTION.md
├── handbook/
│   ├── curated/                   # 我们人工策展的 Markdown
│   └── imported-tldr/             # 经授权导入的固定快照
├── scripts/
│   └── import-tldr.ts             # 可后置，不阻挡 Demo
├── src/
│   ├── app/
│   ├── components/
│   │   ├── CommandCard.tsx
│   │   ├── CardGrid.tsx
│   │   ├── CommandInspector.tsx
│   │   ├── Sidebar.tsx
│   │   ├── AmbientWindow.tsx
│   │   ├── KeyboardHelp.tsx
│   │   └── ThemePicker.tsx
│   ├── features/
│   │   ├── handbook/
│   │   ├── ambient/
│   │   ├── command-editor/
│   │   └── search/
│   ├── content/
│   ├── model/
│   ├── persistence/
│   ├── themes/
│   └── styles/
├── src-tauri/                    # 第二阶段再创建，或仅保留文档
├── package.json
└── vite.config.ts
```

### 9.3 浏览器持久化和离线

- 内容快照打包到构建产物，首次打开后不依赖网络接口。
- 个人数据保存到 IndexedDB；主题/展示间隔/选中状态在刷新后仍保留。
- 使用**版本化数据 schema** 并提供轻量迁移方案；不要轻易丢用户笔记。
- 提供 **Export Personal Data** / **Import Personal Data** 备份。导入时校验结构与版本，损坏文件给出友好提示。
- 若增加 PWA Service Worker，应保证缓存更新机制可控；PWA 不是第一阶段必须项。

### 9.4 数据安全

- 命令仅展示和复制，**不自动执行**。
- `rm`、`sudo`、`chmod`、`chown`、`curl | sh`、Git 强制操作等高风险示例标识醒目风险；不推荐“复制并直接执行”危险模板。
- 导入 Markdown 渲染必须经过安全净化；外链使用安全属性。
- 不申请 macOS 辅助功能、完整磁盘访问、终端执行权限作为 Demo 启动条件。
- 用户笔记始终保存在本机，默认不上传。

---

## 10. 壁纸与桌面化扩展路线（不要阻挡 Demo）

### Phase 2A：静态壁纸导出

Wallpaper Studio 可选择主题、布局、命令池、数量、展示字段、屏幕尺寸（用户可自定义分辨率）。将卡片排版渲染为 **PNG**，支持预览和导出。壁纸不应阻挡桌面图标，可设安全边距与文字密度。

### Phase 2B：Tauri 原生悬浮窗

- 独立 Ambient 窗口：Always on Top、拖动、调整大小、透明度、关闭/收起、菜单栏入口。
- 窗口和主 Handbook 共用数据、主题、轮换设置；防止两个状态源互相覆盖。
- 若使用 Tauri 窗口 API，按当前 Tauri 2 版本声明必要权限；玻璃/透明度实现受系统和应用分发方式约束。
- 对 Tauri 的 **完全透明窗口**，注意部分实现涉及 macOS 私有 API，可能影响 Mac App Store 发布；优先考虑官方公开支持的窗口材质效果。

### Phase 2C：动态壁纸（探索）

评估 macOS 桌面背景宿主、资源占用、系统权限和兼容性。可选择“自动定时替换静态壁纸”作为低风险替代。**不要把网页悬浮面板误称为系统动态壁纸**。

参考官方窗口配置：https://v2.tauri.app/reference/config/

---

## 11. 迭代优先级与交付范围

### MVP — 本轮 Codex 必须完成（P0）

- [ ] Vite + React + TypeScript 工程可启动、可构建。
- [ ] Handbook 完整三栏框架；中间**默认多卡片网格**，支持分类与中英文搜索。
- [ ] 60 条以上真实命令种子数据；20 条以上内容充分的命令（中英说明、flags、组合参数、示例）。
- [ ] `↑ ↓ ← →` 卡片导航；`1/2/3/0` 标记；Enter 详情；Space 翻面；`?` 快捷键说明。
- [ ] 状态标签数据正确：常用可与熟练/总忘同时存在；熟练与总忘互斥。
- [ ] 收藏、固定、复制命令；点击/键盘两种方式都有效。
- [ ] 选中后右侧 Inspector 显示参数拆解、相关命令、来源和个人笔记。
- [ ] 命令自定义编辑：英文含义、中文解释、flags、组合参数、示例、标签，刷新后持久化。
- [ ] Ambient Mode 网页内的可拖动悬浮窗；频率默认 28 分钟，支持 1～1440 分钟、每次 1～8 张、随机/顺序/加权切换、立即切换、暂停、倒计时。
- [ ] 主题可切换（至少 Cupertino Frost、Midnight Glass、Graphite Pro、Paper Notes；第五个可附加）。
- [ ] local IndexedDB 持久化，首次打开不强制联网；Sources & Credits 可访问。
- [ ] 自适应布局、键盘可访问性、低动效/高对比选项。
- [ ] `npm run dev`、`npm run build`、`npm run test` 成功；README 写明运行方式。
- [ ] 代码中无无效假按钮、无需要但缺失的 API Key、无自动执行 Shell 的能力。

### Next — 可在 P0 完成后增加（P1）

- [ ] 可复用的 `import-tldr` CLI，支持固定 commit、中文转换、来源记录与失败回退。
- [ ] 文本笔记中的 `[[double links]]` 与 backlinks。
- [ ] 用户编辑的批量 JSON 导出/导入与 Markdown 导出。
- [ ] Wallpaper Studio 静态 PNG 导出与主题模板。
- [ ] 更多中文搜索同义词、历史与专注任务列表。

### Desktop — P2

- [ ] Tauri 2 macOS 构建；独立 Always-on-Top 小窗。
- [ ] 菜单栏、登录后启动（可选）、窗口位置恢复、全局快捷键（可自定义）。
- [ ] 壁纸自动更新与动态壁纸可行性评估。

---

## 12. Demo 验收测试（可交由 Codex 自动化）

**测试 1：网格键盘导航**

1. 打开 `/handbook`，默认可见多个卡片。
2. 按 `→` 选中相邻卡，按 `↓` 选中下一行卡。
3. Inspector 跟随变化；焦点状态始终可见。
4. 按 `Space` 卡片展示示例/参数；按 `Enter` 展开详情。

**测试 2：数字键标签**

1. 选中 `ls` → 按 `1` → 出现“常用”。
2. 按 `3` → 同时存在“常用 + 总是忘记”。
3. 按 `2` → “总忘”被“已熟练”取代，但“常用”保留。
4. 按 `0` → 学习标记清空，但收藏与笔记保留。
5. 刷新页面，标签状态应持久化。
6. 在编辑框中打字 `123` 不得误触发任何标签操作。

**测试 3：组合参数解释**

1. 搜索 `ls -lah` 或 `查看隐藏文件`。
2. 显示 `ls` 结果；详情解释 `-l`、`-a`、`-h` 各自含义，以及组合效果。
3. 对不存在的官方英文全称不应显示瞎编的缩写解释。

**测试 4：Ambient 轮换**

1. 在 `/ambient` 设置 28 分钟、3 张卡、加权模式。
2. 手动“下一批”，最多显示 3 条互不重复的命令。
3. 把一条命令标成“总是忘记”；其调度权重随之提高。
4. 重新加载后 28 分钟与 3 张卡设置保留。
5. 用 fake clock 将时间推进 28 分钟，正确换一批；后台错过多期不连续刷屏。
6. 调整为 5 分钟、1 张与 60 分钟、8 张均能正常运作。

**测试 5：编辑 / 持久化**

1. 修改 `ls` 的中文解释、一个 flag 说明和个人备注。
2. 刷新后仍能看到修改；搜索能命中新增中文关键词。
3. 仍能查看原始来源和改写标识。

**测试 6：设计与安全**

1. 五套（至少四套）主题切换后界面仍清晰可读。
2. 暗色与浅色背景均有可用的键盘焦点状态。
3. 打开 Reduced Motion 模式后动画显著减少。
4. 高风险命令有提醒；无直接执行按钮。
5. 网页 Ambient 文案必须标注这是 **Web Preview**，不宣传跨应用置顶。

---

## 13. 交付规范（Codex 完成后必须汇报）

Codex 应在仓库中生成：

1. **完整可启动源码**和锁文件，不是截图/伪代码。
2. `README.md`：依赖前提、安装、`npm run dev`、构建、测试、使用说明。
3. `AGENTS.md`：内容和版权安全规则、快捷键规则、数据 schema 与长期编码原则。
4. `docs/ATTRIBUTION.md`：命令语料来源、许可证、上游链接与改动说明。
5. 命令种子数据、主题、演示状态与可工作的 IndexedDB 持久化。
6. 测试结果与已知限制（如网页版无法跨 App 置顶、浏览器在后台可能限制计时）。
7. 如有实际无法完成项，明确列入 `KNOWN_LIMITATIONS.md`，不要用静态占位界面假装完成。

---

## 14. 可直接复制给 Codex 的 Kickoff Prompt

> **推荐做法**：把本文件放到 `~/Projects/TerminalAtlas/docs/PRODUCT_SPEC.md`，进入项目目录启动 Codex，并粘贴以下内容。

```text
Read docs/PRODUCT_SPEC.md completely. Treat it as the authoritative product,
UX, content-licensing, and acceptance specification for Terminal Atlas.

Build a real, polished, locally runnable MVP (P0) using Vite + React + TypeScript.
The two top-level modes are:
1) Handbook: an Obsidian-inspired three-column UI with a CARD GRID as the
   default center view and a detailed inspector.
2) Ambient: an interactive, draggable web preview of a floating command-card
   window with customizable rotation intervals, including 28 minutes.

Implement spatial arrow-key navigation and shortcuts 1=frequent,
2=mastered, 3=often forgotten, 0=clear; frequent is orthogonal to mastery.
The shortcut logic must not intercept typing or IME composition.

Use real command data, accurately explain English meanings/etymologies and
compound options like ls -lah, preserve content provenance and attribution,
and persist user changes, tags, notes, and settings locally via IndexedDB.
Provide at least 60 real commands, at least 20 richly annotated.

Use understated macOS-inspired translucent controls and multiple themes.
Both modes must be functional, accessible, responsive, and build successfully.
Do not execute shell commands from the app. Do not imply web previews can
become system-level always-on-top windows or dynamic wallpapers.

Do the actual implementation. Run installation, tests, and build, fix failures,
and summarize exactly what works, which files changed, and remaining gaps.
Prioritize all P0 items in the spec; leave P1/P2 for later.
```

---

## 15. 外部参考（2026-10-13 核对）

- tldr-pages 官方仓库与内容：<https://github.com/tldr-pages/tldr>
- tldr-pages 内容许可与贡献规则：<https://github.com/tldr-pages/tldr/blob/main/CONTRIBUTING.md>
- tldr-pages 项目 AI/贡献指南：<https://github.com/tldr-pages/tldr/blob/main/AGENTS.md>
- tldr-pages 目录与多语言格式：<https://github.com/tldr-pages/tldr/blob/main/CLIENT-SPECIFICATION.md>
- explainshell 的代码、数据库许可说明：<https://github.com/idank/explainshell>
- Apple 材料 / Liquid Glass 设计指导：<https://developer.apple.com/design/human-interface-guidelines/materials>
- Tauri 2 窗口配置与平台限制：<https://v2.tauri.app/reference/config/>
- Tauri 2 Window API：<https://v2.tauri.app/reference/javascript/api/namespacewebviewwindow/>

---

**产品一句话：** *A keyboard-first, card-based command handbook that lives at the edge of your attention.*  
**中文：** *一本能随时查阅、经常瞟一眼、通过环境重复自然熟悉命令的桌面知识手册。*
