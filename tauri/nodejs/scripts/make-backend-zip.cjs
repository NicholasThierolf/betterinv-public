// tauri/nodejs/scripts/make-backend-zip.cjs
/* eslint-disable no-console */
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const archiver = require("archiver");

const repoRoot = path.resolve(__dirname, "..", ".."); // tauri/
const runtimeDir = path.join(repoRoot, "nodejs", "runtime");
const outZip = path.join(repoRoot, "src-tauri", "backend.zip");

async function exists(p) {
    try {
        await fsp.access(p);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    if (!(await exists(runtimeDir))) {
        throw new Error(`Runtime dir not found: ${runtimeDir}`);
    }

    // Remove old zip if present
    if (await exists(outZip)) {
        await fsp.rm(outZip, { force: true });
    }

    await fsp.mkdir(path.dirname(outZip), { recursive: true });

    const output = fs.createWriteStream(outZip);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const done = new Promise((resolve, reject) => {
        output.on("close", resolve);
        output.on("error", reject);
        archive.on("error", reject);
    });

    archive.pipe(output);

    // Put the CONTENTS of runtime/ at the root of the zip (same as runtime\*)
    // If you want it nested (runtime/...), change dest to "runtime"
    archive.directory(runtimeDir, false);

    await archive.finalize();
    await done;

    console.log(`Wrote ${outZip} (${archive.pointer()} bytes)`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
