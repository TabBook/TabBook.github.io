---
title: "PHP Payment —— 反序列化充值 Writeup"
pubDatetime: 2026-05-30T11:54:25+08:00
tags:
  - web
  - PHP
  - 反序列化
description: "审计源码发现反序列化漏洞：构造 PromoManager 对象控制 promo_credit 给账户余额充值，满足购买条件后拿到 flag。"
---

![image-20260530115425389](/assets/images/web-php-payment/image-20260530115425389.png)

题目给了网站源码，我们先进入网站

![image-20260530115459290](/assets/images/web-php-payment/image-20260530115459290.png)

啥都没有信息，看给的源码文件

![image-20260530115618032](/assets/images/web-php-payment/image-20260530115618032.png)

遍历上方没有相关漏洞点，都是前端还有后端文件

![image-20260530115645375](/assets/images/web-php-payment/image-20260530115645375.png)

进入上方图片第一个php文件看看

![image-20260530115720554](/assets/images/web-php-payment/image-20260530115720554.png)

漏洞很明显

![image-20260530115750671](/assets/images/web-php-payment/image-20260530115750671.png)

用户完全可控![image-20260530115832947](/assets/images/web-php-payment/image-20260530115832947.png)

而且反序列化前已经加载了，我们返回看另外个文件models.php

![image-20260530115958415](/assets/images/web-php-payment/image-20260530115958415.png)

`$_SESSION['balance'] += intval($this->promo_credit);`

只要能反序列化一个 `PromoManager` 对象，

就能控制：`$this->promo_credit`

从而给余额充值，这就是关键 Gadget

Flag 获取条件在`buy.php`

![image-20260530120214346](/assets/images/web-php-payment/image-20260530120214346.png)

看这行代码

购买 Flag 需要99999金币

所以思路很简单就是所以思路就是：

1. 构造 PromoManager
2. promo_credit 设置为 ≥99999
3. 应用优惠券
4. 余额暴涨
5. 购买 flag

构造序列化对象

```php
O:12:"PromoManager":2:{
    s:12:"promo_credit";i:100000;
    s:10:"promo_code";s:3:"pwn";
}
```
