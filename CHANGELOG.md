# 更新记录

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
