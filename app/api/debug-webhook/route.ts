import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  
  const checks = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + "...",
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + "...",
  };
  
  
  // Test Supabase connection
  let supabaseTest = "❌ Failed";
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Test a simple query
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);
    
    if (error) {
      supabaseTest = `❌ Query error: ${error.message}`;
    } else {
      supabaseTest = "✅ Connected successfully";
    }
  } catch (err: any) {
    supabaseTest = `❌ Connection error: ${err.message}`;
  }
  
  return NextResponse.json({
    environment: checks,
    supabaseTest,
    timestamp: new Date().toISOString()
  });
}
