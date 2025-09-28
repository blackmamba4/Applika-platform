// lib/analytics.ts
// Google Analytics 4 Integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
  page?: string;
  userAgent?: string;
  referrer?: string;
}

export interface UserJourneyEvent {
  step: string;
  action: string;
  data?: Record<string, any>;
  timestamp?: Date;
}

export interface CoverLetterAnalytics {
  templateId: string;
  generationTime: number;
  success: boolean;
  error?: string;
  tokensUsed: number;
  userSatisfaction?: number;
}

export interface UserEngagement {
  pageViews: number;
  timeOnSite: number;
  coverLettersGenerated: number;
  templatesUsed: string[];
  lastActive: Date;
}

class GoogleAnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private pageStartTime: number;
  private events: AnalyticsEvent[] = [];
  private journey: UserJourneyEvent[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageStartTime = Date.now();
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Track page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.track('page_hidden', {
            timeOnPage: Date.now() - this.pageStartTime
          });
        } else {
          this.track('page_visible');
          this.pageStartTime = Date.now();
        }
      });

      // Track page unload
      window.addEventListener('beforeunload', () => {
        this.track('page_unload', {
          timeOnPage: Date.now() - this.pageStartTime,
          sessionDuration: Date.now() - this.startTime
        });
      });
    }
  }

  // Core tracking method using Google Analytics
  async track(event: string, properties?: Record<string, any>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      sessionId: this.sessionId,
      timestamp: new Date(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };

    this.events.push(analyticsEvent);

    // Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        event_category: 'User Interaction',
        event_label: properties?.templateId || properties?.page || 'Unknown',
        value: properties?.generationTime || properties?.tokensUsed || 0,
        custom_map: {
          session_id: this.sessionId,
          user_id: properties?.userId,
          ...properties
        }
      });
    }

    // Send to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  // User journey tracking
  async trackJourney(step: string, action: string, data?: Record<string, any>): Promise<void> {
    const journeyEvent: UserJourneyEvent = {
      step,
      action,
      data,
      timestamp: new Date(),
    };

    this.journey.push(journeyEvent);

    await this.track('user_journey', {
      step,
      action,
      data,
      journeyLength: this.journey.length,
    });
  }

  // Cover letter specific analytics
  async trackCoverLetterGeneration(analytics: CoverLetterAnalytics): Promise<void> {
    await this.track('cover_letter_generated', {
      templateId: analytics.templateId,
      generationTime: analytics.generationTime,
      success: analytics.success,
      error: analytics.error,
      tokensUsed: analytics.tokensUsed,
      userSatisfaction: analytics.userSatisfaction,
    });
  }

  // User engagement tracking
  async trackEngagement(action: string, data?: Record<string, any>): Promise<void> {
    await this.track('user_engagement', {
      action,
      data,
      sessionDuration: Date.now() - this.startTime,
    });
  }

  // Performance tracking
  async trackPerformance(metric: string, value: number, context?: Record<string, any>): Promise<void> {
    await this.track('performance_metric', {
      metric,
      value,
      context,
    });
  }

  // Error tracking
  async trackError(error: Error, context?: Record<string, any>): Promise<void> {
    await this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    });
  }

  // Get session data
  getSessionData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      eventsCount: this.events.length,
      journeyLength: this.journey.length,
    };
  }
}

// Create singleton instance
let analyticsInstance: GoogleAnalyticsTracker | null = null;

export function getAnalytics(): GoogleAnalyticsTracker {
  if (!analyticsInstance) {
    analyticsInstance = new GoogleAnalyticsTracker();
  }
  return analyticsInstance;
}

// Convenience functions
export const track = (event: string, properties?: Record<string, any>) => 
  getAnalytics().track(event, properties);

export const trackJourney = (step: string, action: string, data?: Record<string, any>) => 
  getAnalytics().trackJourney(step, action, data);

export const trackCoverLetter = (analytics: CoverLetterAnalytics) => 
  getAnalytics().trackCoverLetterGeneration(analytics);

export const trackEngagement = (action: string, data?: Record<string, any>) => 
  getAnalytics().trackEngagement(action, data);

export const trackPerformance = (metric: string, value: number, context?: Record<string, any>) => 
  getAnalytics().trackPerformance(metric, value, context);

export const trackError = (error: Error, context?: Record<string, any>) => 
  getAnalytics().trackError(error, context);

// React hook for analytics
export function useAnalytics() {
  return {
    track: (event: string, properties?: Record<string, any>) => track(event, properties),
    trackJourney: (step: string, action: string, data?: Record<string, any>) => trackJourney(step, action, data),
    trackCoverLetter: (analytics: CoverLetterAnalytics) => trackCoverLetter(analytics),
    trackEngagement: (action: string, data?: Record<string, any>) => trackEngagement(action, data),
    trackPerformance: (metric: string, value: number, context?: Record<string, any>) => trackPerformance(metric, value, context),
    trackError: (error: Error, context?: Record<string, any>) => trackError(error, context),
  };
}