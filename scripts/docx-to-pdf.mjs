/**
 * Konverze .docx z dokumenty-zdroj/ do PDF v public/dokumenty/
 * (mammoth → HTML → Playwright PDF). Spusť: npm run dokumenty:pdf
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(root, "dokumenty-zdroj");
const outDir = path.join(root, "public", "dokumenty");

const css = `
  @page { margin: 16mm 14mm; }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size: 11pt;
    line-height: 1.45;
    color: #111;
  }
  h1, h2, h3, h4 { color: #000; margin-top: 1.1em; margin-bottom: 0.35em; font-weight: 600; }
  h1 { font-size: 1.25rem; }
  p { margin: 0.45em 0; }
  ul, ol { padding-left: 1.35em; margin: 0.5em 0; }
  table { border-collapse: collapse; width: 100%; margin: 0.75em 0; }
  td, th { border: 1px solid #bbb; padding: 4px 8px; vertical-align: top; }
`;

async function convert(inputPath, outputPath) {
  const buf = await fs.promises.readFile(inputPath);
  const { value: html } = await mammoth.convertToHtml({ buffer: buf });
  const fullHtml = `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  await fs.promises.mkdir(outDir, { recursive: true });
  let entries;
  try {
    entries = await fs.promises.readdir(srcDir);
  } catch {
    console.error("Chybí složka dokumenty-zdroj/");
    process.exit(1);
  }
  const docxFiles = entries.filter((f) => f.endsWith(".docx"));
  if (!docxFiles.length) {
    console.error("Žádné .docx v dokumenty-zdroj/");
    process.exit(1);
  }
  for (const f of docxFiles.sort()) {
    const base = f.replace(/\.docx$/i, "");
    const out = path.join(outDir, `${base}.pdf`);
    console.log(`${f} → ${path.relative(root, out)}`);
    await convert(path.join(srcDir, f), out);
  }
  console.log("Hotovo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
