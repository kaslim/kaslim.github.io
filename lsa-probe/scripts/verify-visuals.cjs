// Usage: node scripts/verify-visuals.cjs <site-url> <optional-screenshot-directory>
// Requires Playwright and Chromium. CHROMIUM_PATH can select an installed browser.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const base = process.argv[2] || "http://localhost:8000/lsa-probe/";
const out = process.argv[3];
const widths = [1280, 390];

async function test(width, language) {
  const mobile = width === 390;
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: process.env.CHROMIUM_SINGLE_PROCESS ? ["--single-process", "--no-zygote", "--disable-gpu", "--disable-dev-shm-usage"] : [],
  });
  try {
    const page = await browser.newPage({
      viewport: { width, height: mobile ? 844 : 720 },
      isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", err => errors.push(err.message));
    page.on("response", response => {
      if (response.status() >= 400) errors.push(response.status() + " " + response.url());
    });
    page.on("console", message => {
      if (message.type() === "error" && !message.text().includes("net::ERR_ABORTED")) errors.push(message.text());
    });
    const url = new URL(base);
    url.searchParams.set("lang", language);
    await page.goto(url.href, {waitUntil: "domcontentloaded", timeout: 60000});
    await page.waitForFunction(lang => document.documentElement.lang === lang, language);
    await page.locator("#evidence .journal-table tbody tr").first().waitFor({state:"attached"});
    const suffix = (mobile ? "-mobile" : "") + (language === "en" ? "-en.svg" : "-zh.svg");
    const shot = async name => {
      if (out) await page.screenshot({path: path.join(out,width+"-"+language+"-"+name+".png")});
    };
    const sections = page.locator("[data-focus-step]");
    assert.equal(await sections.count(), 8);
    async function verifySection(i, mode) {
      const section = sections.nth(i);
      const picture = section.locator(":scope > figure picture");
      const img = picture.locator("img");
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(node => node.decode());
      const url = await img.evaluate(node => node.currentSrc);
      assert.ok(url.endsWith(suffix),url);
      assert.ok(url.includes("/visual-v2/"+String(i+1).padStart(2,"0")+"-"),url);
      assert.ok((await img.getAttribute("alt")).length > 15);
      assert.equal(await img.evaluate(node => node.closest("details") === null),true);
      assert.ok(await img.evaluate(node => node.naturalWidth > 0 && node.clientWidth >= 300));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
      assert.ok(await section.evaluate(node => node.scrollWidth <= node.clientWidth+1));
      if (mode === "focus") await section.evaluate(node => {node.scrollTop=0;});
      else await section.evaluate(node => node.scrollIntoView({block:"start"}));
      await shot(mode+"-"+(i+1));
      await section.locator(".figure-zoom").click();
      const dialog=page.locator("#image-dialog[open]");
      await dialog.locator("img").evaluate(node => node.decode());
      assert.equal(await dialog.locator("img").getAttribute("src"),url);
      assert.equal(await dialog.locator("#dialog-download").getAttribute("href"),url);
      const before=await dialog.locator("img").boundingBox();
      await dialog.locator("#dialog-zoom").click();
      const after=await dialog.locator("img").boundingBox();
      assert.ok(Math.abs(before.width-after.width) > 25);
      if (i===5 && mode==="ordinary") {
        const pending=page.waitForEvent("download");
        await dialog.locator("#dialog-download").click();
        const download=await pending;
        assert.ok(download.suggestedFilename().endsWith(suffix));
      }
      await dialog.locator("#dialog-close").click();
    }
    for (let i=0;i<8;i++) await verifySection(i,"ordinary");
    // Exercise the original data explorers, original figure and its lightbox.
    const evidence=page.locator("#evidence");
    await evidence.locator(":scope > details").first().locator("summary").first().click();
    await page.locator("#model-select").selectOption("DiffWave");
    await page.locator("#dataset-select").selectOption("FMA-Large");
    assert.equal(await page.locator("#lsa-tpr").innerText(),"18%");
    await page.locator("#unit-toggle").click();
    assert.equal(await page.locator("#lsa-tpr").innerText(),"0.18");
    const journal=evidence.locator("[data-journal-explorer]");
    assert.match(await journal.locator("tbody").innerText(),/16\.55%[\s\S]*0\.70%/);
    await journal.locator("select").selectOption("ablation");
    assert.equal(await journal.locator("tbody tr").count(),4);
    await evidence.locator(":scope > details").first().locator("summary").first().click();
    await evidence.locator(":scope > details").last().locator("summary").first().click();
    await evidence.locator("[data-dialog-image]").first().click();
    assert.match(await page.locator("#dialog-image").getAttribute("src"),/figure2-a/);
    await page.locator("#dialog-close").click();
    await evidence.locator(":scope > details").last().locator("summary").first().click();
    const other=language==="en"?"zh-CN":"en";
    async function toggleLang(to) {
      await page.locator("#language-toggle").click();
      await page.waitForFunction(lang=>document.documentElement.lang===lang,to);
    }
    await toggleLang(other); await toggleLang(language);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.locator("#focus-toggle").click();
    for (let i=0;i<8;i++) {
      assert.equal(await page.locator("[data-focus-step]:visible").count(),1);
      assert.equal(await page.locator("#focus-current").innerText(),String(i+1));
      await verifySection(i,"focus");
      if (i===2) {
        await toggleLang(other);
        const img=sections.nth(i).locator(".plate-open img");
        await img.evaluate(node=>node.decode());
        assert.ok((await img.evaluate(node=>node.currentSrc)).endsWith(other==="en"?"-en.svg":"-zh.svg"));
        await toggleLang(language);
      }
      if (i<7) await page.locator("#focus-next").click();
    }
    await page.locator("#focus-prev").click();
    await page.locator("#resources-title").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#focus-current").innerText(),"8");
    await page.keyboard.press("Escape");
    assert.ok(page.url().endsWith("#evidence"));
    assert.equal(await sections.locator(":scope:visible").count(),8);
    url.searchParams.set("focus","1");url.searchParams.set("step","6");
    await page.goto(url.href,{waitUntil:"domcontentloaded"});
    await page.locator("#ms-chn.is-active").waitFor();
    if (mobile) {
      const client=await page.context().newCDPSession(page);
      await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:275,y:285}]});
      for (const x of [235,195,155,115,75]) {
        await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:285}]});
      }
      await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
      await page.waitForFunction(()=>document.querySelector("#focus-current").textContent==="7");
      assert.equal(await page.locator("#focus-current").innerText(),"7");
    }
    assert.deepEqual(errors,[]);
    console.log("PASS",width+"×"+(mobile?844:720),language,"8 ordinary + 8 Focus figures, zoom, download, language, navigation, evidence and original paper panel");
  } finally { await browser.close(); }
}
(async()=>{
  if (out) await fs.mkdir(out,{recursive:true});
  for (const width of widths) for (const language of ["en","zh-CN"]) await test(width,language);
})().catch(error=>{console.error(error);process.exitCode=1;});
