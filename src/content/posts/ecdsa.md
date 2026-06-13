---
title: "ECDSA —— 固定私钥推导 Writeup"
pubDatetime: 2026-05-20T20:28:54+08:00
tags:
  - crypto
  - ECDSA
description: "ECDSA 题目生成私钥时使用了固定字符串，参数全部已知；直接复现 SHA-512 取模曲线阶的过程即可算出私钥得到 flag。"
---

#### 0x00

题目在生成私钥时，使用了一个字符串 "Welcome to this challenge!"，并没有从外部读取或隐藏这个字符串。

```python
digest_int = int.from_bytes(sha512(b"Welcome to this challenge!").digest(), "big")
curve_order = NIST521p.order
priv_int = digest_int % curve_order
priv_bytes = long_to_bytes(priv_int, 66)
sk = SigningKey.from_string(priv_bytes, curve=NIST521p)
vk = sk.verifying_key
```

从代码可以看出，输入是固定的字符串。

算法是固定的 SHA-512 哈希。

曲线参数是固定的 NIST P-521 常数。

私钥 = 哈希值 % 曲线阶数。

因此，我们可以直接运行这段 Python 代码算出私钥。

```python
import hashlib
from ecdsa import NIST521p

seed = b"Welcome to this challenge!"
digest_int = int.from_bytes(hashlib.sha512(seed).digest(), "big")
curve_order = NIST521p.order
priv_int = digest_int % curve_order

priv_str = str(priv_int)  
md5_result = hashlib.md5(priv_str.encode('utf-8')).hexdigest()

print(f"私钥:"+"flag{"+priv_str+"}")
print(f"MD5加密:"+"flag{"+md5_result+"}")
```





**flag{581bdf717b780c3cd8282e5a4d50f3a0}**
