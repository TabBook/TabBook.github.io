---
title: "ECDSA Nonce 重用攻击 Writeup"
pubDatetime: 2026-05-30T20:02:36+08:00
tags:
  - crypto
  - ECDSA
description: "两组签名的 r 相同，说明复用了同一随机数 k。通过两条签名方程相减恢复 k，进而推出私钥 d，最终还原 flag。"
---

![image-20260530200236613](/assets/images/ecdsa-nonce-reuse/image-20260530200236613.png)

密码4，先看文件

![image-20260530200303015](/assets/images/ecdsa-nonce-reuse/image-20260530200303015.png)

![image-20260530200601181](/assets/images/ecdsa-nonce-reuse/image-20260530200601181.png)

题目给了 `challenge.json`，其中包含：

```text
curve = SECP256k1
public_key_x, public_key_y
message1, message2
signature1_r, signature1_s
signature2_r, signature2_s
```

观察两组签名可以发现：

```text
signature1_r == signature2_r
```

在 ECDSA 中，`r` 相同通常意味着两次签名使用了同一个随机数 `k`。

ECDSA 签名公式为：

```text
s = k^(-1) * (z + r*d) mod n
```

其中：

```text
z = SHA256(message)
d = 私钥
k = 每次签名使用的随机数
n = 曲线阶
```

对于两条消息，有：

```text
s1 = k^(-1) * (z1 + r*d) mod n
s2 = k^(-1) * (z2 + r*d) mod n
```

两式相减：

```text
s1 - s2 = k^(-1) * (z1 - z2) mod n
```

所以可以恢复随机数：

```text
k = (z1 - z2) * inverse(s1 - s2, n) mod n
```

拿到 `k` 后，再由：

```text
s1 = k^(-1) * (z1 + r*d) mod n
```

推出私钥：

```text
d = (s1*k - z1) * inverse(r, n) mod n
```

最后使用恢复出的私钥 `d` 乘以生成元 `G`，验证得到的点是否等于题目给出的公钥。

验证通过后，将私钥按 64 位十六进制补齐，套上 `flag{}` 即为最终 flag。

所以exp如下

![image-20260530201119518](/assets/images/ecdsa-nonce-reuse/image-20260530201119518.png)

拿下f'la'g
