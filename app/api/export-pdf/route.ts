import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const { url, elementId, title } = await request.json();
    
    if (!url || !elementId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to match the preview
    await page.setViewport({
      width: 816, // 8.5 inches at 96 DPI
      height: 1056, // 11 inches at 96 DPI
      deviceScaleFactor: 2 // High resolution
    });
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for React to render and the element to be visible
    await page.waitForFunction(
      (elementId) => {
        const element = document.getElementById(elementId);
        return element && element.offsetHeight > 0;
      },
      { timeout: 15000 },
      elementId
    );
    
    // Additional wait to ensure all dynamic content is loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if element exists, if not, generate PDF of the entire page
    const elementExists = await page.$(`#${elementId}`);
    
    let pdfBuffer;
    if (elementExists) {
      // Generate PDF with minimal margins
      pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.1in',
          right: '0.1in',
          bottom: '0.1in',
          left: '0.1in',
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });
    } else {
      // Fallback: generate PDF of the entire page
      console.warn(`Element #${elementId} not found, generating PDF of entire page`);
      pdfBuffer = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: {
          top: '0.1in',
          right: '0.1in',
          bottom: '0.1in',
          left: '0.1in',
        },
        preferCSSPageSize: false,
        displayHeaderFooter: false
      });
    }
    
    await browser.close();
    
    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title || 'cover-letter'}.pdf"`
      }
    });
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
