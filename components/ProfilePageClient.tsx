"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  User as UserIcon,
  Mail,
  Settings,
  FileText,
  Upload,
  Trash2,
  Loader2,
  Edit3,
  Save,
  X,
  Calendar,
  MapPin,
  Briefcase,
  Palette,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ToastGlobal";

type ProfilePageClientProps = {
  user: {
    email: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
  profileData: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    desired_role?: string | null;
    tone_default?: string | null;
    locale?: string | null;
  } | null;
  coverLetterCount: number;
};

type CvInfo = { filename: string | null; signedUrl: string | null };

export default function ProfilePageClient({ 
  user, 
  profileData, 
  coverLetterCount 
}: ProfilePageClientProps) {
  const toast = useToast();
  
  // Profile fields
  const [firstName, setFirstName] = useState<string>(profileData?.first_name || "");
  const [lastName, setLastName] = useState<string>(profileData?.last_name || "");
  const [tone, setTone] = useState<"Professional" | "Modern" | "Creative" | "Direct">(
    (profileData?.tone_default as any) || "Professional"
  );
  const [locale, setLocale] = useState<"UK" | "US" | "EU">(
    (profileData?.locale as any) || "UK"
  );
  const [desiredRole, setDesiredRole] = useState<string>(profileData?.desired_role || "");

  // CV
  const [cv, setCv] = useState<CvInfo>({ filename: null, signedUrl: null });
  const [cvLoading, setCvLoading] = useState(false);
  const [cvRemoveOpen, setCvRemoveOpen] = useState(false);
  const [removingCv, setRemovingCv] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  useEffect(() => {
    refreshCv();
  }, []);

  async function refreshCv() {
    setCvLoading(true);
    try {
      const res = await fetch("/api/cv/resolve");
      if (res.ok) {
        const data = (await res.json()) as { filename: string; signedUrl: string };
        setCv({ filename: data.filename, signedUrl: data.signedUrl });
      } else {
        setCv({ filename: null, signedUrl: null });
      }
    } catch {
      setCv({ filename: null, signedUrl: null });
    } finally {
      setCvLoading(false);
    }
  }

  async function uploadCv(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/cv/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const msg = await res.text();
      toast.show({ message: `Upload failed: ${msg}` });
      return;
    }
    await refreshCv();
    toast.show({ message: "CV uploaded successfully!" });
  }

  async function removeCvConfirmed() {
    setRemovingCv(true);
    try {
      const res = await fetch("/api/cv/remove", { method: "POST" });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Remove failed");
      }
      setCv({ filename: null, signedUrl: null });
      toast.show({ message: "CV removed successfully" });
    } catch (e: any) {
      toast.show({ message: e?.message || "Remove failed" });
    } finally {
      setRemovingCv(false);
      setCvRemoveOpen(false);
    }
  }

  // Calculate profile completion
  const profilePct = useMemo(() => {
    const checks = [
      firstName.trim(),
      lastName.trim(),
      desiredRole.trim(),
      tone,
      locale,
      cv.filename ? "cv" : "",
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / 6) * 100);
  }, [firstName, lastName, desiredRole, tone, locale, cv.filename]);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          tone_default: tone,
          locale,
          desired_role: desiredRole,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save profile");
      }
      setIsEditing(false);
      toast.show({ message: "Profile saved successfully!", confetti: true });
    } catch (e: any) {
      toast.show({ message: e?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to delete account");
      }
      toast.show({ message: "Account deleted successfully" });
      window.location.href = "/auth/login";
    } catch (e: any) {
      toast.show({ message: e?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  const fullNameDisplay = `${firstName || ""} ${lastName || ""}`.trim() || user?.name || "Your Name";
  const initials = fullNameDisplay.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 pt-0 pb-2">
        {/* Back Button */}
        <div className="mb-2">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-violet-500 to-purple-600 p-8 text-white mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-2xl font-bold shadow-lg">
              {initials}
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{fullNameDisplay}</h1>
              <div className="flex items-center gap-2 text-white/80 mb-3">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">{coverLetterCount} Cover Letters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{profilePct}% Complete</span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-600">{firstName || "Not set"}</div>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-600">{lastName || "Not set"}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Email Address</Label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Verified</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Preferences */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Professional Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Desired Role</Label>
                  {isEditing ? (
                    <Input
                      value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)}
                      placeholder="e.g. Marketing Manager, React Engineer"
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 text-sm text-gray-600">{desiredRole || "Not specified"}</div>
                  )}
                </div>

                <div>
                  <Label>Writing Tone</Label>
                  {isEditing ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["Professional", "Modern", "Creative", "Direct"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            tone === t
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-gray-600">{tone}</span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        Default
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Locale</Label>
                  {isEditing ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["UK", "US", "EU"] as const).map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocale(loc)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            locale === loc
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{locale}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CV Management */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  CV Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cvLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading CV...</span>
                  </div>
                ) : cv.filename ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-800">{cv.filename}</div>
                          <div className="text-sm text-green-600">CV uploaded successfully</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={cv.signedUrl ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                        >
                          View
                        </a>
                        <label className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.odt,.txt,.md,.rtf"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) void uploadCv(f);
                            }}
                          />
                          Replace
                        </label>
                        <button
                          onClick={() => setCvRemoveOpen(true)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">No CV uploaded</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your CV to help generate better cover letters
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.odt,.txt,.md,.rtf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadCv(f);
                        }}
                      />
                      Upload CV
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Accepted: PDF, DOCX, ODT, TXT, MD, RTF
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{profilePct}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${profilePct}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Name", completed: !!(firstName && lastName) },
                      { label: "Desired Role", completed: !!desiredRole },
                      { label: "Writing Tone", completed: !!tone },
                      { label: "Locale", completed: !!locale },
                      { label: "CV Upload", completed: !!cv.filename },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={item.completed ? "text-gray-700" : "text-gray-500"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing && (
                  <Button onClick={onSave} disabled={saving} className="w-full">
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                )}
                
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                  </summary>
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm text-red-700 mb-3">
                      Permanently delete your account and all associated data.
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmOpen(true)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-lg font-semibold text-red-600 mb-2">
              Delete Account?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              This action cannot be undone. All your cover letters, profile data, and account information will be permanently deleted.
            </AlertDialog.Description>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              Type <strong>DELETE</strong> to confirm:
            </AlertDialog.Description>

            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mb-4"
            />

            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" disabled={deleting}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  disabled={!canDelete || deleting}
                  onClick={onDelete}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Account
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* CV Remove Confirmation Dialog */}
      <AlertDialog.Root open={cvRemoveOpen} onOpenChange={setCvRemoveOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-lg font-semibold mb-2">
              Remove CV?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-600 mb-4">
              This will remove your uploaded CV from your profile. You can upload a new one anytime.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline" disabled={removingCv}>
                  Cancel
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="destructive"
                  disabled={removingCv}
                  onClick={removeCvConfirmed}
                >
                  {removingCv ? "Removing..." : "Remove CV"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
