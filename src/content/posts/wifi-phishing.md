---
title: "WiFi 钓鱼抓包取证 Writeup"
pubDatetime: 2026-04-18T10:57:24+08:00
tags:
  - osint
description: "分析 wifi_phishing.pcapng 还原 Evil Twin 伪造热点加钓鱼门户的全过程，提取受害者 MAC、钓鱼域名、密码与时间戳构造 flag。"
---

# WiFi 钓鱼抓包取证 Writeup

## 题目目标
根据提供的 `wifi_phishing.pcapng`，提取 4 个关键字段并构造 Flag：

1. 受害者 MAC 地址的前 6 位十六进制字符（去掉冒号）
2. 钓鱼页面域名（不含 `http://`）
3. 攻击者窃取到的密码
4. 密码数据包对应 UNIX 时间戳的最后 4 位数字

---

## 一、整体流量梳理
这个抓包比较小，只有 19 个包，完整还原了一个 **Evil Twin / 伪造热点 + 钓鱼门户** 的过程：

1. 攻击者伪造了一个热点：`Starbucks_Free_WiFi`
2. 受害者设备连接到该热点
3. 受害者通过 DHCP 获得地址 `192.168.1.100`
4. 攻击者对多个域名查询进行回应，并将结果都指向 `192.168.1.1`
5. 受害者访问网页后被 `302` 重定向到钓鱼站点
6. 受害者在伪造登录页中提交了邮箱和密码
7. 攻击者成功拿到明文密码

---

## 二、定位受害者 MAC 地址
### 观察思路
前 3 个包是无线接入阶段的数据包，后面的流量都已经进入 IP/HTTP 阶段。

在整个后续通信中，客户端 MAC 反复出现为：

- `11:22:33:44:55:66`

例如：

- **包 4**：`11:22:33:44:55:66 -> ff:ff:ff:ff:ff:ff`，DHCP Discover
- **包 6/8/10/12/14/16/18**：均是该设备发出的请求

因此受害者 MAC 可以确定为：

`11:22:33:44:55:66`

题目要求取 **前 6 位十六进制字符并去掉冒号**：

- `11:22:33:44:55:66` → `112233...`
- 取前 6 位：

**`112233`**

---

## 三、定位钓鱼页面域名
### 关键包：HTTP 302 跳转
受害者先访问了正常站点：

### 包 14
```http
GET / HTTP/1.1
Host: google.com
```

攻击者立即返回 302：

### 包 15
```http
HTTP/1.1 302 Found
Location: http://starbucks-wifi-auth.com/login
```

从 `Location` 头可以直接拿到钓鱼站域名：

**`starbucks-wifi-auth.com`**

题目说明不包含 `http://`，所以答案就是：

**`starbucks-wifi-auth.com`**

---

## 四、定位攻击者窃取到的密码
### 关键包：表单提交
受害者打开钓鱼页面：

### 包 16
```http
GET /login HTTP/1.1
Host: starbucks-wifi-auth.com
```

服务器返回伪造登录表单：

### 包 17
```http
HTTP/1.1 200 OK
Content-Type: text/html

<html><body><h1>Starbucks WiFi Login</h1>
<form action='/authenticate' method='post'>
<input name='email' placeholder='Email'><br>
<input name='password' type='password' placeholder='Password'><br>
<input type='submit' value='Connect'>
</form></body></html>
```

真正的密码出现在下一条 POST 请求中：

### 包 18
```http
POST /authenticate HTTP/1.1
Host: starbucks-wifi-auth.com
Content-Length: 48
Content-Type: application/x-www-form-urlencoded

email=user@example.com&password=MySecurePass123!
```

从 POST Body 中可直接提取出密码：

**`MySecurePass123!`**

---

## 五、定位攻击时间戳最后 4 位
题目说明要取：

> **密码数据包** 的最后 4 位数字（UNIX 时间戳）

密码所在的数据包是 **包 18**。

其时间戳为：

- `1762598957.699998000`

最后 4 位为：

**`8000`**

---

## 六、四个字段汇总
1. 受害者 MAC 前 6 位：`112233`
2. 钓鱼页面域名：`starbucks-wifi-auth.com`
3. 被窃取的密码：`MySecurePass123!`
4. 时间戳最后 4 位：`8000`

---

## 七、最终 Flag
如果题目是直接按顺序拼接，则结果为：

```text
112233_starbucks-wifi-auth.com_MySecurePass123!_8000
```

如果平台使用常见花括号格式，则可写作：

```text
flag{112233_starbucks-wifi-auth.com_MySecurePass123!_8000}
```
