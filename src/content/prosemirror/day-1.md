---
layout: "@/layouts/PostLayout.astro"
title: Prosemirror的基本使用
author: yangfuzhang
description: Prosemirror基础搭建
pubDate: Nov. 15
prevUrl: /prosemirror-posts
slug: basic-usage
---

> Prosemirror 官方文档：<a class="markdown-link" href="https://prosemirror.net" target="_blank">传送门</a>

Prosemirror 并不是一个开箱即用的富文本编辑器，在项目中直接使用还是有一定的理解和开发成本的，一个比较流行且好用的基于 Prosemirror 的封装是<a href="https://tiptap.dev/" target="_blank">tiptap</a>，该项目是<a href="https://github.com/ueberdosis/tiptap" target="_blank">开源</a>的，也是一个比较好的 Prosemirror 学习资源。

本文不对 tiptap 作过多介绍，仅介绍如何在项目中直接使用 Prosemirror。

### 初始化项目

Prosemirror 是用原生 js 开发的，并不依赖特定的前端框架，选择你自己喜欢或熟悉的框架初始化项目即可。

### 安装 Prosemirror 相关依赖

```bash
pnpm add prosemirror-model prosemirror-state prosemirror-view prosemirror-schema-basic prosemirror-schema-list prosemirror-example-setup
```

因为 Prosemirror 的代码都分散在不同的仓库，依赖比较多 😂，这里作一个简单的介绍：

> prosemirror-model：提供文档模型，包括文档树、节点、标记、文本等，是 Prosemirror 的核心.<br>
> prosemirror-state：提供文档状态管理，包括文档树、文档视图、文档变化等。<br>
> prosemirror-view：提供文档视图，包括文档渲染、文档交互等。<br>
> prosemirror-schema-basic：提供基础 schema，包括块节点、块标记等。<br>
> prosemirror-schema-list：提供 HTML 列表的 schema，包括列表节点、列表标记等。<br>
> prosemirror-example-setup：提供一个基本的编辑器，包括菜单、快捷键等。<br>

### 使用

```js
import { Schema, DOMParser } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from "prosemirror-schema-list"
import { exampleSetup } from 'prosemirror-example-setup';

// 定义schema
const exampleSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})

// 编辑器初始内容
// 注意：window.DOMParser是浏览器原生的DOMParser对象
// MDN文档：https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
const initialContent = new window.DOMParser().parseFromString(`<p>Hello world!<strong>bold text</strong></p>`, "text/html")

// 自定义插件
const myPlugin = new Plugin({
  key: 'myPlugin',
  props: {},
  view(editorView) {
    update(view, prevState) {},
    destroy() {},
  },
  state: {
    init() {},
    apply(tr, value, oldState, newState) {},
  }
})

// 编辑器状态初始化
const exampleState = EditorState.create({
  // 注意：这里的DOMParser是prosemirror-model提供的，需要与浏览器原生的DOMParser对象区分开来
  doc: DOMParser.fromSchema(exampleSchema).parse(initialContent),
  plugins: [...exampleSetup({schema: exampleSchema}), myPlugin]
})


// 创建编辑器视图，并挂载到DOM元素上
window.view = new EditorView(document.querySelector("#editor"), {
  state: exampleState,
  // 其他props
}
```
