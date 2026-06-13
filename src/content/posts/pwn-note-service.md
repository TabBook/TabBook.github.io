---
title: "NoteService —— 栈溢出后门 Writeup"
pubDatetime: 2026-05-30T10:35:04+08:00
tags:
  - pwn
  - 栈溢出
description: "典型的 64 位栈溢出题：溢出 72 字节覆盖返回地址跳转后门函数，padding 会破坏栈，需手动 16 字节对齐后 getshell。"
---

![image-20260530103504610](/assets/images/pwn-note-service/image-20260530103504610.png)

先看题目，如上

打开checksec，还有ida

![image-20260530103625846](/assets/images/pwn-note-service/image-20260530103625846.png)

非常简单的保护

![image-20260530103644395](/assets/images/pwn-note-service/image-20260530103644395.png)

存在一个非常典型的栈溢出

因为是64位程序，溢出字节是72字节

![image-20260530103906498](/assets/images/pwn-note-service/image-20260530103906498.png)

然后也可以找到后门函数

这题padding会破坏栈，所以需要手动16 字节栈对齐

![image-20260530104505351](/assets/images/pwn-note-service/image-20260530104505351.png)

拿下地址，所以最终exp如下

![image-20260530104524127](/assets/images/pwn-note-service/image-20260530104524127.png)

![image-20260530130350744](/assets/images/pwn-note-service/image-20260530130350744.png)

拿下flag
