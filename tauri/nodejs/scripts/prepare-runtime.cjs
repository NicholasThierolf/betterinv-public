const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, ".."); // /tauri/nodejs
const runtime = path.join(root, "runtime");
const distSrc = path.join(root, "dist-backend");
const distDst = path.join(runtime, "dist-backend");

const runtimeLockSrc = path.join(root, "package-lock.runtime.json");
const runtimePkgSrc = path.join(root, "package.json");

// 1) clean runtime (ALWAYS)
fs.rmSync(runtime, { recursive: true, force: true });
fs.mkdirSync(runtime, { recursive: true });

// 2) copy dist-backend
fs.mkdirSync(distDst, { recursive: true });
copyDir(distSrc, distDst);

// 3) copy runtime manifest + lockfile (standalone install)
if (!fs.existsSync(runtimePkgSrc)) {
    throw new Error(`Missing package.json at ${runtimePkgSrc}`);
}
fs.copyFileSync(runtimePkgSrc, path.join(runtime, "package.json"));

if (!fs.existsSync(runtimeLockSrc)) {
    throw new Error(
        `Missing ${runtimeLockSrc}\n` +
        `Generate it in CI (see workflow) or commit it.`
    );
}
// npm expects package-lock.json
fs.copyFileSync(runtimeLockSrc, path.join(runtime, "package-lock.json"));

// 4) install runtime deps into runtime/node_modules deterministically
execSync("npm ci --omit=dev --no-fund --no-audit", {
    cwd: runtime,
    stdio: "inherit",
});

console.log("Runtime prepared at:", runtime);

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
