---
title: "损坏的压缩包 —— ZIP 取证 Writeup"
pubDatetime: 2026-05-30T19:11:39+08:00
tags:
  - misc
  - 压缩包
description: "一个看似损坏实则可正常解压的压缩包，借助工具分析其内容后，用 Python 还原出隐藏的 flag。"
---

![image-20260530191139094](/assets/images/corrupted-zip/image-20260530191139094.png)

misc2

先看文件

![image-20260530191204912](/assets/images/corrupted-zip/image-20260530191204912.png)

先尝试直接解压

![image-20260530191522125](/assets/images/corrupted-zip/image-20260530191522125.png)

az，好像没有损坏，打开得到

![image-20260530191537080](/assets/images/corrupted-zip/image-20260530191537080.png)

啊？

利用srktoolbox解密

![image-20260530191638185](/assets/images/corrupted-zip/image-20260530191638185.png)

所以可以用python得出flag

![image-20260530192006690](/assets/images/corrupted-zip/image-20260530192006690.png)
