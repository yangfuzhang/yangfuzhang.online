---
layout: ../../layouts/PostLayout.astro
title: Git常用命令
author: yangfuzhang
description: Vue响应式原理
pubDate: Dec. 7
prevUrl: /snippets-posts
slug: git-cmd
---

### 仓库初始化命令

```bash
git init

// 指定分支名称
git init --branch [branch-name]

// 例如：指定默认分支名称为main
git init --branch main
```

### 设置远程仓库地址

```bash
git remote add origin [origin-address]
```

### 查看远程仓库地址

```bash
git remote -v
```

### 修改远程仓库地址

```bash
git remote set-url origin [new-origin-address]
```

### 修改本地分支名称并推送到远程

```bash
// 修改本地分支名称
git branch -m [oldName] [newName]

// 删除旧的远程分支
git push --delete origin [oldName]

// 推送本地新分支并关联远程分支
git push origin [newName] --set-upstream orign/newName

```

### 查看当前仓库 config

```bash
git config --list

// 简写
git config -l
```

### 查看全局 config

```bash
git config --global --list

// 简写
git config --global -l
```

### 修改当前仓库 config

```bash
git config [key] [value]

// 例如：修改user.name
git config user.name "your_name"
```

### 修改全局 config

```bash
git config --global [key] [value]

// 例如：修改user.name
git config --global user.name "your_name"
```
