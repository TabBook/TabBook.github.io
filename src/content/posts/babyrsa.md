---
title: "babyrsa —— RSA 小指数攻击 Writeup"
pubDatetime: 2026-05-30T19:43:07+08:00
tags:
  - crypto
  - RSA
description: "一道入门 RSA 题：公钥指数 e=3 且明文较短，加密未发生取模，直接对密文开三次方即可还原明文的低指数攻击。"
---

![image-20260530194307128](/assets/images/babyrsa/image-20260530194307128.png)

密码1

简单rsa

先看文件

![image-20260530194324074](/assets/images/babyrsa/image-20260530194324074.png)

打开py文件，加密逻辑很简单：

![image-20260530194402659](/assets/images/babyrsa/image-20260530194402659.png)

还有output，给出了 RSA 参数：

![image-20260530194459031](/assets/images/babyrsa/image-20260530194459031.png)

RSA 加密公式为：

```text
c = m^e mod n
```

题目中：

```text
e = 3
```

这是一个很小的公钥指数。

如果明文 `m` 较短，满足：

```text
m^3 < n
```

那么加密时不会发生取模，也就是：

```text
c = m^3
```

此时不需要分解 `n`，直接对 `c` 开三次方就能得到明文：

```text
m = ∛c
```

这就是 RSA 小指数攻击中的最简单情况。

先读取题目给出的 `c`，尝试对其做整数三次方根。

Python 可以使用 `gmpy2.iroot`：

```python
import gmpy2

m, ok = gmpy2.iroot(c, 3)
```

如果 `ok == True`，说明 `c` 正好是某个整数的三次方，也就证明：

```text
c = m^3
```

最后将整数 `m` 转回字节即可得到 flag

exp如下：

![image-20260530194702112](/assets/images/babyrsa/image-20260530194702112.png)

拿下flag
