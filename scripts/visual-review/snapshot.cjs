const { expect, test } = require('@playwright/test');
async function snapshot(page, name, options = {}) {
  // Linux CI validates geometry and saves candidates; reference images were reviewed on macOS.
  // Use the regular check command on the reference platform for pixel comparisons.
  if (process.env.VISUAL_ASSERTIONS_ONLY === '1') {
    const path = test.info().outputPath(name);
    await page.screenshot({path, animations:'disabled', ...options});
    await test.info().attach(name, {path, contentType:'image/png'});
  } else await expect(page).toHaveScreenshot(name, options);
}
module.exports = { snapshot };
