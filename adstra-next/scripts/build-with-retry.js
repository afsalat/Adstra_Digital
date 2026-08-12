const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2500;
const OUT_DIR = path.resolve(__dirname, "..", "out");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeOutDirWithRetry() {
  for (let i = 1; i <= 5; i += 1) {
    try {
      if (fs.existsSync(OUT_DIR)) {
        fs.rmSync(OUT_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
      }
      return;
    } catch (error) {
      const isTransient = error && ["EBUSY", "EPERM", "ENOTEMPTY"].includes(error.code);
      if (!isTransient || i === 5) {
        throw error;
      }
      console.warn(
        `[build-retry] out/ cleanup transient lock (${error.code}) (attempt ${i}/5). Retrying in 1s...`
      );
      await sleep(1000);
    }
  }
}

function runNextBuild() {
  return new Promise((resolve) => {
    const child = spawn("npx", ["next", "build"], {
      cwd: path.resolve(__dirname, ".."),
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1, output });
    });
  });
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    console.log(`[build-retry] Build attempt ${attempt}/${MAX_ATTEMPTS}`);
    await removeOutDirWithRetry();

    const result = await runNextBuild();
    if (result.code === 0) {
      console.log("[build-retry] Build succeeded.");
      process.exit(0);
    }

    const busy = /EBUSY|resource busy or locked|EPERM|PageNotFoundError|ENOENT/i.test(result.output);
    if (!busy || attempt === MAX_ATTEMPTS) {
      console.error("[build-retry] Build failed.");
      process.exit(result.code);
    }

    console.warn(
      `[build-retry] Detected file lock issue. Waiting ${RETRY_DELAY_MS}ms before retry...`
    );
    await sleep(RETRY_DELAY_MS);
  }
}

main().catch((error) => {
  console.error("[build-retry] Unexpected error:", error);
  process.exit(1);
});
