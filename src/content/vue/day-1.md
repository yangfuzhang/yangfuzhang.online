---
layout: ../../layouts/PostLayout.astro
title: Vue响应式原理
author: yangfuzhang
description: Vue响应式原理
pubDate: Nov. 21
prevUrl: /vue
slug: vue-reactive
---

### Object.defineProperty()

Vue2.0 响应式系统的核心是通过 Object.defineProperty() 来劫持各个属性的 get 和 set，在 get 和 set 里进行依赖收集和通知。

Object.defineProperty() 接收三个参数：

- obj：需要定义属性的对象
- key：属性的 key
- descriptor：属性的描述对象

### Proxy和Reflect

与Vue2.0响应式系统不同的是，Vue3.0 响应式系统是基于 Proxy 实现的。

Proxy 是一个 ES6 新增的数据类型，它可以拦截并修改某些操作，比如：读取属性、设置属性、删除属性、调用对象方法等。

Reflect 是一个内置对象，提供操作对象属性和方法的API。



