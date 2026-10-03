const { snapshot } = require('./snapshot.cjs');
const {test,expect}=require('@playwright/test');
const cases=[['tds-interest-calculator','Load sample case'],['gst-late-fee-interest-calculator','Load sample return'],['advance-tax-calculator',null],['presumptive-income-calculator',null]];
for(const width of [1440,390,320])for(const[slug,sample]of cases){
 test(`${slug} states ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.clock.setFixedTime(new Date('2026-10-04T10:00:00Z'));await page.goto('/'+slug);
  async function shot(name){await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await snapshot(page, `${slug}-${name}-${width}.png`,{fullPage:true});}
  if(sample)await page.getByRole('button',{name:sample,exact:true}).click();else if(slug.startsWith('advance')){await page.getByLabel('Gross total income',{exact:true}).fill('1800000');await page.getByLabel('Salary or pension included',{exact:true}).fill('1200000');}else await page.getByLabel('Gross receipts',{exact:true}).fill('2400000');
  await page.locator('#results .result-card').first().waitFor();await shot('result');
  await page.getByRole('link',{name:'Guide & sources',exact:true}).click();await shot('guide');
  const anchor=page.locator('#guide a[href^="#"]').first();if(await anchor.count()){const href=await anchor.getAttribute('href');await anchor.click();await page.waitForTimeout(400);const target=await page.locator(href).boundingBox();const toolbar=await page.locator('.calculator-toolbar').boundingBox();expect(target.y).toBeGreaterThan(toolbar.y+toolbar.height);}
  if(slug.startsWith('gst')){await page.getByLabel('Actual filing date',{exact:true}).fill('2020-01-01');await shot('error');}
  if(slug.startsWith('advance')){await page.getByLabel('Salary or pension included',{exact:true}).fill('2000000');await shot('error');}
  if(slug.startsWith('presumptive')){await page.getByLabel('Gross receipts',{exact:true}).fill('9000000');await shot('error');}
  await page.getByRole('button',{name:'Clear inputs',exact:true}).click();await shot('cleared');await page.getByRole('button',{name:'Undo clear',exact:true}).click();
 });
}
test('mobile navigation and overflowing table affordance',async({page})=>{
 await page.setViewportSize({width:320,height:900});await page.goto('/tds-interest-calculator');await page.getByRole('button',{name:'Load sample case',exact:true}).click();await expect(page.locator('.table-scroll-hint').first()).toBeVisible();const region=page.locator('.breakdown-scroll').first();await region.focus();await page.keyboard.press('ArrowRight');await expect.poll(()=>region.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);await page.locator('.tool-switcher summary').click();await page.evaluate(()=>scrollTo(0,0));await snapshot(page, 'mobile-tools-menu.png');await page.keyboard.press('Escape');await expect(page.locator('.tool-switcher')).not.toHaveAttribute('open','');
});
