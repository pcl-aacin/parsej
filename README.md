<div align="center">
	<img src="icon.png" height="160" /> <br/>

# Parse.JS
A project that imports .js,. ts, .cjs, and .mjs by [Babel](https://github.com/babel/babel)
 
<img src="https://img.shields.io/github/license/pcl-aacin/parsej?style=for-the-badge">
<img src="https://img.shields.io/github/forks/pcl-aacin/parsej?style=for-the-badge">
<img src="https://img.shields.io/github/stars/pcl-aacin/parsej?style=for-the-badge">
<img src="https://img.shields.io/github/issues/pcl-aacin/parsej?style=for-the-badge">
<img src="https://img.shields.io/github/issues-pr/pcl-aacin/parsej?style=for-the-badge">

<br />
<br />

<a href="https://github.com/pcl-aacin/parsej/wiki">❓ Wiki</a> · <a href="https://github.com/pcl-aacin/parsej/tree/main/dist" target="_blank">📦 Prebuild</a> · <a href="#-feature-function" target="_blank">📒 Feature</a>

<!-- 项目并不完善，欢迎 issue -->
_The project is not perfect, welcome to issue!_
</div>

## 🤔 What Can It Do?
<!--
它是为了更好的调用目标脚本而生。

首先，当然是最基本的功能啦~

它借用了 Babel 的 Presets 实现了单一环境下对于 CommonJs / Module 的调用，同时也支持 TypeScript 代码，这使得它可以在任何 V8 环境下调用 js / cjs / mjs / ts 文件。

同时，它对目标脚本的导入、导出进行了处理。

它允许你对目标脚本自定义导入路径，支持 require / import / import from。

并且，它将 Module 的 impot from 静态导入全部转换成了 import 动态导入，并做了完善的适配。

然后，就是它允许你在目标脚本的根下使用 await 异步执行。

再有，也是很棒的一点，它支持你对目标脚本定义全局变量，且不需要在目标脚本增加任何代码以引入这些变量！

这超酷的！（好吧是我自己认为的）
-->

**Born to make invoking target scripts even cuter!** 🌟

**Let's dive into its core features:** 💖

Taking cues from Babel's Presets, it handles CommonJS/Module calls seamlessly, making it friendly to TypeScript code. It effortlessly handles various file types in V8 environments.

But that's not all! 🎉

It's more than just calling scripts—it's about managing imports and exports gracefully!

Imagine this: customizing import paths for target scripts, supporting **require/import/import from**. *Isn't that charming?* 💫

And here's the kicker: it turns static imports into dynamic ones, adding a touch of elegance!

But wait, there's more! 🚀

You can utilize **await** for asynchronous execution at the root of target scripts.

Oh, and the icing on the cake: defining global variables without any import fuss!

~~*It is so cool!* 🤩~~ (Alright, it's just what I thought! 🥺)

## 🚀 Getting Started
<!-- 十分抱歉，我最终还是决定在其完工前绝不发布到 npmjs -->
I'm very sorry, but in the end, I have decided not to publish it to [NPMJS](https://www.npmjs.com/) until it is completed.

<!--
第一步：将其克隆到你的项目中 Project/
```
git clone https://github.com/pcl-aacin/parsej.git
```

第二步：进入目录 Project/parsej
```
cd parsej
```

第三步：查看依赖是否齐全
```
yarn install
```

第四步：恭喜你！

其实你只需要下载 [Prebuild](https://github.com/pcl-aacin/parsej/tree/main/dist) 里的 js / mjs 直接调用就好了（小声逼逼）

别打我！
-->
**1️⃣ First step:** Clone it into your Project/ directory.
```
git clone https://github.com/pcl-aacin/parsej.git
```

**2️⃣ Second step:** Navigate to the Project/parsej directory.
```
cd parsej
```

**3️⃣ Third step:** Check if all dependencies are in place.
```
yarn install
```

**4️⃣ Fourth step:** Congratulations!

Actually, all you need to do is download the files from [Prebuild](https://github.com/pcl-aacin/parsej/tree/main/dist) and import one of them directly (whispering 😜).

Please don't hit me! 🧎‍♂️

## 🧪 Basic Usage
<!--
为了更简单明了的阐述，我现在直接示范：我有一个文件 test.ts，内容如下：

``` ts
import * as fs from "fs";

console.log("I'm in", fs.realpathSync(""));
console.log(await new Promise(okay => okay("Hello World!")));
console.log("Oh! Now is", time);

export default fs.realpathSync("");
```

好啦，现在让我们进入 nodejs 的 repl（但是我是在 bunjs 下开发的啊），执行：

``` js
> const parsec = require("./parsec.js");
> const parser = parsec("./test.ts", { time: Date.now(""==) }, {});
> consg result = parser();
```

嗯对！现在 repl 会输出这些东西：

``` repl
I'm in /root/parsej
Hello World!
Oh! Now is 1706422654706
```

太酷啦！

现在还有些其他的，比如 parser，现在的它是一个 `[ Function: bound ] AsyncFunction` 类型的变量，就先说它的两个属性，`export`和`source`。

`source` 是转换后待运行的代码，本例子中是：

``` js
async (store, {
  time
}) => {
  const fs = await import("fs");
  console.log("I'm in", fs.realpathSync(""));
  console.log(await new Promise(okay => okay("Hello World!")));
  console.log("Oh! Now is", time);
  store.export("const", "default", fs.realpathSync(""));
};
```

`export` 就是导出的内容，它是一个 `Map`，本例子中是：

```js
Map(1) {
  "default" => "/root/parsej"
}
```

result 其实没什么好说的，就是一个 Promise，在运行完成后结束。

现在你懂了吧？
-->

**To make things clearer, let me demonstrate directly: Say, I have a file called test.ts with the following content:**

```typescript
import * as fs from "fs";

console.log("I'm in", fs.realpathSync(""));
console.log(await new Promise(okay => okay("Hello World!")));
console.log("Oh! Now is", time);

export default fs.realpathSync("");
```

**Alright, now let's hop into the Node.js REPL (but wait, I'm actually developing in BunJS), and execute:**

``` javascript
> const parsec = require("./parsec.js");
> const parser = parsec("./test.ts", { time: Date.now() }, {});
> const result = parser();
```

**Voila! The REPL will now output these fancy things:**

``` plaintext
I'm in /root/parsej
Hello World!
Oh! Now is 1706422654706
```

**How cool is that?**

**Now, onto some other things, like `parser`. Currently, it's a variable of type `[ Function: bound ] AsyncFunction`. Let's discuss its two properties: `export` and `source`.**

**`source` is the transformed code awaiting execution, in this example:**

``` javascript
async (store, {
  time
}) => {
  const fs = await import("fs");
  console.log("I'm in", fs.realpathSync(""));
  console.log(await new Promise(okay => okay("Hello World!")));
  console.log("Oh! Now is", time);
  store.export("const", "default", fs.realpathSync(""));
};
```

**`export` contains the exported content, which is a `Map` in this case:**

``` javascript
Map(1) {
  "default" => "/root/parsej"
}
```

**As for `result`, there's not much to say; it's just a Promise that resolves after execution.**

**Now, do you get it? 😎**

## 😆 Some Suggestions When Developing
<!--
如你所见，它支持你对目标脚本定义全局变量，且无需做任何事情。但这会导致在编辑器中将此标为错误内容，我的建议是使用 ts 书写，并且加上 types.d.ts 并声明。
-->

As you can see, it supports defining global variables for target scripts without you having to lift a finger. But, alas, this may trigger an error in your editor. My suggestion? Scribble in TypeScript and sprinkle in a types.d.ts file with declarations. 📝✨

## 📒 Feature Function
<!-- TypeScript 类型声明处理 -->
- [ ] TypeScript Type Declaration
- [ ] Automic Rollup TypeScript Type Declaration