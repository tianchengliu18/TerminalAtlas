# Terminal Atlas

一本键盘优先的命令卡片手册。在 Handbook 查命令，在 Ambient Web Preview 中让少量知识低干扰地反复出现。首版是可离线使用的 Web MVP；真正的 macOS 置顶窗口属于后续 Tauri 2 阶段。

## 启动

需要 Node.js 20.19+（推荐 22）和 npm。

```bash
npm install
npm run dev
```

浏览器打开终端显示的本机地址，默认是 <http://127.0.0.1:5173/>。

```bash
npm run typecheck
npm run test
npm run build
```

## 使用

- Handbook 默认显示 74 张真实命令卡。搜索命令、中文用途或组合参数；点击卡片查看右侧详情。
- 方向键移动选中卡，`1` 切换常用，`2` 切换已熟练，`3` 切换总是忘记，`0` 清除学习标记。`Space` 翻卡，`Enter` 打开详情。全部操作都有可点击的入口。完整清单见 [快捷键说明](docs/SHORTCUTS.md)。
- 可收藏、固定 Ambient 命令、写 Markdown 笔记、编辑解释或添加自己的命令。修改保存在本机 IndexedDB；设置中可导出/导入 JSON 备份。
- Ambient 默认每 28 分钟展示 3 张卡。可选 1～1440 分钟、1～8 张，以及顺序、随机、加权复现。预览面板可以在页面内拖动和调宽，支持暂停、上一批、下一批、分类与学习状态筛选。
- 设置中可切换五套主题，以及高对比度和减少透明效果。浏览器的减少动画偏好也会生效。

## 内容与许可

预置的 74 条命令均有中文简述与示例；其中 24 条有较完整的参数说明。10 条命令包含固定版本的 tldr-pages 英文原始页面及逐页来源链接。原创代码按 PolyForm Noncommercial 1.0.0 授权，原创文档按 CC BY-NC 4.0 授权；第三方内容保留其原许可。详见 [内容署名](docs/ATTRIBUTION.md) 和 [使用许可](LICENSE.md)。命令只供学习和复制，应用不会执行 Shell 命令。

## 文档

- [产品规格](docs/PRODUCT_SPEC.md)
- [架构与数据](docs/ARCHITECTURE.md)
- [设计系统](docs/DESIGN_SYSTEM.md)
- [快捷键](docs/SHORTCUTS.md)
- [命令内容约定](docs/CONTENT_CONVENTIONS.md)
- [开发约定](AGENTS.md)
- [已知限制](KNOWN_LIMITATIONS.md)
