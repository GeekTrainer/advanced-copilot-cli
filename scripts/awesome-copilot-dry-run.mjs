#!/usr/bin/env node
// Dry-run transform for publishing this course into github/awesome-copilot's
// Learning Hub, mirroring the github-samples/copilot-workshops precedent.
//
// It reads the source modules in content/NN-*.md and emits an awesome-copilot
// formatted preview tree under publishing/preview/ WITHOUT any network access
// and WITHOUT touching awesome-copilot. Use it to verify the mapping before the
// real gh-aw sync workflow (publishing/advanced-copilot-cli-sync.md) runs
// upstream. The workflow performs the same transforms live, agent-driven.
//
// Usage:
//   node scripts/awesome-copilot-dry-run.mjs [--source content] [--out publishing/preview]
//
// Output layout (mirrors website/src/content/docs/learning-hub/<course>/<track>/):
//   publishing/preview/website/src/content/docs/learning-hub/advanced-copilot-cli/index.md
//   publishing/preview/website/src/content/docs/learning-hub/advanced-copilot-cli/multi-stack/index.md
//   publishing/preview/website/src/content/docs/learning-hub/advanced-copilot-cli/multi-stack/NN-*.md
//   publishing/preview/website/public/images/learning-hub/advanced-copilot-cli/*
//   publishing/preview/REGISTRATION.md   (sidebar + learning-hub index touch-points)

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const COURSE_SLUG = "advanced-copilot-cli";
const TRACK_SLUG = "multi-stack";
const TRACK_LABEL = "Multi-stack (AssetTrack)";
const AUTHOR = "GitHub Copilot Learning Hub Team";
const ROUTE_BASE = `/learning-hub/${COURSE_SLUG}/${TRACK_SLUG}`;
const IMAGE_BASE = `/images/learning-hub/${COURSE_SLUG}`;

function parseArgs(argv) {
  const args = { source: "content", out: "publishing/preview" };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--source") args.source = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
  }
  return args;
}

function lastUpdated(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cd", "--date=short", "--", file], {
      encoding: "utf8",
    }).trim();
    if (out) return out;
  } catch {
    /* fall through to mtime */
  }
  return new Date(fs.statSync(file).mtime).toISOString().slice(0, 10);
}

function yamlString(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "'")}"`;
}

// Rewrite a relative module link target (e.g. ./03-foo.md#anchor or 03-foo.md)
// to a site-absolute route with a trailing slash: /route/03-foo/#anchor
function rewriteModuleTarget(target) {
  const m = target.match(/^\.?\/?(\d\d-[a-z0-9-]+)\.md(#[\w-]+)?$/);
  if (!m) return null;
  return `${ROUTE_BASE}/${m[1]}/${m[2] ?? ""}`;
}

function transformBody(raw) {
  const lines = raw.split("\n");

  // Strip the leading H1 (its text becomes the frontmatter title, matching the
  // copilot-workshops mirror where the page title lives only in frontmatter).
  let start = 0;
  while (start < lines.length && lines[start].trim() === "") start += 1;
  let title = null;
  if (lines[start] && /^#\s+/.test(lines[start])) {
    title = lines[start].replace(/^#\s+/, "").trim();
    start += 1;
    if (lines[start] && lines[start].trim() === "") start += 1;
  }
  let body = lines.slice(start).join("\n");

  // Images: ./images/foo.png (or images/foo.png) -> site-absolute course path.
  body = body.replace(/\]\(\.?\/?images\/([^)]+)\)/g, `](${IMAGE_BASE}/$1)`);

  // Inline module links: [text](./03-foo.md#a) -> [text](/route/03-foo/#a)
  body = body.replace(/\]\((\.?\/?\d\d-[a-z0-9-]+\.md(?:#[\w-]+)?)\)/g, (whole, target) => {
    const rewritten = rewriteModuleTarget(target);
    return rewritten ? `](${rewritten})` : whole;
  });

  // Reference-style definitions: [label]: ./03-foo.md#a -> /route/03-foo/#a
  body = body.replace(/^(\[[^\]]+\]:\s*)(\S+)(.*)$/gm, (whole, head, target, tail) => {
    const rewritten = rewriteModuleTarget(target);
    return rewritten ? `${head}${rewritten}${tail}` : whole;
  });

  return { title, body: body.replace(/\s+$/s, "") + "\n" };
}

function deriveDescription(body) {
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith("|")) continue; // nav table
    if (line.startsWith(">")) continue; // admonition / catch-up block
    if (line.startsWith("#")) continue; // heading
    if (line.startsWith("!")) continue; // image
    if (line.startsWith("```")) continue; // fence
    const plain = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/[*_]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!plain) continue;
    if (plain.length <= 160) return plain;
    return plain.slice(0, 157).replace(/\s+\S*$/, "") + "…";
  }
  return "";
}

function frontmatter({ title, description, updated }) {
  const rows = [`title: ${yamlString(title)}`];
  if (description) rows.push(`description: ${yamlString(description)}`);
  rows.push("authors:", `  - ${AUTHOR}`, `lastUpdated: ${updated}`);
  return `---\n${rows.join("\n")}\n---\n`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = process.cwd();
  const sourceDir = path.resolve(repoRoot, args.source);
  const outRoot = path.resolve(repoRoot, args.out);
  const docsDir = path.join(
    outRoot,
    "website/src/content/docs/learning-hub",
    COURSE_SLUG,
  );
  const trackDir = path.join(docsDir, TRACK_SLUG);
  const imageOutDir = path.join(
    outRoot,
    "website/public/images/learning-hub",
    COURSE_SLUG,
  );

  // Clean previous preview so removed source files don't linger.
  fs.rmSync(outRoot, { recursive: true, force: true });
  ensureDir(trackDir);
  ensureDir(imageOutDir);

  const moduleFiles = fs
    .readdirSync(sourceDir)
    .filter((f) => /^\d\d-[a-z0-9-]+\.md$/.test(f))
    .sort();

  if (moduleFiles.length === 0) {
    console.error(`No NN-*.md module files found in ${sourceDir}`);
    process.exit(1);
  }

  const modules = [];
  const dates = [];
  for (const file of moduleFiles) {
    const abs = path.join(sourceDir, file);
    const raw = fs.readFileSync(abs, "utf8");
    const updated = lastUpdated(path.join(args.source, file));
    dates.push(updated);
    const { title, body } = transformBody(raw);
    const description = deriveDescription(body);
    const num = file.slice(0, 2);
    const slug = file.replace(/\.md$/, "");
    const fm = frontmatter({ title, description, updated });
    fs.writeFileSync(path.join(trackDir, file), `${fm}\n${body}`);
    modules.push({ file, slug, num, title, description });
  }

  // Images referenced by the modules.
  const imageSrcDir = path.join(sourceDir, "images");
  let imageCount = 0;
  if (fs.existsSync(imageSrcDir)) {
    for (const img of fs.readdirSync(imageSrcDir)) {
      fs.copyFileSync(path.join(imageSrcDir, img), path.join(imageOutDir, img));
      imageCount += 1;
    }
  }

  const maxDate = dates.sort().at(-1);

  // Track overview (mirrors copilot-workshops/<harness>/index.md).
  const trackIndex = renderTrackIndex(modules, maxDate);
  fs.writeFileSync(path.join(trackDir, "index.md"), trackIndex);

  // Course landing (mirrors copilot-workshops/index.md "choose your harness").
  const courseIndex = renderCourseIndex(maxDate);
  fs.writeFileSync(path.join(docsDir, "index.md"), courseIndex);

  // Registration touch-points reviewers must apply upstream.
  fs.writeFileSync(path.join(outRoot, "REGISTRATION.md"), renderRegistration(modules));

  console.log(`Dry-run preview written to ${path.relative(repoRoot, outRoot)}`);
  console.log(`  ${modules.length} modules -> ${path.relative(repoRoot, trackDir)}`);
  console.log(`  ${imageCount} images -> ${path.relative(repoRoot, imageOutDir)}`);
  console.log(`  course index.md + track index.md + REGISTRATION.md`);
}

function renderTrackIndex(modules, updated) {
  const fm = frontmatter({
    title: TRACK_LABEL,
    description:
      "The canonical AssetTrack scenario: nine modules taking Copilot CLI across a multi-stack codebase (Java, Astro/TypeScript, .NET, and FastAPI).",
    updated,
  });
  const intro =
    "This is the canonical **AssetTrack** track for the Advanced Copilot CLI course. Across nine modules you build AI infrastructure, back it with tests, shape Copilot CLI's lifecycle with hooks, ship a feature end to end, modernize a legacy service, and manage Copilot's own configuration — all against a realistic multi-stack codebase.";
  const rows = modules
    .map((m) => `| [${m.title}][${m.slug}] | ${m.description || ""} |`)
    .join("\n");
  const table = `| Module | Description |\n|--------|-------------|\n${rows}`;
  const first = modules[0];
  const getStarted = `**[Start with ${first.title} →][${first.slug}]**`;
  const defs = modules
    .map((m) => `[${m.slug}]: ${ROUTE_BASE}/${m.slug}/`)
    .join("\n");
  return `${fm}\n${intro}\n\n## Modules\n\n${table}\n\n## Get started\n\n${getStarted}\n\n${defs}\n`;
}

function renderCourseIndex(updated) {
  const fm = frontmatter({
    title: "Advanced Copilot CLI",
    description:
      "An advanced, hands-on course for using GitHub Copilot CLI across a real multi-stack codebase.",
    updated,
  });
  return `${fm}
The Advanced Copilot CLI course takes you beyond the basics into agent-native development with GitHub Copilot CLI — building AI infrastructure, delegating work to the cloud agent, shaping the CLI's lifecycle with hooks, and modernizing real applications.

## Choose your track

The course is organized into tracks so you can follow the scenario that matches your stack. Pick one and stay in it.

### 🧩 [Multi-stack (AssetTrack)](${ROUTE_BASE}/)

The canonical scenario built around **AssetTrack** — a codebase spanning Java, Astro/TypeScript, .NET, and FastAPI. This is the complete nine-module sequence and the best place to start.

> [!NOTE]
> Additional tracks (a .NET legacy-modernization scenario and a Next.js greenfield scenario) are planned. Until they are written, the multi-stack track above is the canonical path.

## Get started

**[Begin the multi-stack track →](${ROUTE_BASE}/)**
`;
}

function renderRegistration(modules) {
  const sidebarLessons = modules
    .map((m) => `                "learning-hub/${COURSE_SLUG}/${TRACK_SLUG}/${m.slug}",`)
    .join("\n");
  const sidebarGroup = `{
  label: "Advanced Copilot CLI",
  items: [
    {
      label: "Overview",
      link: "/learning-hub/${COURSE_SLUG}/",
    },
    {
      label: "${TRACK_LABEL}",
      items: [
        {
          label: "Overview",
          link: "${ROUTE_BASE}/",
        },
${sidebarLessons}
      ],
    },
  ],
},`;
  return `# Registration touch-points (apply in awesome-copilot)

These are the navigation edits the sync workflow makes upstream. They are captured
here so a reviewer can verify them against the dry-run preview.

## 1. \`website/astro.config.mjs\` — add a sidebar group after "Copilot Workshops"

\`\`\`js
${sidebarGroup}
\`\`\`

> Every slug listed above must map to a real markdown file in the preview tree, or
> the Astro build fails. Verify against
> \`website/src/content/docs/learning-hub/${COURSE_SLUG}/${TRACK_SLUG}/\`.

## 2. \`website/src/content/docs/learning-hub/index.md\` — add a course entry

Add under a suitable heading (e.g. after the Workshop entry):

\`\`\`markdown
**Advanced**: Ready to go deeper? Work through [Advanced Copilot CLI](${COURSE_SLUG}/) — a nine-module, multi-stack course covering AI infrastructure, cloud-agent delegation, lifecycle hooks, and app modernization.
\`\`\`

## 3. Course + track landing pages

Already generated in the preview:

- \`${COURSE_SLUG}/index.md\` — course landing ("choose your track")
- \`${COURSE_SLUG}/${TRACK_SLUG}/index.md\` — track overview (module table)
`;
}

main();
