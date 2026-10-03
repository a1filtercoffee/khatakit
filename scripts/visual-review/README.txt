VISUAL REVIEW — REQUIRED FOR UI CHANGES

Install: npm ci --prefix scripts/visual-review
Browser: npx --prefix scripts/visual-review playwright install chromium
Build and serve the production site before running this suite.
Run: npm --prefix scripts/visual-review run check
Set VISUAL_BASE_URL to review another deployment.
Set CHROMIUM_PATH only when using an existing matching Chromium executable.

Reference: Playwright 1.63.0 / Chromium 1243, macOS, fixed clock 4 October 2026.
Screenshots are platform-sensitive. Linux CI runs the layout/interaction assertions
and uploads candidate images for review; it does NOT claim a pixel-baseline pass.
Local check compares screenshots to the committed macOS baseline.

Review gate:
1. Compare routes.json with the sitemap; add new routes. Include missing-page views.
2. Inspect 1440, 768, 390 and 320px page images. Review top, middle and footer,
   not only contact-sheet thumbnails. Inspect full images where text is dense.
3. Review calculator steps, results, errors, cleared/restored inputs, navigation,
   expanded rules/guide sections and keyboard focus. See states.spec.cjs.
4. Check typography, text baselines, content edges, spacing, readable controls,
   long labels, numeric values, tables and sticky elements covering content.
5. Keep accessibility/functional results separate from visual judgment.
6. Only after reviewing intended differences, update named affected snapshots:
   npm --prefix scripts/visual-review run baseline -- --grep '<affected test>'
   Never regenerate all baselines just to make a failure disappear.
7. Re-run check. After publishing, verify actual public URLs and record evidence.

Rules: breadcrumbs >=14px with equal font size/line height and aligned text;
no page-level horizontal overflow at tested widths; scrollable tables must remain
keyboard accessible; guide anchors must clear sticky navigation. Legal section
labels must not squeeze their titles on phones.

Scope: every listed route plus representative workflows. This does not enumerate
every possible tax/legal input, establish legal accuracy, or replace user testing.
A test pass is not a 20/20 design score.
