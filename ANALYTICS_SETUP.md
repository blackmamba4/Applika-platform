# 📊 Analytics Setup Guide

## 🔒 **ADMIN ACCESS CONTROL**

**IMPORTANT**: Analytics are now **admin-only**! Regular users cannot access analytics data.

### **How to Set Up Admin Access:**

1. **Replace the admin email** in these files:
   - `app/Dashboard/analytics/page.tsx` (line 20)
   - `app/Dashboard/layout.tsx` (line 20)
   
   Change `"james@yourdomain.com"` to your actual email address.

2. **Alternative: Use Database Roles**
   - Add a `role` column to your `profiles` table
   - Set your user's role to `"admin"` or `"super_admin"`
   - The system will automatically grant access

### **Admin Access Methods:**
- ✅ **Email-based**: Add your email to the admin list
- ✅ **Role-based**: Set `role = "admin"` in profiles table
- ✅ **Hybrid**: Use both methods for flexibility

## How to Access Your Analytics

### 1. **Navigate to Analytics Dashboard**
- Go to your dashboard: `http://localhost:3000/Dashboard`
- Click on **"Analytics"** in the navigation bar
- Or visit directly: `http://localhost:3000/Dashboard/analytics`

### 2. **Set Up Database Table**
Run this SQL in your Supabase SQL editor:

```sql
-- Create analytics_events table for tracking user behavior
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event VARCHAR(255) NOT NULL,
  properties JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  page VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event ON analytics_events(event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all analytics events" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');
```

### 3. **What You'll See in Analytics**

#### **Key Metrics Dashboard:**
- **Total Users**: Number of registered users
- **Cover Letters**: Total cover letters generated
- **Avg Generation Time**: Average time to generate a cover letter
- **Conversion Rate**: Percentage of users who generate cover letters
- **Page Views**: Page views in the last 7 days
- **Interactions**: User interactions (clicks, selections, etc.)

#### **Popular Templates Section:**
- Shows which templates are used most frequently
- Helps you understand user preferences

#### **Recent Activity Feed:**
- Real-time view of what users are doing
- Shows events like page views, template selections, cover letter generation

### 4. **Analytics Events Being Tracked**

#### **Automatic Tracking:**
- ✅ Page views (when users visit pages)
- ✅ User journeys (step-by-step user flow)
- ✅ Cover letter generation (success/failure, time, templates)
- ✅ Template selections
- ✅ User engagement (clicks, interactions)
- ✅ Performance metrics (page load times, API calls)
- ✅ Error tracking (automatic error capture)

#### **Manual Tracking Available:**
- Custom events
- User satisfaction ratings
- Feature usage
- Conversion tracking

### 5. **How to Test Analytics**

1. **Generate Some Data:**
   - Create a few cover letters
   - Navigate between different pages
   - Try different templates

2. **Check Analytics:**
   - Go to `/Dashboard/analytics`
   - Click "Refresh" to see latest data
   - Watch the "Recent Activity" section update

3. **View Real-time Events:**
   - Open browser dev tools console
   - Navigate around your app
   - You'll see analytics events logged (in development mode)

### 6. **Privacy & Security**

- ✅ **Row Level Security**: Users only see their own data
- ✅ **No Personal Data**: Analytics don't track sensitive information
- ✅ **GDPR Compliant**: Easy to export/delete user data
- ✅ **Secure**: All data stored in your Supabase database

### 7. **Customization Options**

You can easily add more tracking by using the analytics hooks:

```typescript
import { useAnalytics } from '@/lib/hooks/useAnalytics';

const analytics = useAnalytics();

// Track custom events
analytics.track('custom_event', { 
  property1: 'value1',
  property2: 'value2' 
});

// Track user satisfaction
analytics.trackUserSatisfaction('template_id', 5);

// Track feature usage
analytics.trackFeatureUsage('new_feature', { 
  usage_count: 1 
});
```

## 🎯 **You're All Set!**

Your analytics system is now ready to give you valuable insights into:
- How users interact with your platform
- Which features are most popular
- Where users drop off in the funnel
- Performance bottlenecks
- User engagement patterns

The analytics will help you make data-driven decisions to improve your platform! 📈
