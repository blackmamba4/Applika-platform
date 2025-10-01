"use client";

import { useEffect } from 'react';

export const ClickDebugger = () => {
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      console.log('🌐 Global Click Debugger:', {
        target: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
          textContent: target.textContent?.substring(0, 50) + '...',
          dataset: target.dataset
        },
        event: {
          type: event.type,
          button: event.button,
          clientX: event.clientX,
          clientY: event.clientY,
          timeStamp: event.timeStamp
        },
        timestamp: new Date().toISOString()
      });

      // Check for specific attributes that might be relevant
      const editableElement = target.closest('[data-editable-element="true"]');
      const inlinePanel = target.closest('[data-inline-editing-panel]');
      
      if (editableElement || inlinePanel) {
        console.log('🎯 Click on editable area:', {
          editableElement: !!editableElement,
          inlinePanel: !!inlinePanel,
          element: editableElement || inlinePanel
        });
      }
    };

    // Add the global click listener
    document.addEventListener('click', handleGlobalClick, true); // Use capture phase

    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, []);

  return null; // This component doesn't render anything
};
