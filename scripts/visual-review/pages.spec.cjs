const { snapshot } = require('./snapshot.cjs');
const { test, expect } = require('@playwright/test');
const routes = require('./routes.json');
for (const width of [1440, 768, 390, 320]) {
  for (const route of routes) {
    test(`${width}px ${route}`, async ({ page }) => {
      await page.setViewportSize({width, height:1000});
      await page.clock.setFixedTime(new Date('2026-10-04T10:00:00Z'));
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      const response=await page.goto(route,{waitUntil:'networkidle'});
      expect(response.status()).toBe(route==='/missing-page-check'?404:200);
      await page.evaluate(()=>document.fonts.ready);
      expect(errors).toEqual([]);
      expect(await page.locator('h1').count()).toBe(1);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
      const breadcrumb=page.getByRole('navigation',{name:'Breadcrumb',exact:true});
      if(await breadcrumb.count()) {
        const measurements=await breadcrumb.locator('a,[aria-current="page"]').evaluateAll(nodes=>nodes.map(n=>{const style=getComputedStyle(n);const range=document.createRange();range.selectNodeContents(n);const r=range.getClientRects()[0];return {font:style.fontSize,line:style.lineHeight,y:r.y,height:r.height};}));
        expect(new Set(measurements.map(m=>m.font)).size).toBe(1);
        expect(new Set(measurements.map(m=>m.line)).size).toBe(1);
        expect(parseFloat(measurements[0].font)).toBeGreaterThanOrEqual(14);
        // Labels on the same row must share their text baseline, not merely box centres.
        for(let i=1;i<measurements.length;i++)if(Math.abs(measurements[i].y-measurements[i-1].y)<10)expect(Math.abs(measurements[i].y-measurements[i-1].y)).toBeLessThanOrEqual(1);
        await expect(breadcrumb.locator('[aria-current="page"]')).toHaveCount(1);
      }
      await snapshot(page, `${route==='/'?'home':route.slice(1).replaceAll('/','-')}-${width}.png`,{fullPage:true});
    });
  }
}

test('route manifest matches sitemap',async({request})=>{
  const response=await request.get('/sitemap.xml');expect(response.ok()).toBe(true);
  const paths=[...new Set([...((await response.text()).matchAll(/<loc>(.*?)<\/loc>/g))].map(m=>new URL(m[1]).pathname))].sort();
  expect(paths).toEqual(routes.filter(r=>r!=='/missing-page-check'&&r!=='/404').sort());
});
