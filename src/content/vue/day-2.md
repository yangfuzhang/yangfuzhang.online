---
layout: ../../layouts/PostLayout.astro
title: Vue diff算法
author: yangfuzhang
description: Vue diff算法
pubDate: Nov. 30
prevUrl: /vue-posts
slug: vue-diff
---

### Vue2.0 diff算法

Vue的更新是基于虚拟DOM的，在更新时会对新旧虚拟DOM进行diff运算，源码如下：

```javascript
// src/core/vdom/patch.js
```


### Vue3.0 diff算法

Vue3.0的diff算法在2.0的基础上进行了进一步优化，源码如下：

```javascript
// src/core/vdom/patch.ts
```