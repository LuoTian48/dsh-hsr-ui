# hsr-ui — 崩坏：星穹铁道风格换肤插件

给 DeepSeek Harness Web GUI 换一套星穹铁道（Honkai: Star Rail）风格的皮肤：
深空藏青 × 鎏金的配色 + 毛玻璃效果（背景图由用户自选，插件不内置），**只改颜色与观感，不改任何布局（按钮位置等保持原样）**。

外加一个**分层动立绘**：22 层 PNG 各自带仿射矩阵逐帧合成 —— 会眨眼、眼珠跟随鼠标
（鼠标停下约 2 秒回正、生成回答时看向侧上方"思考"）、后发/裙摆有弹簧物理的轻微摆动。

| | |
|---|---|
| 主题 | 深浅两套配色、10 组可自定义颜色、对话区透明度/模糊、网页底色、背景图透明度/模糊 |
| 立绘 | 开关（快捷键 `Ctrl+H`）、大小/位置、进入退出动画、泡泡星光粒子、视线跟随（可调幅度） |
| 其它 | 右下角 DeepSeek 余额（生成回答后自动刷新）、对话窗口水平位置 |

> **素材说明**：插件**不内置任何背景图** —— 首次启动会引导你选一张自己的图（只存本机）。
> 立绘为作者自有素材。

## 安装

### 方式 A：从 GitHub 安装（推荐，一条命令）

在 DeepSeek Harness 里让 Agent 调用 `plugin_manager`：

```
action: install_bundle
target: github:<你的用户名>/<仓库名>        # 例如 github:someone/hsr-ui
```

它会自动完成「装包 + 选择 bundle + 写 profile」，**不要**手工改 profile 文件。
装完按提示重启 Harness（替换已安装的包需要重启才会加载新的 JS 模块）。

### 方式 B：本地目录安装（离线可用）

```sh
git clone https://github.com/<你的用户名>/<仓库名>.git
```

然后：

```
action: install_bundle
target: /绝对路径/hsr-ui
```

### 方式 C：手工挂载（旧方式，仅当上面两条走不通时）

1. 把本目录放到任意位置；
2. 编辑某个 profile 的 `package.json`（Web 端默认 `~/.dsh/profiles/web/`，
   桌面端 `~/.dsh/profiles/desktop/`），在 `dependencies` 里加
   `"hsr-ui": "link:<绝对路径>/hsr-ui"`；
3. 在**同一个目录**的 `cordis.patch.yml` 里加：

   ```yaml
   - insert:
       - id: hsr-ui
         name: hsr-ui
   ```

4. 在该 profile 目录执行 `pnpm install`，然后**重启** Harness（不是刷新页面）。

> ⚠️ 三种方式**不要混用**：bundle 安装与手工 insert 同时存在会出现重复的 `hsr-ui` 行 ✗，
> 表现为加载报错或行为异常。切换方式前先删掉手工那条。

### 装完怎么用

设置 → **HSR_UI**：主题配色、网页底色、背景图（浅色/深色各一张）、立绘开关与大小位置、
进入退出动画与泡泡尺寸、视线跟随开关与幅度、对话窗口水平位置。

---

# 以下是本插件的实现笔记（开发/排错用）

## 原理

界面全部颜色由 `--dsw-*` CSS 变量（token）驱动：
- 亮色在 `body { ... }` 上，深色在 `body[data-ds-dark-theme] { ... }` 上；
- 本插件以 client 插件形式在浏览器注入样式表：先覆盖两套 token 配色，再叠加背景图 + 半透明表面 + 主框架毛玻璃（`backdrop-filter`），最后是少量观感规则（如文字选中色）。

## 本地开发时的挂载方式

开发期推荐用 pnpm 的 **`link:` 协议**手工挂到某个 profile（实时链接，不是快照 ✓）：

> - `package.json` → `"hsr-ui": "link:<本仓库的绝对路径>"`
> - `node_modules/hsr-ui` → junction 指向本仓库
> - `cordis.patch.yml` → loader 条目

重启 Harness 即生效 ✓。下面命令供换机/重装时使用：

```sh
# 1. 把插件装进某个 profile（link: 协议保证改 client.js 后不用重装）
dsh plugin --profile web add "link:<本仓库的绝对路径>"

# 2. 在 ~/.dsh/profiles/web/cordis.patch.yml 末尾追加 loader 条目：
#    - insert:
#        - id: hsr-ui
#          name: hsr-ui

# 3. 重启
dsh web
```

> ⚠️ 注意：不要用 `file:` 协议安装——pnpm 会把包**快照拷贝**进 node_modules，
> 之后改 `client.js` 不会同步，还得重装。`link:` 才是实时链接。

## 背景图

**插件不再内置任何背景图**（原先内嵌的星穹铁道素材属第三方素材，且分享时会有版权顾虑）：
- CSS 的取值是 `var(--hsr-bg-light, none)` / `var(--hsr-bg-dark, none)` → 没选图时就是**主题自带的渐变底色**；
- **首次启动会弹出引导卡片**（左下角，"选择图片 / 以后再说"）：
  浏览器不允许无用户交互就弹文件框，所以给按钮点一下；代码里同时仍会尝试自动 `input.click()` 一次。
  选好的图片会**深浅两套都用它**，并写 `hsr-ui.bg-prompted` 标记，之后不再打扰；
- 之后随时可在**设置 → HSR_UI → 背景图片（浅色/深色外观）** 里更换或恢复默认。

**分层结构**（自下而上）：网页底色（`body::before`，合成在固定兜底色上）→ 背景图片
（`body::after`，含浅色/深色遮罩渐变）→ UI 内容。主框架/对话区/详情面板的全屏底色已
改为透明（双写类名提升特异性，压过 DSH 运行时注入的样式），所以**图片永远在网页底色
之上**——修改「网页底色」颜色不会盖住图片；把「网页背景透明度」调到 100% 则会完全
显示网页底色。

**背景图自适应**：`background-size: cover` + `background-position: center` + `no-repeat`
→ 任意尺寸/长宽比都铺满、居中、裁掉溢出，**不拉伸**；导入时按 `min(1, 1920/宽)` 等比压缩
（长宽比保持、只缩不放），存成 JPEG q0.85 进 localStorage。

> 想给**自己的构建**重新内置一张默认背景：把图放到 `assets/bg.jpg` / `bg-light.jpg`，
> 用旧版脚本 `set-background.ps1` 的思路把 data URI 写回 `BG_URI` / `BG_URI_LIGHT`
> 常量，并把 CSS 的 fallback 从 `none` 改回 `url("${BG_URI}")`。
> 分享包（`node tools\build-share.js`）会自动剔除内嵌背景，所以内置了也传不出去。

**想微调遮罩/透明度**：在 `client.js` 里搜 `背景图 + 半透明毛玻璃层` 附近的两段
（`body { ... }` 是浅色、`body[data-ds-dark-theme] { ... }` 是深色）：
- 改 `linear-gradient(rgba(...))` 的透明度（浅色 0.3 / 深色 0.15）→ 数值越小越透；
- 改各 `--dsw-alias-bg-layer-*`、`--dsw-specific-sidebar-fill` 等 rgba 值 → 面板通透度。

## HSR_UI 设置选项卡（可调项）

插件启用后，**设置界面左侧会多出一个「HSR_UI」选项卡**，全部即时生效、值存浏览器 `localStorage`：

| 控件 | 默认 | 作用 |
|---|---|---|
| 对话背景透明度 | 50% | 顶栏 + 对话卡片的不透明度（0% 完全不透明 → 100% 完全透明，变量 `--hsr-surface-alpha`） |
| 对话背景模糊 | 50%（=15px） | 顶栏/卡片对背景的毛玻璃模糊（0~30px，变量 `--hsr-blur`） |
| 网页背景透明度 | 0% | 背景图片的透明度：0% = 完全不透明（图片正常显示），100% = 完全透明（只显示网页底色）（变量 `--hsr-bg-image-alpha`） |
| 网页背景模糊 | 0% | 背景图本身的模糊（0~40px，变量 `--hsr-bg-blur`） |
| 对话背景水平位置 | 50% | 对话窗口的水平位置：0% 靠左、50% 居中、100% 靠右（变量 `--hsr-chat-x`） |
| 角色立绘（开关 + 大小 + 位置） | 开 / 340px / 贴底·100% | 对话窗口右侧显示透明背景立绘；大小 120~480px，垂直位置（贴底/居中/贴顶），水平位置 0~100%（100% = 窗口最右，50% = 屏幕正中间）。**快捷键 `Ctrl + H` 可随时显示/隐藏**（不需要打开设置页，与开关同步） |
| 进入 / 退出动画 | 开 | 进入：跳入 + 轻回弹（约 0.72s）+ 蓝色泡泡 / 星光从**页面底部**飘到中上部；退出：下沉淡出（约 0.44s）。关掉后立绘与粒子都只做轻微淡入淡出 |
| 泡泡大小 | 100% | 泡泡 / 星光的尺寸倍率（50%~250%，存 `hsr-ui.bubble-scale`），拖动即时生效 |
| 背景图片（浅色外观） | 默认 bg-light.jpg | 选本地图片，自动压缩成 1920px 宽 JPEG 存本地（`hsr-ui.bg-light`） |
| 背景图片（深色外观） | 默认 bg.jpg | 同上（`hsr-ui.bg-dark`），与浅色互不影响 |
| 窗口颜色（深/浅两套） | 当前皮肤颜色 | 10 个颜色项 × 浅色/深色两套，跟随通用设置的外观选项自动切换 |
| 「恢复默认颜色」按钮 | — | 一键清空颜色覆盖，回到修改前的皮肤默认色 |

## 角色立绘

- 图片原始素材在工作区 `星穹铁道素材\立绘.png`（最初那版 750×1344、纯白背景），打包前用
  `hsr-ui\scripts\convert-portrait.ps1` 把**白色背景转为透明**（flood-fill 抠白 + 边缘羽化 + 去白边），
  输出 `assets/portrait.png`；**当前内嵌的是用户后来替换的高清版**（1080×1920、透明背景、
  约 1.9MB），以 base64 内嵌在 `client.js` 的 `PORTRAIT_URI`。
- 运行时定位：固定悬浮在**对话卡片（`[data-conversation-scroll]`）存在的页面**（非对话页自动隐藏），
  按水平位置百分比映射到窗口内（留 12px 边距、不拦截鼠标）；**窗口太窄时立绘自动缩小，
  完全放不下才隐藏**，每 1.5s + resize 时重测。
- 设置页可调：**大小**（120~480px 滑块，存 `hsr-ui.portrait-width`）、
  **垂直位置**（贴底/居中/贴顶，存 `hsr-ui.portrait-vpos`）、
  **水平位置**（0~100% 滑块，100% = 窗口最右边、50% = 屏幕正中间、0% = 最左边，
  存 `hsr-ui.portrait-hpos`），全部即时生效。
- 想换立绘：把新图直接存为 `assets/portrait.png`（需要是透明背景 PNG；若是白底图先跑
  `hsr-ui\scripts\convert-portrait.ps1` 抠白），再跑 `hsr-ui\scripts\inject-portrait.js` 重新内嵌即可
  （支持重复注入，会自动替换旧的 base64）。

> 📁 本插件的历史文档、测试（`test-client.js` / `test-rig.js`）与离线分层管线都在工作区的
> **`hsr-ui\`** 目录（插件代码仍在本目录，因为 DSH profile 用 `link:` 引用这里）。详见 `hsr-ui\README.md`。

### 进入 / 退出动画 + 泡泡星光粒子

- **进入**（约 0.72s）：淡入 → 从下方跳入（34px）→ 越过一点（-7px）→ 回弹（2px）→ 落定；
  缩放原点在**脚底**（`transform-origin: 50% 100%`），所以看着像踩着地弹了一下。
- **泡泡 / 星光**（与进入同时）：**7 个蓝色泡泡**（68~136px）+ **5 颗四角星光**，
  从**页面底部**（`bottom: -30~-52px`，在视口下沿之外）冒出来，一路飘到**页面中上部**才消失——上升距离用 `vh` 写
  （`--hsr-bubble-rise: -48~-62vh`、`--hsr-spark-rise: -30~-40vh`），所以窗口变高变矮都是"从底飘到中上"。
  泡泡约 3.3~4.6s、星光约 2.6~3.4s 飘完，`linear` 匀速更像水里上浮。
  大小可在设置页用**「泡泡大小」滑块（50%~250%）**实时调，存 `hsr-ui.bubble-scale`。
- **泡泡为什么一定是正圆**：形状由 `radial-gradient(circle closest-side at 50% 50%, …)` **在几何上**定死——
  渐变半径正好等于内切圆半径、100% 处完全透明，所以圆外那四个角本来就是透明的，
  不依赖 `border-radius` 是否被别处样式覆盖（`border-radius: 50%` 只是双保险）。
  之前"有点方"的根因：渐变中心偏在左上角 + 默认按**最远角**算半径，
  于是内侧一圈半透明色被 `border-radius` 硬切出一条直边；`closest-side` + 同心铺法就没有这个问题。
  另有一圈 84%~95% 的明亮"壳"（肥皂泡质感）和内侧边缘光，圆形轮廓一眼可见。
  粒子层 `.hsr-portrait-fx` 是 **`top:0 / bottom:0` 的满页高「气泡带」**，`z-index: 14` 比立绘（15）低一层
  → 粒子**从角色身后飘过**；气泡带的**水平范围跟着立绘走**（立绘左右各外扩 18vw，且至少占 30vw），
  所以立绘拖到哪儿气泡就从哪一带升起来，不会横穿中间的对话文字。
  粒子位置/大小/上升距离/延迟是 `PORTRAIT_BUBBLES` / `PORTRAIT_SPARKS` 两张**常量表**（不用 `Math.random`，
  布局确定、可测试）。
- **退出**（约 0.44s）：「下沉 28px + 淡出 + 缩到 0.95」，像潜回水里。
- 触发：整页刷新首次出现、`Ctrl+H` / 设置开关打开、窗口从太窄恢复到放得下、从非对话页回到对话页。
  **不触发**：拖大小/位置滑块、1.5s 轮询、可见时的 resize（显示类没变化，CSS 动画不会重启）。
- 设置页可关：**「进入 / 退出动画」**开关（存 `hsr-ui.portrait-anim`，`"0"` = 关），关掉后立绘与
  粒子都只做轻微淡入淡出（即加动画之前的样子）。系统开启「减弱动态效果」
  （`prefers-reduced-motion: reduce`）时同样不播。
- 实现要点（改动画前必读）：
  1. **进入用 CSS `@keyframes`**，不用 `transition`——新插入 DOM 的元素没有 before-change style，
     transition 不会触发（整页刷新时会硬出现），而动画插入即播放。
  2. **退出也必须用 `@keyframes`**（`.hsr-portrait-leaving` → `hsr-portrait-leave`）。
     曾经用 transition 写退场（只声明目标值 `opacity: 0; translate: 0 28px`），实测**立绘会直接消失**：
     该属性刚被「进入动画」（`animation-fill-mode: both`）控制过，transition 在这种情形下不可靠。
     animation 和进入是同一套机制，挂类即播，确定可靠。
     为了彻底避免 transition 与 animation 抢同一批属性（**过渡的层叠优先级比动画还高**），
     开关打开时用 `body:not(.hsr-portrait-anim-off) .hsr-portrait { transition: none; }` 关掉基类过渡。
  3. **退场起点是动态的，且读取顺序有硬性要求**：挂 `leaving` 类之前，JS 用 `getComputedStyle()`
     把当下的 opacity / translate / scale 读出来写进 `--hsr-leave-opacity/translate/scale`。
     ⚠️ **这一读必须发生在摘掉 `hsr-portrait-visible` 类之前**——`getComputedStyle()` 会强制样式刷新，
     摘了类再读拿到的是隐藏态的 `opacity: 0`，退场 keyframes 就成了 `0 → 0`，
     表现就是"立绘直接消失、没有过渡"（这个坑踩了两轮）。另外起点 opacity 若不是正数会兜底抬回 `1`。
     顺序对了以后：进入动画只播了一半时按 `Ctrl+H`，退场会从"半透明、半位移"的当前状态接着走，不会跳变。
  4. 立绘动画**只能驱动 `opacity` / `translate` / `scale`**：`transform` 被 `placePortrait()` 用于
     垂直居中（`translateY(-50%)`），而 `translate`/`scale` 是独立属性，与 `transform` 叠加而非覆盖。
     **立绘的 keyframes 里绝对不能出现 `transform`**（`test-client.js` 有断言守护）。
     粒子是自己的 `<span>`，不受这条限制。
  5. **静止隐藏态不留位移**（只 `opacity: 0; scale: 0.96`）：`html,body,#root` 只有 `height:100%`、
     没有 `overflow: hidden`，固定定位元素长期在视口下缘溢出理论上会有滚动条，所以下沉只出现在
     退场 keyframes 里（只存在 0.44s）。
  6. 参数（0.72s / 34px / -7px、0.44s / 28px、粒子表）都集中在 CSS 与两张常量表里，直接改数值即可。

### 快捷键 Ctrl + H（显示/隐藏立绘）

- **`Ctrl + H`**：全局显示 / 隐藏角色立绘，与设置页「角色立绘」开关是同一个状态
  （存 `hsr-ui.portrait`）——按快捷键时设置页的复选框会跟着同步，反之亦然。
- 精确匹配「只按 Ctrl + H」：多按 Shift / Alt / Win 或长按自动重复都不触发；
  用 `event.code === "KeyH"` 兜底，非 QWERTY 布局也能用。
- 切换时屏幕顶部会出现 1.2s 的短提示（`角色立绘：显示 / 隐藏`）——立绘在非对话页、
  窄窗口下本来就不可见，没这个提示会以为快捷键没生效。
- 快捷键的占用检查（结论：原本没有别的功能用它）：
  - DSH 客户端注册的 `document` / `window` keydown 只处理 `Escape`（设置面板、图片灯箱、
    统计弹层、上下文面板），没有任何字母组合键；
  - 整个 DSH 安装目录里唯一的 `Ctrl+h` 在富文本编辑器（ProseMirror `baseKeymap`）的按键表里，
    被 `isMac` 判定包住——只在 macOS 且编辑器聚焦时生效，Windows 上完全没有绑定；
  - 本插件原先也没有任何按键监听，其他已装插件（vision-fallback / gpt-sovits-tts）同样没有。
  - 实现上仍加了两道保险：捕获阶段 `stopPropagation()`（不让页面内编辑器看到该组合键）
    + `preventDefault()`（拦掉浏览器默认的「打开历史记录」页）。
  - 若某个浏览器仍强行打开历史记录页（页面无权拦截的保留快捷键），可以换成别的组合键：
    改 `client.js` 里的 `isPortraitHotkey()`（判定）与设置页那条备注文案即可。

## 自定义背景图与窗口颜色（设置页）

- **背景图**：设置页选择本地图片后，先用 canvas 压到 1920px 宽、JPEG q0.85 再存
  `localStorage`（避免超配额）；浅色/深色各存一张，通过 body 上的内联变量
  `--hsr-bg-light` / `--hsr-bg-dark` 覆盖 CSS 里默认的背景 URI。
- **窗口颜色**：可编辑 10 项（页面底色、窗口背景、弹层背景、侧边栏、输入框、
  消息气泡、主文字、次要文字、强调色、主按钮），**深色/浅色各一套**。CSS 里对应
  token 已改写成 `var(--hsr-c-<key>-<theme>, <内置默认>)`，插件把用户值写成 body 的
  内联变量——通用设置里切换外观时，`body[data-ds-dark-theme]` 属性翻转，两套颜色自动跟随。
- **默认设置**：内置皮肤颜色就是「修改前的默认设置」；「恢复默认颜色」按钮清掉
  `hsr-ui.colors` 并移除内联覆盖，即回到默认皮肤。

## 右下角余额显示（DeepSeek）

- 界面**右下角**显示两行：**余额** 和 **预估消费**，**每次回答输出完成后自动刷新一次**。
- **余额**：主机半边提供路由 `GET /hsr-ui/balance`，用 DSH credentials 里的 `DEEPSEEK_API_KEY`
  请求 `https://api.deepseek.com/user/balance`，密钥不暴露给浏览器；没配 DeepSeek 密钥就返回 0、不查询。
- **预估消费**：客户端自累计——每次回答完成时读 `tokenUsage` 投影（缓存命中/未命中输入 + 输出 token），
  按**当前模型 + 峰谷时段**定价换算成金额累加到浏览器 `localStorage` 的 `hsr-ui.estimated`。
  峰谷定价表 `MODEL_PRICES` 写在 `client.js` 里，每个模型分 `peak`（高峰）/ `offpeak`（空闲）两档。
- 峰谷判定：北京时间 **9:00–12:00、14:00–18:00 为高峰**，其余空闲；高峰价 = 空闲价 × 2。
  **输入 token 按回答开始时刻计、输出 token 按回答结束时刻计**（单次回答内部不拆峰谷，跨边界时近似）。
- 只统计 DeepSeek（由余额接口的 `available` 判定）；别的 API 不累计、显示 0。
- 「HSR_UI」设置选项卡里有一行「预估消费 + 清零」按钮，可一键清零累计值（清掉 `hsr-ui.estimated` 并即时刷新徽标）。
- 注意：改了 `lib/index.js`（主机半边）后需**重启 `dsh web`**；只改 `client.js`（浏览器半边）硬刷新即可。

## 调色

直接编辑 `client.js` 顶部的 `css` 字符串即可（亮/暗两套分开改）。
常用 token：

| 用途 | token |
|---|---|
| 主背景 / 层级表面 | `--dsw-alias-bg-base`、`--dsw-alias-bg-layer-1/2/3` |
| 侧边栏 | `--dsw-specific-sidebar-fill` |
| 文字 | `--dsw-alias-label-primary/secondary/tertiary` |
| 品牌金 / 主按钮 | `--dsw-alias-brand-primary`、`--dsw-alias-button-primary-fill`、`--dsw-alias-state-business-primary` |
| 边框 | `--dsw-alias-border-l1/l2/l3/l4` |
| 状态色 | `--dsw-alias-state-error/success/warn-*` |

改完 `client.js` 后**重启 `dsh web`** 生效（客户端插件内容以启动时的哈希为准；
因为 `/plugins` 路由每次请求都读磁盘新内容，硬刷新 `Ctrl+F5` 通常也能看到）。

## 卸载

```sh
dsh plugin --profile web remove hsr-ui
# 并删除 cordis.patch.yml 里对应的 insert 条目
```
