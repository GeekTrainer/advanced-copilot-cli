# Registration touch-points (apply in awesome-copilot)

These are the navigation edits the sync workflow makes upstream. They are captured
here so a reviewer can verify them against the dry-run preview.

## 1. `website/astro.config.mjs` — add a sidebar group after "Copilot Workshops"

```js
{
  label: "Advanced Copilot CLI",
  items: [
    {
      label: "Overview",
      link: "/learning-hub/advanced-copilot-cli/",
    },
    {
      label: "Multi-stack (AssetTrack)",
      items: [
        {
          label: "Overview",
          link: "/learning-hub/advanced-copilot-cli/multi-stack/",
        },
                "learning-hub/advanced-copilot-cli/multi-stack/00-prerequisites",
                "learning-hub/advanced-copilot-cli/multi-stack/01-working-with-copilot-cli",
                "learning-hub/advanced-copilot-cli/multi-stack/02-building-ai-infrastructure",
                "learning-hub/advanced-copilot-cli/multi-stack/03-test-suite-remote-delegation",
                "learning-hub/advanced-copilot-cli/multi-stack/04-lifecycle-hooks",
                "learning-hub/advanced-copilot-cli/multi-stack/05-add-feature-barcode",
                "learning-hub/advanced-copilot-cli/multi-stack/06-modernize-apps",
                "learning-hub/advanced-copilot-cli/multi-stack/07-manage-infrastructure",
                "learning-hub/advanced-copilot-cli/multi-stack/08-wrap-up",
      ],
    },
  ],
},
```

> Every slug listed above must map to a real markdown file in the preview tree, or
> the Astro build fails. Verify against
> `website/src/content/docs/learning-hub/advanced-copilot-cli/multi-stack/`.

## 2. `website/src/content/docs/learning-hub/index.md` — add a course entry

Add under a suitable heading (e.g. after the Workshop entry):

```markdown
**Advanced**: Ready to go deeper? Work through [Advanced Copilot CLI](advanced-copilot-cli/) — a nine-module, multi-stack course covering AI infrastructure, cloud-agent delegation, lifecycle hooks, and app modernization.
```

## 3. Course + track landing pages

Already generated in the preview:

- `advanced-copilot-cli/index.md` — course landing ("choose your track")
- `advanced-copilot-cli/multi-stack/index.md` — track overview (module table)
