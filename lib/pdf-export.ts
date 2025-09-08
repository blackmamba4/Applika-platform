import jsPDF from 'jspdf';

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
