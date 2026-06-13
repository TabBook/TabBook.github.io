---
title: "MessageBoard —— 栈上 Shellcode Writeup"
pubDatetime: 2026-05-30T14:33:50+08:00
tags:
  - pwn
  - 栈溢出
  - shellcode
description: "程序无任何保护且直接泄露栈地址，read 读取超出 buf[128] 造成栈溢出，覆盖返回地址跳转到栈上 shellcode 完成 getshell。"
---

![image-20260530143350723](/assets/images/pwn-message-board/image-20260530143350723.png)

老规矩，checksec看一下

![image-20260530143452040](/assets/images/pwn-message-board/image-20260530143452040.png)

没有任何保护

因此可以直接采用

栈溢出 → 覆盖返回地址 → 跳转到栈上 Shellcode

进入vuln函数看看

![image-20260530143541222](/assets/images/pwn-message-board/image-20260530143541222.png)

可以发现：

- 栈上存在 `buf[128]`
- `read()` 读取 `0x100` 字节
- 读取长度大于缓冲区大小
- 存在明显栈溢出

同时程序还泄露了：

```c
printf("Buffer at: %p\n", buf);
```

直接输出了栈缓冲区地址

条件齐全：

- 利用点：`read()` 导致栈溢出
- 信息泄露：程序直接输出栈地址
- 保护情况：无 Canary、栈可执行
- 利用方式：覆盖返回地址跳转到栈上的 Shellcode
- 关键偏移：`0x88`

最终通过返回到泄露的 `buf` 地址执行 Shellcode，成功获取 Shell。

exp如下

![image-20260530143736127](/assets/images/pwn-message-board/image-20260530143736127.png)
