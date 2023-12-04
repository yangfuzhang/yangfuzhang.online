---
layout: ../../layouts/PostLayout.astro
title: Vue响应式原理
author: yangfuzhang
description: Vue响应式原理
pubDate: Nov. 21
prevUrl: /vue-posts
slug: vue-reactive
---

### Object.defineProperty()

Vue2.0 响应式系统的核心是通过 Object.defineProperty() 来劫持各个属性的 get 和 set，在 get 和 set 里进行依赖收集和通知。

```javascript
Object.defineProperty(obj, key, descriptor)
```

Object.defineProperty() 接收三个参数：

- obj：需要定义属性的对象
- key：要定义或修改的属性的名称
- descriptor：被定义或修改的属性描述符

比较核心的是 descriptor，它有很多可选键值，具体可参阅<a target="_blank" href='https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty'>文档</a>。这里我们最关心的是 get 和 set，get 是一个给属性提供的 getter 方法，当我们访问了该属性的时候会触发 getter 方法；set 是一个给属性提供的 setter 方法，当我们对该属性做修改的时候会触发 setter 方法。

**Vue2.0 响应式实现的基本流程如下：** 初始化时，通过Object.defineProperty()定义data中每个属性的get方法，get方法会在读取属性值时调用，该方法实例化了一个Dep类，进行依赖收集，每个依赖都是一个Watcher实例。同时，定义每个属性的set方法，该方法会在属性值变化时调用，通过调用Dep类的notify方法，通知所有依赖Wathcer调用update方法进行更新。

### Proxy

与Vue2.0响应式系统不同的是，Vue3.0 响应式系统是基于 Proxy 实现的。

Proxy 是一个 ES6 新增的数据类型，它可以拦截并修改某些操作，比如：读取属性、设置属性、删除属性、调用对象方法等，属于一种“元编程”（meta programming），即对编程语言进行编程。

```javascript
const proxy = new proxy(target, handler)
```

Proxy 主要解决了Object.defineProperty()存在的如下几个问题：
- 需要深度遍历对象的每一个属性进行劫持，对象嵌套过深时存在性能问题
- 检测不到对象的添加和删除，需要通过vm.$set方法作特殊处理
- 无法监控到数组下标的变化，需要对数组方法重写来实现响应式
 



