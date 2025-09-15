import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest, schemas, createValidationErrorResponse } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    const validation = await validateRequest(request, schemas.profileUpdate);
    if (!validation.isValid) {
      return NextResponse.json(
        createValidationErrorResponse(validation.errors),
        { status: 400 }
      );
    }

    const { first_name, last_name, tone_default, locale, desired_role } = validation.data;

    // Update the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        tone_default: tone_default || null,
        locale: locale || null,
        desired_role: desired_role || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
