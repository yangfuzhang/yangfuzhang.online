---
layout: ../../layouts/PostLayout.astro
title: React Hooks 用法举例
author: yangfuzhang
description: React Hooks用法举例
pubDate: Nov. 27
prevUrl: /react-posts
slug: react-hooks-example
---

### 一、概述
> Hooks本质上就是javascript函数，可以“钩入”React的特性，最终是为了控制fiber节点的状态和副作用。

![ReactElement Fiber DOM](https://7km.top/static/code2dom.98309914.png)

```javascript
// Fiber 数据结构
export type Fiber = {|
  // ...省略的其他属性
  // 1. fiber节点自身状态相关
  pendingProps: any,
  memoizedProps: any,
  updateQueue: mixed,
  memoizedState: any,

  // 2. fiber节点副作用(Effect)相关
  flags: Flags,
  nextEffect: Fiber | null,
  firstEffect: Fiber | null,
  lastEffect: Fiber | null,
|};

// Hook 数据结构
export type Hook = {|
  memoizedState: any, // 自身状态
  baseState: any, // hook.baseQueue中所有update对象合并之后的状态
  baseQueue: Update<any, any> | null, // 存储update对象的环形链表, 只包括高于本次渲染优先级的update对象
  queue: UpdateQueue<any, any> | null, // 存储update对象的环形链表, 包括所有优先级的update对象
  next: Hook | null, // next指针
|};
```

Hooks是以链表的形式存储的，Hook拥有自身的状态**hook.memoizedState**，并有一个**next**指针指向下一个Hook。

![Hooks 结构](https://7km.top/static/hook-linkedlist.d52c2c25.png)


**Fiber与Hook的关系:**

Fiber不是函数组件特有的，每个函数组件都有对应的Fiber。在Fiber对象中有一个属性**fiber.memoizedState**指向Fiber节点的内存状态。在函数组件中, **fiber.memoizedState**就指向Hook链表(Hook链表保存了函数组件的状态)，无论状态Hook或副作用Hook都按照**调用顺序**存储在**fiber.memoizedState**链表中.使用Hook的任意一个api, 最后都是为了控制上述这几个Fiber属性。

> 只能在函数最外层调用Hooks，不要在循环、条件判断或者子函数中调用，目的是确保Hooks在每一次渲染中数量都相同，并且都按照同样的顺序被调用。

> 只能在React的函数组件或自定义Hooks中调用Hooks。

<br>

### 二、hooks分类

### 1、State Hooks
> useState <br>
  useReducer

### 2、Effect Hooks
> useEffect <br>
  useLayoutEffect <br>
  useInsertionEffect

### 3、Ref Hooks
> useRef <br>
  useImperativeHandle

### 4、Context Hooks
> useContext

### 5、Performance Hooks
> useMemo <br>
  useCallback <br>
  useTransition <br>
  useDeferredValue

### 6、Other Hooks
第三方库中可能用到，业务代码中很少用到，了解即可。
> useId <br>
  useDebugValue <br>
  useSyncExternalStore

<br>

### 三、用法举例

### 1、useState
调用方式：useState(intialState)
参数：initialState

返回值：[state, setState]

**两种更新state的方式及区别：**

setState(newState)

setState((prevState) => newState)

```javascript
const [count, setCount] = useState(0)

const onClick = () => {
  setCount(count + 1)
  setCount(count + 1)x
  setCount(count + 1)
}
// count 1

const onClick = () => {
  setCount((c) => c + 1)
  setCount((c) => c + 1)
  setCount((c) => c + 1)
}
// count 3

const onClick = () => {
  setCount(count + 5)
  setCount((c) => c + 1)
}
// count 6
```

**另一个注意点**：React会在事件处理函数中的所有**同步**代码运行之后，触发一次组件重渲染（re-render），不论是多次更新一个state，还是更新多个state，组件都只会重渲染一次。
```javascript
// 更新多个state
const [count, setCount] = useState(0)
const [num, setNum] = useState(0)

const onClick = () => {
  setCount(count + 1)
  setNum(num + 1)
}
// 触发一次组件渲染
```

**异步更新**
```javascript
const [count, setCount] = useState(0)

console.log('===app rendered===', count)

const onClick = () => {
  setCount(count + 1)

  Promise.resolve().then(() => {
    console.log('===then===', count)
    setCount(count + 3)
  })

  setTimeout(() => {
    console.log('===setTimeout===', count)
    setCount(count + 9)
  }, 0)
}
// onClick，组件重渲染3次
// ===app rendered=== 1
// ===then=== 0
// ===app rendered=== 3
// ===setTimeout=== 0
// ===app rendered=== 9
```

**更新对象Object和嵌套对象**
```javascript
// 扁平对象
const [userInfo, setUserInfo] = useState({
  name: 'zhangsan',
  age: 24,
  city: 'shenzhen',
})

const handleNameChange = (e) => {
  setUserInfo({
    ...useInfo,
    name: e.target.value
  })
}

// 错误用法，组件不会重新渲染
// React will ignore your update if the next state is equal to the previous state, as determined by an Object.is comparison.
const handleNameChange = (e) => {
  userInfo.age = 30
  setUserInfo(userInfo);
}

// 嵌套对象
const　[userInfo, setUserInfo] = useState({
  name: 'zhangsan',
  age: 24,
  department: {
    name: '研发部',
    count: 16
  }
})

// ...扩展运算符是浅拷贝
const handleDepartmentNameChange = () => {
  setUserInfo({
    ...userInfo,
    department: {
      ...userInfo.department,
      name: '市场部'
    }
  });
}

```

### 2、useReducer
调用方式：useReducer(reducer, initialArg, init?)
> reducer函数，参数为state和action，返回新的state

> init函数可选，用于计算初始值

返回值：[state, dispatch]
> state的初始值initialState = init ? init(initialArg) : initialArg

> dispatch函数，参数为action，返回值为undefined

```javascript
const myReducer = (state, action) => {
  if (action.type === 'increment') {
    return {
      ...state,
      count: state.count + 1,
    }
  }

  if (action.type === 'decrement') {
    return {
      ...state,
      count: state.count - 1,
    }
  }

  if (action.type === 'nameChange') {
    return {
      ...state,
      name: action.payload.name,
    }
  }

  throw new Error('Unknown action type.')
};

const [state, dispatch] = useReducer(myReducer, {
  name: 'test',
  count: 0
})

const onIncrement = () => {
  dispatch({
    type: 'increment'
  })
}

const onDecrement = () => {
  dispatch({
    type: 'decrement'
  })
}

const onNameChange = () => {
  dispatch({
    type: 'nameChange',
    payload: { name: 'New Name' }
  })
}
```

### 3、useEffect
调用方式：useEffect(setup, dependencies?)

返回值：undefined

> setup函数可以选择性地返回一个销毁（cleanUp）函数，在组件卸载时调用

> dependencies可选。若不传，每次组件重渲染，setup函数都会执行；若传[]，只会执行一次

**父子组件useEffect（setup, []）执行的先后顺序**
> 子组件useEffect（setup, []） -> 父组件useEffect（setup, []） -> 子组件cleanUp函数 -> 父组件cleanUp函数

**闭包陷阱**
```javascript
// 例子：实现count每秒自动加1

// 方式一（错误）
const [count, setCount] = useState(0)
// count变为1后，不再变化
console.log(count)
useEffect(() => {
  const interval = setInterval(() => {
    // 0
    // console.log(count)
    setCount(count + 1)
  }, 1000)

  return () => { clearInterval(interval) }
}, [])

// 方式二，使用setState((c) => c + 1)
const [count, setCount] = useState(0)
// count每秒加1
console.log(count)
useEffect(() => {
  const interval = setInterval(() => {
    // 这里打印count依然是初始值0
    // console.log(count)
    setCount((c) => c + 1)
  }, 1000)

  return () => { clearInterval(interval) }
}, [])

// 方式三，使用useRef
const [count, setCount] = useState(0)
// 始终保存最新的count
const countRef = useRef(count)
countRef.current = count

useEffect(() => {
  const interval = setInterval(() => {
    setCount(countRef.current + 1)
  }, 1000)

  return () => { clearInterval(interval) }
}, [])
```

**不推荐使用useEffect的情况**
- 依赖state或props来更新state
```javascript
const [firstName, setFirstName] = useState('Michael')
const [lastName, setLastName] = useState('Jacksoon')

// 不推荐的用法
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(firstName + ' ' + lastName)
}, [firstName, lastName])

// 推荐的用法，有点类似Vue中的computed
const fullName = firstName + ' ' + lastName
```
结论：当某个值可以根据已经存在的state或props计算得出，就不需要将这个值放在state中，因为state和props发生变化时，组件会重新渲染，计算出最新的值，而使用useEffect去更新state会导致不必要的更新。

但是，上述写法**可能**引入一个新的问题：
```javascript
const getTotal = (cnt) => {
  let sum = 0;
  for (let i = 0; i < cnt; i++) {
    sum += i;
  }
  return sum;
}

const [count, setCount] = useState(10000)
const [num, setNum] = useState(0)
const total = getTotal(count)

// 问题：更新num会导致组件更新，total也会重新计算，在计算比较耗时的情况下，会存在性能问题
const onNumChange = () => {
  setNum(num + 1)
}

// 优化：useMemo
// count更新时才会重新计算total
const total = useMemo(() => {
  return getTotal(count)
}, [count])
```

### 4、useLayoutEffect
调用方式：useLayoutEffect(setup, dependencies?)

返回值：undefined

**与useEffect的不同之处**
> setup函数调用的时机不一样，useLayoutEffect的setup函数会在浏览器将新的Dom渲染到屏幕（repaints to screen）之前调用，而useEffect则是在渲染之后调用。

```javascript
// 调用顺序跟书写的先后顺序无关
useEffect(() => {
  console.log('===useEffect===')
}, [])

useLayoutEffect(() => {
  console.log('===useLayoutEffect===')
}, [])
```

> useLayoutEffect会在所有的 DOM 变更之后同步调用 effect，会阻塞浏览器渲染，对性能有一定影响，useEffect不会阻塞浏览器渲染。

```javascript
// 应用场景：DOM在绘制到浏览器屏幕之前，某些元素的位置或尺寸依赖另一个元素的位置或尺寸
// 用useEffect可能出现闪烁现象
const divRef = useRef(null)
const [divHeight, setDivHeight] = useState(0)


useLayoutEffect(() => {
  const { height } = divRef.current.getBoundingClientRect();
  // 此时DOM还没有绘制到屏幕，又更新了state，立即触发一次重渲染，更新DOM后绘制到屏幕
  setDivHeight(height);
}, [])

// 可以在控制台->performance把CPU调慢看效果
// useEffect(() => {
//   const { height } = divRef.current.getBoundingClientRect();
//   // 此时DOM已经绘制到屏幕，又更新了state，再次绘制
//   setDivHeight(height);
// }, [])

<div style={{ position: 'relative', background: '#f5f5f5' }}>
  <p>111</p>
  <p>222</p>
  <div style={{
      position: 'absolute',
      left: 0,
      top: `${divHeight}px`,
      background: '#000',
      color: '#fff'
    }}
  >
    Extra content
    </div>
</div>
```

**实际应用中，应尽可能使用标准的 useEffect 以避免阻塞视觉更新**

### 5、useInsertionEffect
调用方式：useInsertionEffect(setup, dependencies?)

返回值：undefined
> 用于动态注入`<style>`标签，一般用于第三方css-in-js库中，仅作了解即可。

### 6、useRef
调用方式：useRef(initialValue)
返回值： { current: value }

> 利用useRef解决闭包问题（参见useEffect）

aHooks使用useRef实现的useLatest，解决闭包问题：[Github issue](https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useLatest/index.ts)

> useRef另一个典型应用是保存和操作Dom

```javascript
const inputRef = useRef(null)

return (
  <>
    <button onClick={() => { inputRef.current.focus() }}>Focus input</button>
    <input ref={inputRef} />
  </>
)
```

> ref不能直接赋值给自定义组件，需要配合forwardRef转发ref。

```javascript
import { useRef } from 'react'
export default function App() {
  const myRef = useRef(null)

  const onClick = () => {
    if (myRef.current) {
      myRef.current.focus()
    }
  }

  return (
    <>
      <button onClick={onClick}>App Button</button>
      <CustomComponent ref={myRef} />
    </>
  )
}

// CustomComponent.jsx
import { forwardRef }  from 'react'
function CustomComponent(props, ref) {
  return (
    <>
      <div>Custom Component</div>
      <input ref={ref} />
    </>
  )
}
export default forwardRef(CustomComponent)
```

> 改变ref.current的值，不会触发组件re-render。

```javascript
const countRef = useRef(0)

const onClick = () => {
  countRef.current += 1
}

// 视图不会更新
<div>{countRef.current}</div>
<button onClick={onClick}>+1</button>
```

### 7、useImperativeHandle
调用方式：useImperativeHandle(ref, createHandle, dependencies?)

返回值：undefined

```javascript
// 自定义暴露给父组件的ref句柄
import { forwardRef, useRef, useImperativeHandle } from 'react'

const MyInput = forwardRef(function MyInput(props, ref) {
  const inputRef = useRef(null)

  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputRef.current.focus();
      },
      scrollIntoView() {
        inputRef.current.scrollIntoView();
      },
    }
  }, [])

  return <input {...props} ref={inputRef} />
})
```

> 只在必要的时候（例如实现滚动、聚焦、选择文本、动画等）才使用这种命令式的方法，尽量用props和callback的方式实现功能。

### 8、useContext
调用方式：useContext(SomeContext)

返回值：SomeContext.Provider的value属性值

> SomeContext由React.createContext创建。

> Context值更新时，所有useContext的组件都会更新，即使props和state没有任何变化。

```javascript
// Contexts.js
import { createContext } from 'react'
export const ThemeContext = createContext(null)

// App.jsx
import { ThemeContext } from './Contexts'
import MyComponent from './MyComponent'

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('light')

  const onChangeTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    setCurrentTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={currentTheme}>
      <button onClick={onChangeTheme}>Change theme</button>
      <MyComponent />
    </ThemeContext.Provider>
  )
}

// MyComponent.jsx
import { useContext } from 'react'
import { ThemeContext } from './Contexts'

export default function MyComponent() {
  const theme = useContext(ThemeContext)

  const style = {
    background: theme === 'dark' ? '#000' : '#fff',
    color: theme === 'dark' ? '#fff' : '#000',
  }
  
  return <div style={style}>`Theme value is ${theme}`</div>
}
```

### 9、useMemo
调用方式：useMemo(calculateValue, dependencies?)

返回值：首次渲染，calculateValue函数的返回值；组件更新，缓存值（dependencies未发生变化）或calculateValue函数重新计算后的值（dependencies变化）

> useMemo通常用于需要复杂计算得到的值。

### 10、useCallback
调用方式：useCallback(fn, [denpendencies?])

返回值：首次渲染，fn；组件更新，缓存的fn或新的fn（denpendencies变化）

**useCallback和useMemo的唯一区别：**
> useCallback缓存的是函数，useMemo缓存的是函数执行后的返回值。
useCallback(fn, deps)等价于useMemo(() => fn, deps)

```javascript
const [count, setCount] = useState(0)

const memoizedFn = useCallback(() => {
  console.log(count)
}, [count])

// 等价形式
const memoizedFn = useMemo(() => {
  return () => {
    console.log(count)
  }
}, [count])
```

**使用场景**
> useCallback通常配合React.memo使用，用于避免组件不必要的更新，单独使用useCallback并不能阻止子组件渲染。

```javascript
// App.jsx
import { useState, useCallback } from 'react'
import Child from './Child'

export default function App() {
  const [count, setCount] = useState(0)
  const [num, setNum] = useState(0)

  const handleAppClick = () => {
    setNum(num + 1)
  }

  const handleAppClick = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  return (
    <div>
      <div>`num is ${num}`</div>
      <button onClick={handleAppClick}>App Button</button>
      <Child count={count} onClick={handleChildClick} />
    </div>
  ) 
}

// Child.jsx
import React from 'react'

function Child({count, onClick}) {
  const handleClick = () => {
    onClick()
  }

  return (
    <div>
      <div>`count is ${count}`</div>
      <button onClick={handleClick}>Child Button</button>
    </div>
  )
}

export default React.memo(Child)
```

> React.memo可以选择性地传入一个函数作为第二个参数，用于比较props是否相等，默认的比较函数只进行浅比较（shallow equality）。

> 有一种情况：传给子组件的props没有任何变化，函数也使用了useCallback缓存，子组件也用了React.memo，子组件依然会重渲染，这时候注意是否使用了context（可能使用的第三方库是采用context实现的）。

### 11、useTransition
调用方式： useTransition()

返回值： [isPending, startTransition]

> isPending类型为Boolean，表示transition是否被挂起。
> startTransition类型为Function，接收一个函数作为参数，函数内部可以进行state的更新操作。

```javascript
const [isPending, startTransition] = useTransition()
const [currentTab, setCurrentTab] = useState(1)

const onClick = (tabKey) => {
  if (currentTab === tabKey) return
  startTransition(() => {
    setCurrentTab(tabKey)
  })
}
```

**注意**
- 传给startTransition的函数必须是同步的。
```javascript
startTransition(() => {
  // isPending = true
  setTimeout(() => {
    // isPending = false
    setCount(1)
  }, 1000)
  // isPending = false
})
```

- startTransition中的更新可以被打断，等待高优先级任务（如input输入）执行完成后，重新渲染。

### 12、useDeferredValue
调用方式：useDeferredValue(value)

返回值：首次渲染，默认value；更新时，先用旧value渲染，然后在后台用新的value重新渲染

```javascript
const [value, setValue] = useState('')
const deferredValue = useDeferredValue(value)

// deferredValue的更新会慢一步
console.log('value deferredValue', value, deferredValue)
console.log('value === deferredValue', value === deferredValue)

const onInputChange = (e) => {
  setValue(e.target.value)
}

<input value={value} onChange={onInputChange}>
```

<br>


### 参考资料：
> React官方文档: [https://react.dev/](https://react.dev/)<br>
图解React原理系列: [https://7km.top/](https://7km.top/)