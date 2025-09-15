import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TextBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'signature';
  content: string;
  styles: {
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline';
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  };
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Browser print-to-PDF approach - captures exactly what you see
export async function exportCoverLetterToPDFWithPuppeteer(elementId: string, title: string = 'Cover Letter'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=816,height=1056');
    if (!printWindow) {
      throw new Error('Could not open print window. Please check if popup blockers are enabled and allow popups for this site.');
    }

    // Get all the styles from the current page
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Could not access stylesheet:', e);
          return '';
        }
      })
      .join('\n');

    // Create the HTML content with all styles
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            ${styles}
            
            /* Print-specific styles */
            @media print {
              @page {
                margin: 0.5in;
                size: letter;
              }
              
              body {
                margin: 0;
                padding: 0;
                font-family: Inter, Arial, sans-serif;
                background: white;
              }
              
              #cover-letter-template {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
              
              /* Ensure all text is visible */
              * {
                color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
              }
            }
            
            /* Screen styles for preview */
            body {
              margin: 0;
              padding: 20px;
              font-family: Inter, Arial, sans-serif;
              background: #f5f5f5;
            }
            
            #cover-letter-template {
              background: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
              padding: 0;
              margin: 0 auto;
              max-width: 8.5in;
              min-height: 11in;
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
      </html>
    `;

    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for the content to load
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Print window failed to load within 10 seconds'));
      }, 10000);
      
      printWindow.onload = () => {
        clearTimeout(timeout);
        resolve(undefined);
      };
      
      printWindow.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load content in print window'));
      };
    });

    // Wait a bit more for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Trigger print dialog
    printWindow.print();

    // Close the window after a delay
    setTimeout(() => {
      printWindow.close();
    }, 1000);

  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

// Clean HTML-to-PDF export that preserves exact preview appearance
export async function exportCoverLetterToPDFFromHTML(elementId: string, title: string = 'Cover Letter'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Create a clone of the element to avoid affecting the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Create a clean container that preserves the exact preview appearance
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '8.5in';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '0.5in'; // Standard business letter margins
    tempContainer.style.margin = '0';
    tempContainer.style.fontFamily = 'Inter, Arial, sans-serif';
    tempContainer.style.boxSizing = 'border-box';
    
    // Add the cloned element to the container
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);

    // Wait a moment for any dynamic content to render
    await new Promise(resolve => setTimeout(resolve, 100));

    // Configure html2canvas for high-quality rendering
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // High resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false, // Disable console logging
      imageTimeout: 0,
      removeContainer: true
    });

    // Clean up the temporary container
    document.body.removeChild(tempContainer);

    // Create PDF with proper dimensions
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter'
    });

    // Calculate dimensions to fit the content properly
    const imgWidth = 8.5; // Letter width in inches
    const pageHeight = 11; // Letter height in inches
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

// Legacy function for backward compatibility
export function exportCoverLetterToPDF(blocks: TextBlock[], title: string = 'Cover Letter'): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set up the page dimensions
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 20; // 20mm margin on all sides
  const contentWidth = pageWidth - (margin * 2);
  const contentHeight = pageHeight - (margin * 2);

  // Sort blocks by position
  const sortedBlocks = [...blocks].sort((a, b) => a.position.y - b.position.y);

  let currentY = margin;
  let pageNumber = 1;

  // Add title to first page
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, currentY);
  currentY += 10;

  // Process each block
  for (const block of sortedBlocks) {
    // Check if we need a new page
    if (currentY > pageHeight - margin - 20) {
      pdf.addPage();
      pageNumber++;
      currentY = margin;
    }

    // Convert styles
    const fontSize = block.styles.fontSize * 0.75; // Convert px to mm (approximate)
    const fontStyle = block.styles.fontStyle === 'italic' ? 'italic' : 'normal';
    const fontWeight = block.styles.fontWeight === 'bold' ? 'bold' : 'normal';
    
    // Set font
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle, fontWeight);
    
    // Set text color
    const color = hexToRgb(block.styles.color);
    if (color) {
      pdf.setTextColor(color.r, color.g, color.b);
    }

    // Calculate position
    const x = margin + (block.position.x / 100) * contentWidth;
    const y = currentY + block.styles.marginTop * 0.75; // Convert px to mm

    // Handle text alignment
    let textX = x;
    if (block.styles.textAlign === 'center') {
      textX = pageWidth / 2;
    } else if (block.styles.textAlign === 'right') {
      textX = pageWidth - margin;
    }

    // Split text into lines
    const lines = pdf.splitTextToSize(block.content, contentWidth * (block.size.width / 100));
    
    // Add text
    pdf.text(lines, textX, y, {
      align: block.styles.textAlign,
      lineHeightFactor: block.styles.lineHeight,
    });

    // Update current Y position
    currentY = y + (lines.length * fontSize * block.styles.lineHeight) + block.styles.marginBottom * 0.75;
  }

  // Save the PDF
  pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function exportCoverLetterToHTML(blocks: TextBlock[], title: string = 'Cover Letter'): string {
  const sortedBlocks = [...blocks].sort((a, b) => a.position.y - b.position.y);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            line-height: 1.6;
            color: #333;
        }
        .cover-letter {
            background: white;
            min-height: 11in;
        }
        .text-block {
            margin-bottom: 16px;
        }
        @media print {
            body {
                margin: 0;
                padding: 0.5in;
            }
            .cover-letter {
                min-height: auto;
            }
        }
    </style>
</head>
<body>
    <div class="cover-letter">
        ${sortedBlocks.map(block => `
            <div class="text-block" style="
                font-size: ${block.styles.fontSize}px;
                font-family: ${block.styles.fontFamily};
                font-weight: ${block.styles.fontWeight};
                font-style: ${block.styles.fontStyle};
                text-decoration: ${block.styles.textDecoration};
                color: ${block.styles.color};
                background-color: ${block.styles.backgroundColor};
                text-align: ${block.styles.textAlign};
                line-height: ${block.styles.lineHeight};
                letter-spacing: ${block.styles.letterSpacing}px;
                margin-top: ${block.styles.marginTop}px;
                margin-bottom: ${block.styles.marginBottom}px;
                margin-left: ${block.styles.marginLeft}px;
                margin-right: ${block.styles.marginRight}px;
                padding-top: ${block.styles.paddingTop}px;
                padding-bottom: ${block.styles.paddingBottom}px;
                padding-left: ${block.styles.paddingLeft}px;
                padding-right: ${block.styles.paddingRight}px;
            ">${block.content.replace(/\n/g, '<br>')}</div>
        `).join('')}
    </div>
</body>
</html>`;

  return html;
}
