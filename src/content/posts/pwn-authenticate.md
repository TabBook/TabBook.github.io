---
title: "Authenticate —— 栈溢出后门 Writeup"
pubDatetime: 2026-05-30T10:15:43+08:00
tags:
  - pwn
  - 栈溢出
description: "存在后门函数与 gets 无限输入导致的栈溢出；64 位下溢出 136 字节覆盖返回地址跳转后门，注意栈对齐后 getshell。"
---

![image-20260530101543738](/assets/images/pwn-authenticate/image-20260530101543738.png)

题目描述，进去看代码

![image-20260530101622231](/assets/images/pwn-authenticate/image-20260530101622231.png)

![image-20260530101646345](/assets/images/pwn-authenticate/image-20260530101646345.png)

函数表有后门函数，再checksec一下

![image-20260530101746823](/assets/images/pwn-authenticate/image-20260530101746823.png)

非常简单的栈溢出题

我们回去看之前的代码，有gets函数可以进行无限输入，所以存在栈溢出，但是是64位题目，需要栈对齐

![image-20260530101908338](/assets/images/pwn-authenticate/image-20260530101908338.png)

溢出0x80，也就128字节，64位程序，也就是136字节

exp如下

![image-20260530131025673](/assets/images/pwn-authenticate/image-20260530131025673.png)

拿下flag
