# 我的博客

你好，我是 **TabBook** 👋

一位普通的大学生，喜欢玩游戏、听歌。这里是我的个人博客，用来记录一些日常的思考和生活片段。

🔗 在线地址：[https://tabbook.github.io](https://tabbook.github.io)

## 联系我

- 📮 邮箱：[fiqancii@gmail.com](mailto:fiqancii@gmail.com)
- 🐙 GitHub：[@TabBook](https://github.com/TabBook)

---

## 关于这个博客

这是一个极简风格的静态博客，基于 [Jekyll](https://jekyllrb.com/) 搭建，托管在 GitHub Pages 上。

### 怎么写新文章

在 `_posts/` 文件夹里新建一个文件，文件名格式为 `年-月-日-标题.md`，开头加上：

```yaml
---
layout: post
title: "文章标题"
date: 2026-07-01 09:00:00 +0800
tags: [标签一, 标签二]
---

正文用 Markdown 书写……
```

保存后提交并推送到 GitHub，网站会自动更新。

### 目录结构

```
.
├── _config.yml          # 站点配置
├── index.html           # 首页（首屏 + 文章列表）
├── about.md             # 关于我
├── tags.html            # 标签页
├── _posts/              # 文章（Markdown）
├── _layouts/            # 页面模板
├── _includes/           # 公共片段（头部、导航、页脚）
└── assets/              # 样式与脚本
```
