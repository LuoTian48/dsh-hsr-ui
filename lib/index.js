// hsr-ui 主机半边 — 提供 DeepSeek 余额查询路由 GET /hsr-ui/balance
//                  + 静态资源路由 GET /hsr-ui/assets/*（立绘分层 PNG 与 rig.json）
// 密钥通过 DSH 的 credentials 服务解析（引用 DEEPSEEK_API_KEY），绝不暴露给浏览器。
// 注意：主机半边零依赖（只用 Node 内建模块），否则插件目录里的依赖残缺会让整个 DSH 起不来。
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, normalize, extname } from "node:path";

export const name = "hsr-ui";
export const inject = ["webServer", "credentials"];

const BALANCE_URL = "https://api.deepseek.com/user/balance";

// 插件根目录（lib/index.js 的上一级），资源放在 <root>/assets
const PLUGIN_ROOT = fileURLToPath(new URL("..", import.meta.url));
const ASSET_ROOT = join(PLUGIN_ROOT, "assets");
const ASSET_PREFIX = "/hsr-ui/assets";

const MIME = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

/** 伺服 assets/ 下的文件：只允许 GET/HEAD，防路径穿越，带一小时缓存。 */
function serveAsset(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    res.end();
    return;
  }
  let rel;
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    rel = decodeURIComponent(url.pathname.slice(ASSET_PREFIX.length));
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  while (rel.startsWith("/") || rel.startsWith("\\")) rel = rel.slice(1);
  const safe = normalize(rel).replace(/^(\.\.[/\\])+/, "");
  const full = join(ASSET_ROOT, safe);
  if (safe === "" || !full.startsWith(ASSET_ROOT)) {
    res.writeHead(404);
    res.end();
    return;
  }
  readFile(full)
    .then((buf) => {
      const ext = extname(full).toLowerCase();
      res.writeHead(200, {
        "content-type": MIME[ext] ?? "application/octet-stream",
        "content-length": String(buf.length),
        // rig.json 必须每次都拿最新（客户端靠它取 assetVersion，再给图层 URL 加版本号）；
        // 图层 PNG 走版本化 URL，可以长缓存。
        "cache-control": ext === ".json" ? "no-store" : "public, max-age=3600"
      });
      if (req.method === "HEAD") res.end();
      else res.end(buf);
    })
    .catch(() => {
      res.writeHead(404);
      res.end();
    });
}

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: ASSET_PREFIX,
    handler: serveAsset
  }), "hsr-ui: asset route");

  ctx.effect(() => ctx.webServer.register({
    kind: "exact",
    path: "/hsr-ui/balance",
    handler: async (req, res) => {
      if (req.method !== "GET") {
        sendJson(res, 405, { available: false, balance: "0", currency: "CNY" });
        return;
      }
      try {
        const credentials = ctx.get("credentials");
        const hit = credentials !== undefined ? await credentials.resolve("DEEPSEEK_API_KEY") : undefined;
        const key = hit === undefined ? undefined : hit.value;
        // 没有 DeepSeek 密钥（= 不是/未配置 DeepSeek）→ 直接返回 0，不查询
        if (key === undefined || String(key).trim() === "") {
          sendJson(res, 200, { available: false, balance: "0", currency: "CNY" });
          return;
        }
        const upstream = await fetch(BALANCE_URL, {
          headers: { authorization: `Bearer ${String(key).trim()}` },
          signal: AbortSignal.timeout(8000)
        });
        if (!upstream.ok) {
          sendJson(res, 200, { available: false, balance: "0", currency: "CNY", status: upstream.status });
          return;
        }
        const data = await upstream.json();
        const info = Array.isArray(data && data.balance_infos) ? data.balance_infos[0] : undefined;
        const total = info && info.total_balance !== undefined ? String(info.total_balance) : "0";
        const granted = info && info.granted_balance !== undefined ? String(info.granted_balance) : "0";
        const topped = info && info.topped_up_balance !== undefined ? String(info.topped_up_balance) : "0";
        // 累计消费：接口不直接给，用「赠送余额 + 充值余额 - 总余额」推导（总已注入 - 当前剩余）。
        let consumed = "0";
        {
          const n = Number(topped) + Number(granted) - Number(total);
          if (Number.isFinite(n)) consumed = Math.max(0, n).toFixed(2);
        }
        sendJson(res, 200, {
          available: data && data.is_available === true,
          balance: total,
          consumed,
          currency: info && info.currency ? String(info.currency) : "CNY"
        });
      } catch (error) {
        sendJson(res, 200, {
          available: false,
          balance: "0",
          consumed: "0",
          currency: "CNY",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }), "hsr-ui: balance route");
}
