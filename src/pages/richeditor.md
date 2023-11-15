---
layout: ../layouts/PostLayout.astro
title: Prosemirror核心概念
author: yangfuzhang
description: 富文本编辑器核心技术
date: Nov. 15
---

This guide describes the various concepts used in the library, and how they relate to each other. To get a complete picture of the system, it is recommended to go through it in the order it is presented in, at least up to the view component section.

![prosemirror mvc](/prosemirror-mvc.png)

### 视图 prosemirror-view
ProseMirror's view module displays a given editor state in the DOM, and handles user events.

### 模型 prosemirror-model
This module defines ProseMirror's content model, the data structures used to represent and work with documents.

### 状态 prosemirror-state
This module implements the state object of a ProseMirror editor, along with the representation of the selection and the plugin abstraction.

### 变更 prosemirror-transform
This module defines a way of modifying documents that allows changes to be recorded, replayed, and reordered. You can read more about transformations in the guide.

