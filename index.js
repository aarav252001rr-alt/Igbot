const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs-extra");

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

/* --------------------------
   EXPRESS SERVER (Render fix)
--------------------------- */
app.get("/", (req, res) => {
  res.send("Instagram bot running ✅");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

/* --------------------------
   HUMAN DELAY FUNCTION
--------------------------- */
const humanDelay = (min, max) =>
  new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min)) + min)
  );

/* --------------------------
   MAIN BOT FUNCTION
--------------------------- */
async function startBot() {

  console.log("Starting bot...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
  );

  /* --------------------------
     COOKIE LOGIN
  --------------------------- */

  if (await fs.pathExists("cookies.json")) {
    const cookies = await fs.readJson("cookies.json");
    await page.setCookie(...cookies);
    console.log("Cookies loaded 🍪");
  }

  await page.goto("https://www.instagram.com/", {
    waitUntil: "networkidle2"
  });

  await humanDelay(2000, 4000);

  // अगर login page pe gaya → fresh login
  if (page.url().includes("/accounts/login")) {

    console.log("Fresh login required...");

    await page.waitForSelector('input[name="username"]');

    await page.type(
      'input[name="username"]',
      process.env.IG_USER,
      { delay: 120 }
    );

    await humanDelay(1000, 2000);

    await page.type(
      'input[name="password"]',
      process.env.IG_PASS,
      { delay: 140 }
    );

    await humanDelay(1000, 2000);

    await page.click('button[type="submit"]');

    await humanDelay(7000, 9000);

    const cookies = await page.cookies();
    await fs.writeJson("cookies.json", cookies);

    console.log("Login successful & cookies saved ✅");

  } else {

    console.log("Logged in via cookies ✅");
  }

  /* --------------------------
     HUMAN-LIKE IDLE ACTION
  --------------------------- */

  await humanDelay(3000, 5000);

  console.log("Bot finished safely 👍");

  await browser.close();
}

/* --------------------------
   START BOT ON SERVER START
--------------------------- */
startBot().catch(err => {
  console.error("Bot error:", err);
});
