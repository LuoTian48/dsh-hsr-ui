# 更新记录

## 2.0.1

**桌面端适配：不再依赖宿主的构建哈希类名** ✓（修好"桌面端没有毛玻璃、选了背景图也不显示"）。

- **对话卡毛玻璃改为构建无关** ✓：原先规则绑在宿主的 CSS Modules 类名上
  （`.wSkVaW_scrollBody` 等），而这是**构建产物哈希** —— Web 端（npm 版 DSH）与桌面端
  是两套构建，实测桌面端 **5 个写死类名全部失配** ✗。现在同一条规则**双绑**
  （宿主类名 + 插件自己的类 `hsr-conv-card`），并在运行时用 **data 属性钩子**
  `[data-conversation-scroll]`（不是哈希 ✓，两端都在 ✓）找到对话卡后补上插件类 ✓。
- **新增 `uncoverBackground()`** ✓：背景图由 `body::after`（`z-index:-1`）绘制，在内容层之下；
  桌面端根容器自带不透明底色 ✗ → 整张图被盖住 ✗。现在从对话卡往上走到 `body`，
  把这条链上**计算出来不透明**的祖先改成与 Web 端同款的半透明氛围色
  `--dsw-alias-bg-base` ✓（inline style，优先级最高 ✓）。只动这一条链，不碰侧栏/顶栏 ✓。
- 两步都幂等 ✓，并挂进既有的 1.5s 轮询（切页面/换会话元素会重建 ✓）。
- 回归：**179 条断言全绿** ✓。

> ⚠️ 客户端插件的代码在**页面加载时**导入 ✓ —— 没有跑 `pnpm run dev:web` 时不会热更 ✗，
> 所以更新后请 **Ctrl+F5 硬刷新**才会看到效果 ✓。

## 2.0.0

**包名从 `hsr-ui` 改为 `dsh-hsr-ui`**（破坏性变更 ✗ —— loader 行名与依赖名都变了）。

- 改名的原因：与仓库名、DSH 插件命名习惯（`dsh-` 前缀）保持一致 ✓。
- `package.json` 的 `name`、`cordis.patch.yml` 的 `id`/`name`、
  主机半边的 `export const name`、客户端 id、图标 aria-label 全部同步 ✓。
- **路由前缀 `/hsr-ui/assets/*` 与 localStorage 的 `hsr-ui.*` 键保持不变** ✓ ——
  老用户的配色、背景图、立绘偏好都不会丢 ✓。
- 升级必须**先卸旧再装新**（旧包名 `hsr-ui` 的行/依赖要先删掉），步骤见 README 的
  「从 1.x 升级」小节 ✓。

## 1.1.0

- 新增 `locale/zh.json`、`locale/en.json`、`icon.svg`，并把插件改造成标准 **bundle**
  （`dsh.bundle.patch` + `cordis.patch.yml`），可用 `plugin_manager` 的 `install_bundle` 一条命令安装 ✓。
- 插件页（新版界面）补上底板：宿主里只有 `.X_2TxG_page` 没有自己的 background，
  整页会直接压在背景图上 ✗；现按宿主轨迹页的惯例补 `bg-layer-1`，宽度与水平位置对齐对话卡（812px + `--hsr-chat-x`）✓。
- 全屏表面透明化修正：不再把主框架 `.pI_x6G_frame` 也设成 transparent ✗（它才是所有页面的底板）✓。
- 内容层 token（`bg-layer-1` / `module-platform` / `multi-select` / `selector`）不透明度提到 0.92 ✓，
  修好"文件修改悬浮预览卡看不清字" ✓。
- 余额徽标配色改用主题 token ✓；移除「预估消费」相关全部逻辑 ✓，只保留余额与"回答完成自动刷新" ✓。
- 新增首次启动的背景图引导卡片 ✓；「对话背景水平位置」文案改正为「对话窗口水平位置」 ✓。

## 1.0.0

- 首个版本：星穹铁道主题（token 重映射）、毛玻璃、自定义背景图、分层动立绘
  （眨眼 / 视线跟随 / 发丝与裙摆弹簧物理）、进出场动画与泡泡粒子、右下角余额 ✓。
