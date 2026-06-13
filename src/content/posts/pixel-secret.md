---
title: "像素中的秘密 —— PNG 隐写与 LCG Writeup"
pubDatetime: 2026-05-30T19:27:48+08:00
tags:
  - misc
  - 隐写
description: "PNG 的 IEND 之后藏有数据：读取大端 4 字节 seed，用 LCG 还原被打乱的隐藏数据，最终提取出 flag。"
---

![image-20260530192748200](/assets/images/pixel-secret/image-20260530192748200.png)

misc4，先看文件

![image-20260530193450120](/assets/images/pixel-secret/image-20260530193450120.png)

![image-20260530193456894](/assets/images/pixel-secret/image-20260530193456894.png)

![image-20260530193502934](/assets/images/pixel-secret/image-20260530193502934.png)

题目看起来是一张 PNG 图片，但真正的数据并不在正常像素中，而是追加在 PNG 文件结尾之后

用010看看真假

PNG 文件由多个 chunk 组成，最后一个 chunk 是 `IEND`。  
一个完整的空 `IEND` chunk 字节为：

![image-20260530193648788](/assets/images/pixel-secret/image-20260530193648788.png)

其中：

```text
00 00 00 00       chunk 长度为 0
49 45 4E 44       ASCII 字符串 "IEND"
AE 42 60 82       IEND 的 CRC
```

EXP 中使用下面这行定位 PNG 结尾：

```python
E = bytes.fromhex("0000000049454e44ae426082")
```

然后查找 `IEND` 位置：

```python
data = open("image_04.png", "rb").read()

i = data.index(E) + 12
```

`+12` 是因为完整的 `IEND` chunk 长度为 12 字节。  
所以 `i` 指向的就是 PNG 正常内容结束后的隐藏数据起始位置。

使用大端序读取 4 字节 seed

使用 LCG 生成伪随机 XOR key

 XOR 解密得到 Base62 字符串

Base62 解码

思路大概是这样，exp如下

![image-20260530193810193](/assets/images/pixel-secret/image-20260530193810193.png)

拿到flag
