---
title: "image_04 —— PNG 尾部隐写 Writeup"
pubDatetime: 2026-05-30T19:34:23+08:00
tags:
  - misc
  - 隐写
description: "看似普通的 PNG，真正数据追加在 IEND chunk 之后。定位 PNG 文件结尾后提取尾部隐藏内容，解出 flag。"
---

# image_04.png 隐写 Writeup

## 题目文件

题目给出一个压缩包：

```text
image_04(3).zip
```

解压后得到：

```text
image_04.png
```

题目看起来是一张 PNG 图片，但真正的数据并不在正常像素中，而是追加在 PNG 文件结尾之后。

---

## 1. 定位 PNG 结尾

PNG 文件由多个 chunk 组成，最后一个 chunk 是 `IEND`。  
一个完整的空 `IEND` chunk 字节为：

```text
00 00 00 00 49 45 4E 44 AE 42 60 82
```

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

---

## 2. 提取隐藏数据

EXP 中提取了 `IEND` 后面的 64 字节：

```python
t = data[i:i + 64]
```

这 64 字节是题目追加的隐藏数据。其结构可以根据 EXP 反推为：

```text
t[0:4]    无用填充
t[4:8]    伪随机数种子 seed
t[8:]     XOR 加密后的数据
```

代码如下：

```python
s = int.from_bytes(t[4:8], "big")
```

这里使用大端序读取 4 字节 seed。

---

## 3. LCG 伪随机数异或解密

EXP 中的核心解密逻辑为：

```python
b = bytearray()

for x in t[8:]:
    s = (1664525 * s + 1013904223) & 0xffffffff
    b.append(x ^ s & 255)
```

这里使用了一个 32 位 LCG 线性同余伪随机数生成器：

```text
s = (1664525 * s + 1013904223) mod 2^32
```

每次更新 seed 后，取最低 8 位作为 XOR key：

```python
s & 255
```

再与密文字节异或：

```python
plain_byte = cipher_byte ^ (s & 255)
```

解密后得到一串 Base62 编码文本：

```text
iQ4VC0BPMxwmHBEbcbkgxzPEl7C8dp1UE1L
```

EXP 中使用：

```python
b.rstrip(b"\0").decode()
```

去掉末尾的 `\x00` 填充。

---

## 4. Base62 解码

题目使用的 Base62 字符表为：

```python
A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
```

也就是说：

```text
0-9       表示 0 到 9
a-z       表示 10 到 35
A-Z       表示 36 到 61
```

EXP 中的 Base62 解码逻辑是：

```python
n = 0

for x in b.rstrip(b"\0").decode():
    n = n * 62 + A.index(x)
```

这是标准的进制转换过程。  
把 Base62 字符串转换成整数后，再把整数转回字节：

```python
n.to_bytes((n.bit_length() + 7) // 8, "big").decode()
```

最终得到明文：

```text
flag{memory_dump_analysis}
```

---

## 5. 完整解题脚本

```python
A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
E = bytes.fromhex("0000000049454e44ae426082")

data = open("image_04.png", "rb").read()

# 找到 PNG IEND 结束位置
i = data.index(E) + 12

# 提取 IEND 后追加的 64 字节隐藏数据
t = data[i:i + 64]

# t[4:8] 是 LCG 的初始 seed
s = int.from_bytes(t[4:8], "big")

# LCG + XOR 解密
b = bytearray()

for x in t[8:]:
    s = (1664525 * s + 1013904223) & 0xffffffff
    b.append(x ^ (s & 255))

# 得到 Base62 字符串
base62_text = b.rstrip(b"\0").decode()
print(base62_text)

# Base62 转整数
n = 0

for x in base62_text:
    n = n * 62 + A.index(x)

# 整数转 bytes，得到 flag
flag = n.to_bytes((n.bit_length() + 7) // 8, "big").decode()

print(flag)
```

运行结果：

```text
iQ4VC0BPMxwmHBEbcbkgxzPEl7C8dp1UE1L
flag{memory_dump_analysis}
```

---

## 6. Flag

最终 flag 为：

```text
flag{memory_dump_analysis}
```

---

## 7. 总结

本题的隐藏流程可以总结为：

```text
PNG 文件
→ 定位 IEND chunk
→ 读取 IEND 后追加的隐藏数据
→ 提取 seed
→ 使用 LCG 生成伪随机 XOR key
→ XOR 解密得到 Base62 字符串
→ Base62 解码
→ 得到 flag
```

关键点有三个：

```text
1. PNG 在 IEND 后仍然可以追加数据，图片查看器通常会忽略这部分内容。
2. 加密方式不是固定 XOR，而是 LCG 生成逐字节 key。
3. XOR 解密后的结果不是 flag，而是 Base62 编码，需要继续做进制转换。
```
