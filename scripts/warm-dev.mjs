const url = process.env.DEV_WARM_URL ?? "http://127.0.0.1:3000/";
const timeoutMs = Number(process.env.DEV_WARM_TIMEOUT_MS ?? 180_000);
const started = Date.now();

while (Date.now() - started < timeoutMs) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (res.ok) {
      console.log(`Dev warm OK (${url}) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      process.exit(0);
    }
    console.log(`Waiting for dev server… HTTP ${res.status}`);
  } catch {
    console.log("Waiting for dev server…");
  }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

console.error(`Dev warm timed out after ${timeoutMs / 1000}s (${url})`);
process.exit(1);
