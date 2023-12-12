---
layout: ../../layouts/PostLayout.astro
title: Prosemirror核心概念
author: yangfuzhang
description: Prosemirror核心概念
pubDate: Nov. 26
prevUrl: /rich-editor
slug: core-concepts
---

个人觉得prosemirror的概念还是比较难理解的，在深入源码之前，有必要对这些概念有一个大致的了解。
 
### schema

shema用于定义编辑器的文档模型，一个基本的schema定义如下：

```typescript
import { Schema } from "prosemirror-model";

// schema由nodes和marks组成
const exampleSchema = new Schema({
  nodes: {
    // doc必须定义
    doc: {
      content: "paragraph+"
    },
    paragraph: {
      content: "text*",
      group: "block",
      // DOM的解析规则。
      // 这条规则的意思是：如果遇到p标签，就解析为paragraph节点
      parseDOM: [{ tag: "p" }],
      // 转换为DOM的规则。
      // 这条规则的意思是：如果遇到paragraph节点，就转换为p标签，0叫做“洞”（hole），表示可以插入内容
      toDOM(node) { return ["p", 0] },
    },
    text: {}
  },
  marks: {
    strong: {
      parseDOM: [{ tag: "strong" }],
      toDOM() { return ["strong"] }
    }
  }
});
```

### selection

prosemirror的选区系统。

```typescript
new Selection(
  $anchor: ResolvedPos,
  $head: ResolvedPos,
  ranges: readonly SelectionRange[]
)
```

### slice

```typescript
new Slice(
  content: Fragment,
  openStart: number, // slice开头未闭合的标签深度
  openEnd: number // slice结尾未闭合的标签深度
)
```

### transactions

prosemirror借鉴了redux的思想，不直接修改state，而是在旧的state的基础上，通过dispatch(transaction)生成新的state。

### steps

step是文档修改的最小单位，一个tranaction可以包含多个steps，保存在transaction的steps属性中。

### mapping

文档经过一系列steps修改后，可以通过mapping将旧的位置映射到新的位置。

### commands

编辑器命令，可以通过keymap建立键盘快捷键与命令之间的映射。

### plugins

插件系统用于为编辑器添加额外的功能，一个简单的插件定义如下：

```typescript
const myPlugin = new Plugin({
  // 插件名称
  name: "myPlugin",
  // 插件初始化函数
  init() {
    // 插件初始化时，将插件的state初始化为一个空对象
    this.state = {};
  },
  // 插件的状态更新函数
  apply(tr, state) {
    // 根据tr和state更新插件state
    if (tr.docChanged) {
      this.state = {...this.state,...state.toJSON() };
    } else {
      this.state = {...this.state };
    }
}
```
