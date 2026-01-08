const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");             // /tauri/nodejs
const runtime = path.join(root, "runtime");
const distSrc = path.join(root, "dist-backend");
const distDst = path.join(runtime, "dist-backend");

// 1) clean runtime
// fs.rmSync(runtime, { recursive: true, force: true });
// fs.mkdirSync(runtime, { recursive: true });

// 2) copy dist-backend
fs.mkdirSync(distDst, { recursive: true });
copyDir(distSrc, distDst);

// 3) install runtime deps into runtime/node_modules
//    Use npm for determinism (works even if monorepo uses pnpm elsewhere)
execSync("npm ci --omit=dev --no-fund --no-audit", {
    cwd: runtime,
    stdio: "inherit"
});

// If you have native deps (keytar), you may need rebuild per platform later.
// We'll handle that in platform build steps.

console.log("Runtime prepared at:", runtime);

// const target = path.join(root, "../src-tauri/backend")

// copyDir(runtime, target);

// console.log("copied files to", target);

function copyDir(src, dst) {
    if (!fs.existsSync(src)) throw new Error(`Missing build output: ${src}`);
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            fs.mkdirSync(d, { recursive: true });
            copyDir(s, d);
        } else {
            fs.copyFileSync(s, d);
        }
    }
}
