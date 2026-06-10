# TypeWrite

TabBook 的个人博客，记录 CTF / PWN 题解与日常思考。

- 在线地址：<https://tabbook.github.io/>
- 技术栈：[Astro](https://astro.build/)（主题基于 [AstroPaper](https://github.com/satnaing/astro-paper) / [astro-lite](https://github.com/achuanya/astro-lite) 二次开发）
- 部署：GitHub Pages（GitHub Actions 自动构建，push 到 `main` 即上线）

## 写文章

在 `src/content/posts/` 下新建 `.md`，frontmatter 示例：

```yaml
---
title: "文章标题"
pubDatetime: 2026-06-10T12:00:00+08:00
tags:
  - pwn
description: "一句话摘要"
---
```

图片放 `public/assets/images/<文章名>/`，正文用 `/assets/images/...` 引用。

## 本地开发

```bash
pnpm install
pnpm dev      # 本地预览
pnpm build    # 构建
```

## License

主题代码基于 AstroPaper（MIT，见 [LICENSE](./LICENSE)）。文章内容版权归 TabBook 所有。
