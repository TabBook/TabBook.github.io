---
title: "幻影 —— Base64 与单字节 XOR Writeup"
pubDatetime: 2026-05-30T19:01:32+08:00
tags:
  - misc
description: "题目给出迷惑性的假 flag，真正数据藏在末尾的 Base64 中；解码后再爆破单字节 XOR（key=0x7e）得到真 flag。"
---

![image-20260530190132923](/assets/images/phantom/image-20260530190132923.png)

misc1，题目给出文件：



首先010查看文件内容：![image-20260530190218014](/assets/images/phantom/image-20260530190218014.png)

![image-20260530190232510](/assets/images/phantom/image-20260530190232510.png)

题目给出的假 flag，提示中也说明了DO NOT TRUST THIS ONE

真正的 flag 隐藏在最后一串 Base64 数据中

说明真正的数据经过了两步处理：

Base64 编码
XOR 加密

提取出的 Base64 字符串为：

```text
GBIfGQVPR0tLTh8dHFMdSxhOU0ocSRpTHEZNTFNJS0ZHThpHSRpIHBsD
```

使用 Python 解码：



![image-20260530190634603](/assets/images/phantom/image-20260530190634603.png)

得到一段不可读的二进制数据：

```text
18 12 1f 19 05 4f 47 4b 4b 4e 1f 1d 1c 53 1d 4b 18 4e 53 4a 1c 49 1a 53 1c 46 4d 4c 53 49 4b 46 47 4e 1a 47 49 1a 48 1c 1b 03
```

说明还需要继续 XOR 解密

由于没有给出 key，并且密文长度较短，因此直接尝试单字节 XOR

![image-20260530190809683](/assets/images/phantom/image-20260530190809683.png)

拿下flag，顺便拿到xor key为0x7e
