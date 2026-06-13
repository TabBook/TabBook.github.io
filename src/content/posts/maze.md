---
title: "迷宫 —— 套娃压缩包 Writeup"
pubDatetime: 2026-05-30T19:21:48+08:00
tags:
  - misc
description: "层层嵌套的压缩包如同迷宫，逐层解压后得到一个 bin 文件，识别为 Base64 并用 Python 解码得到 flag。"
---

![image-20260530192148924](/assets/images/maze/image-20260530192148924.png)

misc3，先看文件

![image-20260530192208526](/assets/images/maze/image-20260530192208526.png)

打开压缩包

![image-20260530192218351](/assets/images/maze/image-20260530192218351.png)

一直打开压缩包，真迷宫啊

![image-20260530192234220](/assets/images/maze/image-20260530192234220.png)

发现个bin文件，用010打开

![image-20260530192500157](/assets/images/maze/image-20260530192500157.png)

发现是base64

用python解密

![image-20260530192705566](/assets/images/maze/image-20260530192705566.png)

拿下flag
