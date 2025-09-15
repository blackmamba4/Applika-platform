"use client";

import { useEffect } from 'react';
import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Initialize gtag
    if (typeof window !== 'undefined') {
      window.gtag = window.gtag || function() {
        (window.gtag.q = window.gtag.q || []).push(arguments);
      };
      window.gtag.q = window.gtag.q || [];
    }
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

// Enhanced analytics tracking for cover letters
export function trackCoverLetterEvent(
  eventName: string,
  templateId: string,
  properties: Record<string, any> = {}
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'Cover Letter',
      event_label: templateId,
      template_id: templateId,
      ...properties
    });
  }
}

// Track user journey steps
export function trackUserJourney(step: string, action: string, data: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'user_journey', {
      event_category: 'User Journey',
      event_label: `${step} - ${action}`,
      journey_step: step,
      journey_action: action,
      ...data
    });
  }
}

// Track performance metrics
export function trackPerformance(metric: string, value: number, context: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'performance_metric', {
      event_category: 'Performance',
      event_label: metric,
      metric_name: metric,
      metric_value: value,
      ...context
    });
  }
}

// Track errors
export function trackError(error: Error, context: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'error_occurred', {
      event_category: 'Error',
      event_label: error.message,
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }
}
