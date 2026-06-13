---
title: "Snake Game —— 分数篡改 Writeup"
pubDatetime: 2026-05-30T11:52:18+08:00
tags:
  - web
description: "贪吃蛇网页题：审计源码发现分数经 POST 提交且服务端信任，用 HackBar 直接提交高分即可拿到 flag。"
---

![image-20260530115218639](/assets/images/web-snake-game/image-20260530115218639.png)

进去网站

![image-20260530115235101](/assets/images/web-snake-game/image-20260530115235101.png)

审计网站源代码

![image-20260530115305416](/assets/images/web-snake-game/image-20260530115305416.png)

判断靠post，score值

![image-20260530115331213](/assets/images/web-snake-game/image-20260530115331213.png)

用hackbar提交

![image-20260530115351525](/assets/images/web-snake-game/image-20260530115351525.png)

拿下flag
