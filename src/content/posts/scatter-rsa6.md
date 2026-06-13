---
title: "ScatterRSA —— Håstad 广播攻击 Writeup"
pubDatetime: 2026-05-30T19:47:46+08:00
tags:
  - crypto
  - RSA
description: "低指数 RSA 对线性变换后的明文做三组同模加密，构造多项式后用 CRT 合并，再以 Coppersmith 求小根还原明文 flag。"
---

![image-20260530194746440](/assets/images/scatter-rsa6/image-20260530194746440.png)

密码2，中级一点的rsa

先看文件

![image-20260530195202178](/assets/images/scatter-rsa6/image-20260530195202178.png)

![image-20260530195212669](/assets/images/scatter-rsa6/image-20260530195212669.png)

有点小复杂

可以看到，题目使用了 RSA 加密，并且指数为：

```text
e = 3
```

但是每一次加密前，并不是直接加密 `m`，而是加密了一个线性变换后的明文：

```text
a_i * m + b_i
```

即：

```text
c_i = (a_i * m + b_i)^3 mod n_i
```

`output.txt` 中给出了三组：

```text
n_i, a_i, b_i, c_i
```

题目中存在两个关键问题：

```text
1. RSA 使用了低指数 e = 3。
2. 同一个明文 m 被使用不同的线性填充 a_i*m+b_i 加密了 3 次。
```

因为有三组不同模数：

```text
n1, n2, n3
```

并且指数也是：

```text
e = 3
```

所以这正好满足 Håstad Broadcast Attack 的线性填充变种。

对于每一组数据，都有：

```text
(a_i * m + b_i)^3 ≡ c_i mod n_i
```

也就是：

```text
(a_i * x + b_i)^3 - c_i ≡ 0 mod n_i
```

其中未知量 `x` 就是 flag 对应的整数 `m`。

对每一组数据构造多项式：

```text
f_i(x) = (a_i * x + b_i)^3 - c_i
```

满足：

```text
f_i(m) ≡ 0 mod n_i
```

由于三组 `n_i` 互素，可以用 CRT 将三个多项式合并成一个模：

```text
N = n1 * n2 * n3
```

上的多项式：

```text
F(x) ≡ f_i(x) mod n_i
```

于是有：

```text
F(m) ≡ 0 mod N
```

`F(x)` 是一个三次多项式，而 flag 对应的整数 `m` 明显远小于 `N^(1/3)`。因此可以使用 Coppersmith 小根攻击求出 `m`。

python跑不了那么复杂的，所以我们用SAGEMATH跑

![image-20260530195934479](/assets/images/scatter-rsa6/image-20260530195934479.png)

拿下flag

flag{d3e053494a1280f3cff1c22c170069c0}
