import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET() {
  try {
    // Launch a new Puppeteer browser instance
    const browser = await puppeteer.launch({
      headless: true, // Run in headless mode for production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security', // Disable CORB and other web security features
        '--disable-features=IsolateOrigins,site-per-process', // Disable origin isolation
      ],
    });

    const page = await browser.newPage();

    // Navigate to the Pinterest search URL
    await page.goto('https://ca.pinterest.com/search/pins/?q=fashion&rs=rs&eq=&etslf=2129', {
      waitUntil: 'networkidle2', // Ensure the page is fully loaded
    });

    // Scroll down the page to trigger loading of more pins (Pinterest lazy-loads content)
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight); // Scroll by the viewport height
    });
    await page.waitForTimeout(2000); // Wait for more pins to load

    // Evaluate the page content and extract the pins data
    const pins = await page.evaluate(() => {
      const pinElements = document.querySelectorAll('div[data-test-id="pin"]'); // Adjust this selector based on the page structure
      const pinData = [];

      pinElements.forEach((pin) => {
        const titleElement = pin.querySelector('div[data-test-id="pin-title"]');
        const imageElement = pin.querySelector('img');
        const linkElement = pin.closest('a'); // Find the link to the pin

        if (titleElement && imageElement && linkElement) {
          pinData.push({
            title: titleElement.textContent.trim(), // Pin title
            image: imageElement.src, // Pin image URL
            link: linkElement.href, // Pin link
          });
        }
      });

      return pinData;
    });

    // Close the browser instance after scraping
    await browser.close();

    // Return the scraped data as JSON
    return NextResponse.json(pins);
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json({ error: 'Failed to scrape Pinterest data' }, { status: 500 });
  }
}
