---
layout: ../../layouts/PostLayout.astro
title: Prosemirror核心概念
author: yangfuzhang
description: Prosemirror核心概念
pubDate: Nov. 26
prevUrl: /rich-editor
slug: core-concepts
---

个人prosemirror的概念还是比较难理解的，但在深入源码之前，有必要对这些概念有一个大致的了解。
 
### schema

schema定义了文档的结构，包括节点类型、节点属性、节点内容等，以及与DOM相互转换的规则。

```typescript
import { Schema } from "prosemirror-model";

const exampleSchema = new Schema({
  nodes: {
    doc: {
      content: "paragraph+"
    },
    paragraph: {
      content: "text*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM(node) { return ["p", 0] },
    },
    text: {}
  }
});
```

### selection

prosemirror的选区系统。

### slice

```typescript
new Slice(
  content: Fragment,
  openStart: number, // slice开头未闭合的标签深度
  openEnd: number // slice结尾未闭合的标签深度
)
```

### transactions

prosemirror遵循数据不可变的原则，所有的修改都是在旧的state的基础上，通过dispatch(transaction)生成新的state，借鉴了redux的思想。

### steps

step是文档修改的最小单位，一个tranaction可以包含多个steps，保存在transaction的steps属性中。

### mapping

### commands

编辑器命令，可以通过keymap建立键盘快捷键与命令之间的映射。

### plugins
