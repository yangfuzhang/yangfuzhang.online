---
layout: ../../layouts/PostLayout.astro
title: 阿里云Docker镜像加速配置
author: yangfuzhang
description: Docker修改镜像地址
pubDate: Dec. 23
prevUrl: /snippets-posts
slug: docker-registry
---

云服务器上没有代理，下载镜像速度非常慢，有时还会直接断掉，严重影响了开发效率。网上能找到的国内镜像地址，现在基本都不可用，无奈只能找到一个相对较好的解决方式，就是使用阿里镜像加速。方法如下：

### 步骤一

登录阿里云控制台，搜索 -> 容器镜像服务ACR，进入页面后点击左侧菜单-镜像工具-镜像加速器，阿里云给开发者分配了一个镜像加速地址，可以在这里获取，后面会用到。

### 步骤二

登录自己的云服务器进行配置。

**以下针对Ubuntu和Centos**

> 1. 安装／升级Docker客户端
推荐安装1.10.0以上版本的Docker客户端，参考文档[docker-ce](https://developer.aliyun.com/article/110806)

> 2. 配置镜像加速器
针对Docker客户端版本大于 1.10.0 的用户
您可以通过修改daemon配置文件/etc/docker/daemon.json来使用加速器

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://[开发者镜像加速地址].mirror.aliyuncs.com"]
}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```

以上。

