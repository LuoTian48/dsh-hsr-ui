# dsh-hsr-ui

**简体中文** | [English](README.en.md)

给 **DeepSeek Harness** 换一套 **崩坏：星穹铁道** 风格的皮肤：深空藏青 × 鎏金配色、
毛玻璃表面、自选背景图，外加一个会眨眼、眼珠跟随鼠标的**分层动立绘**。

**只改颜色与观感，不改任何布局** —— 按钮位置、交互、快捷键一律保持原样。

> **Web 端**（`dsh web`）与**桌面端**（DeepSeek Harness 桌面应用）都支持 ✓

> 🤖 **本项目全程由 DeepSeek Harness 编写完成** —— 插件代码（浏览器半边约 2600 行、主机半边、
> 22 层分层立绘的离线管线）、全部文档以及 **179 条回归测试**，都是它在多轮对话中生成、重构与维护的；
> 立绘 / 背景等素材与设计取舍由作者提供与把关 ✓。

<sub>A Honkai: Star Rail themed skin for DeepSeek Harness — deep-space navy & gold palette,
glass surfaces, a user-chosen background image, and a layered animated portrait that blinks
and follows the pointer. Restyles colors only; the layout is untouched. Works with both the
`dsh web` and the desktop app.</sub>

## 特性

| | |
|---|---|
| **主题** | 深浅两套配色；10 组颜色可自定义；对话区透明度 / 模糊；网页底色；背景图透明度 / 模糊 |
| **立绘** | 22 层 PNG 逐帧合成的动立绘：真实眨眼、眼珠跟随鼠标（停下约 2 秒回正、生成回答时看向侧上方）、发丝与裙摆的弹簧轻摆；可开关（`Ctrl + H`）、调大小与位置、进入 / 退出动画 + 泡泡星光粒子 |
| **背景图** | 由你自选（插件**不内置**）；`cover` 自适应任意尺寸，不拉伸；自动压缩后只存本机 |
| **其它** | 右下角 DeepSeek 余额（每次回答完成后自动刷新）；对话窗口水平位置可调 |

## 安装

> 包名、bundle 行名、仓库名三者一致：`dsh-hsr-ui` ✓

**方式 A · 从 GitHub 安装**（推荐，一条命令）——在 Harness 里让 Agent 调用 `plugin_manager`：

```
action: install_bundle
target: github:LuoTian48/dsh-hsr-ui
```

它会自动完成「装包 → 选择 bundle → 写 profile」✓，**不要**手工改 profile 文件 ✗。
装完按提示重启 Harness ✓（替换已安装的包需要重启才会加载新的 JS 模块 ✓）。

**方式 B · 本地目录安装**（离线可用）：

```sh
git clone https://github.com/LuoTian48/dsh-hsr-ui.git
```

```
action: install_bundle
target: /克隆目录的绝对路径
```

**方式 C · 手工挂载**（仅当上面两条走不通时）：

1. 把本目录放到任意位置；
2. 在某个 profile 的 `package.json`（Web 端 `~/.dsh/profiles/web/`，桌面端 `~/.dsh/profiles/desktop/`）
   的 `dependencies` 里加：`"dsh-hsr-ui": "link:<本仓库绝对路径>"`；
3. 同一目录的 `cordis.patch.yml` 里加：

   ```yaml
   - insert:
       - id: dsh-hsr-ui
         name: dsh-hsr-ui
   ```

4. 在该 profile 目录执行 `pnpm install`，然后**重启** Harness（不是刷新页面）。

> ⚠️ 三种方式**不要混用** —— bundle 安装与手工 insert 同时存在会出现重复的 `dsh-hsr-ui` 行 ✗。

## 使用

装好后，**设置 → HSR_UI**（全部即时生效，值存在浏览器 `localStorage`）：

| 控件 | 默认 | 作用 |
|---|---|---|
| 对话背景透明度 / 模糊 | 50% / 50% | 顶栏与对话卡的毛玻璃强度 |
| 网页背景透明度 / 模糊 | 0% / 0% | 背景图本身的浓淡与模糊 |
| 网页底色 | 浅 0.66 / 深 0.35 | 所有页面的底板，同时决定「背景图被压多暗」——字看不清就往不透明调 ✓ |
| 窗口背景 | 浅 `#fbfaf6` / 深 `#161d30` | 面板、卡片、悬浮预览的底色 |
| 背景图片（浅色 / 深色外观） | 无 | 选一张自己的图（自动压到 1920px 宽、只存本机）；可恢复默认（= 纯渐变底色） |
| 对话窗口水平位置 | 50% | 0% 靠左、50% 居中、100% 靠右 |
| 角色立绘 | 开 / 340px / 贴底 / 100% | 大小 120~480px、垂直（贴底/居中/贴顶）、水平 0~100%；**`Ctrl + H` 随时显示 / 隐藏** |
| 进入 / 退出动画、泡泡大小 | 开 / 100% | 跳入回弹 + 泡泡星光 / 下沉淡出；泡泡尺寸 50%~250% |
| 窗口颜色（深/浅两套） | 当前皮肤色 | 10 项颜色 × 深浅两套，跟随「外观」自动切换；有「恢复默认颜色」 |

**首次启动**会弹一张引导卡片 ✓ —— 插件不内置背景图 ✓，引导你选一张自己的图（浏览器不允许无交互弹出文件框，
所以做成"点一下按钮即弹"✓）；点「以后再说」就不再打扰 ✓，之后随时可在设置里更换 ✓。

## 素材与版权

- **不内置任何背景图** ✓ —— 原版内嵌的背景属第三方素材，已整体移除；装上默认是主题自带的渐变底色 ✓。
- **立绘为作者自有素材** ✓（`assets/portrait.png` 与内嵌的那张、以及 22 张分层 PNG ✓）。
- 本插件是**非官方粉丝作品**，与游戏厂商无关；文中出现的游戏名 / 角色名仅用于说明用途，权利归原厂所有。

## 兼容性说明

- **不依赖宿主的构建哈希类名** ✓：对话卡毛玻璃等规则绑在插件**运行时自己打的类**上
  （用 `[data-conversation-scroll]` 这类 **data 属性**做钩子 ✓），所以 Web 端 / 桌面端 / 后续版本都能命中 ✓。
- **更新后请 `Ctrl+F5`** ✓：客户端插件的代码在**页面加载时**导入，没有跑开发 watcher 时不会热更 ✗。
- 余额功能读取本机 DSH 凭据里的 `DEEPSEEK_API_KEY` ✓（只在**主机进程**里使用 ✓，不暴露给浏览器 ✓）；
  没配 DeepSeek 密钥时显示 0 ✓，其余功能不受影响 ✓。

## 卸载

```
plugin_manager  action: remove_bundle  target: dsh-hsr-ui
```

手工挂载方式则：`dsh plugin --profile <profile> remove dsh-hsr-ui`，并删掉 `cordis.patch.yml` 里对应的 insert 条目 ✓。

## 许可

MIT ✓ —— 更新记录见 [CHANGELOG.md](CHANGELOG.md) ✓
