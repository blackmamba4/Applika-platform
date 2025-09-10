// components/coverLetter/A4PageBreak.tsx
"use client";

interface A4PageBreakProps {
  show: boolean;
  isEditing: boolean;
  position?: number; // Position from top in pixels, defaults to A4 page height (297mm = 1123px at 96 DPI)
}

export const A4PageBreak = ({ 
  show, 
  isEditing, 
  position = 1123 // A4 page height: 297mm = 1123px at 96 DPI
}: A4PageBreakProps) => {
  if (!show) {
    return null;
  }

  const blurAreaHeight = 40;
  const blurAreaTop = position - (blurAreaHeight / 2);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Blurred background area around the page break */}
      <div 
        className="absolute w-full"
        style={{ 
          top: `${blurAreaTop}px`,
          height: `${blurAreaHeight}px`,
          left: 0,
          right: 0,
          backdropFilter: 'blur(1px)',
          backgroundColor: 'rgba(255, 255, 255, 0.2)'
        }}
      />
      
      {/* A4 Page Break Line - normal color */}
      <div 
        className="absolute w-full border-t-2 border-dashed border-gray-400 opacity-80"
        style={{ 
          top: `${position}px`,
          left: 0,
          right: 0
        }}
      />
      
      {/* A4 BREAK Text - normal styling */}
      <div 
        className="absolute text-gray-500 text-sm font-medium opacity-70"
        style={{ 
          top: `${position}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '-8px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '2px 6px',
          borderRadius: '3px'
        }}
      >
        A4 BREAK
      </div>
    </div>
  );
};
