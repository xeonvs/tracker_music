import asyncio;
from playwright.async_api import async_playwright;

async def main():
  async with async_playwright() as p:
    browser = await p.chromium.launch();
    page = await browser.new_page();
    errors = [];
    def on_console(msg):
      if msg.type == 'error':
        errors.append(msg.text);
    page.on('console', on_console);
    await page.goto('http://localhost:8000/index.cowbell.html');
    await page.wait_for_selector('#playlist li');
    count = await page.locator('#playlist li').count();
    assert count > 0;
    await page.click('#btn-play');
    await page.click('#btn-next');
    await page.click('#btn-prev');
    assert not errors;
    await browser.close();

asyncio.run(main());
