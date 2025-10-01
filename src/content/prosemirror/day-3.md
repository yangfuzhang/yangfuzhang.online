---
layout: ../../layouts/PostLayout.astro
title: Prosemirror自定义视图
author: yangfuzhang
description: Prosemirror自定义视图
pubDate: Dec. 14
prevUrl: /prosemirror-posts
slug: custom-view
---

Prosemirror 有三种自定义视图的方式

### toDOM

### pluginView

```typescript
type PluginView = {
  // 每次编辑器状态（state）更新时都会调用
  update: (view: EditorView, prevState: EditorState) => void
  // Called when the view is destroyed or receives a state with different plugins.
  destroy: () => void
}

const myPlugin = new Plugin({
  view(view: EditorView) => PluginView,
});
```

### nodeView
