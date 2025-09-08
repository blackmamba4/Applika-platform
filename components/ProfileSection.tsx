"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User as UserIcon,
  Mail,
  Shield,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ToastGlobal";

type ProfileSectionProps = {
  user?: {
    email?: string | null;
    name?: string | null; // legacy full_name fallback
    avatarUrl?: string | null;
  } | null;
  profileData?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    desired_role?: string | null;
    tone_default?: string | null;
    locale?: string | null;
  } | null;
};

type CvInfo = { filename: string | null; signedUrl: string | null };

export default function ProfileSection({ user, profileData }: ProfileSectionProps) {
  const toast = useToast();
  // --- profile fields (initialized from props; no /api/me)
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

  // ui state
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"overview" | "edit">("overview");

  // delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  // ------- initialize profile fields from props -------
  useEffect(() => {
    const legacy = (user?.name || "").trim();
    if (legacy) {
      const [f, ...rest] = legacy.split(" ");
      setFirstName(f || "");
      setLastName(rest.join(" "));
    }
  }, [user?.name]);

  useEffect(() => {
    refreshCv();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    toast.show({ message: "CV uploaded" });
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
      toast.show({ message: "CV removed" });
    } catch (e: any) {
      toast.show({ message: e?.message || "Remove failed" });
    } finally {
      setRemovingCv(false);
      setCvRemoveOpen(false);
    }
  }

  // progress = 6 fields
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
      setTab("overview");
      toast.show({ message: "Profile saved", confetti: true });
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
      toast.show({ message: "Account deleted" });
      window.location.href = "/auth/login";
    } catch (e: any) {
      toast.show({ message: e?.message || "Delete failed" });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  const fullNameDisplay =
    `${firstName || ""} ${lastName || ""}`.trim() ||
    user?.name ||
    "Your name";

  return (
    <div className="space-y-4">
      {/* Profile Panel */}
      <Card className="hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </span>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-2 w-28 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <span className="text-foreground/70">{profilePct}%</span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as any)}>
            <div className="mb-3 border-b">
              <Tabs.List className="flex gap-2">
                <Tabs.Trigger
                  value="overview"
                  className={`px-3 py-2 text-sm border-b-2 -mb-[1px] ${
                    tab === "overview"
                      ? "border-foreground font-medium"
                      : "border-transparent text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="edit"
                  className={`px-3 py-2 text-sm border-b-2 -mb-[1px] ${
                    tab === "edit"
                      ? "border-foreground font-medium"
                      : "border-transparent text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Edit Profile
                </Tabs.Trigger>
              </Tabs.List>
            </div>

            {/* Overview */}
            <Tabs.Content value="overview" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground/10 text-lg font-semibold">
                  {fullNameDisplay?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{fullNameDisplay}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-foreground/60">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{user?.email || "you@example.com"}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-1.5 text-sm">
                <div className="text-xs text-foreground/60">Defaults</div>
                <div className="text-foreground/80">
                  Tone: <span className="font-medium">{tone}</span> · Locale:{" "}
                  <span className="font-medium">{locale}</span>
                  {desiredRole ? (
                    <>
                      {" "}
                      · Desired role:{" "}
                      <span className="font-medium">{desiredRole}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs text-foreground/60">CV</div>
                {cvLoading ? (
                  <div className="text-sm text-foreground/60">Loading CV…</div>
                ) : cv.filename ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <a
                      href={cv.signedUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {cv.filename}
                    </a>
                    <span className="text-foreground/30">·</span>
                    <label className="rounded-full border px-3 py-1 cursor-pointer hover:bg-white">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.odt,.txt,.md,.rtf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadCv(f);
                        }}
                      />
                      Change
                    </label>
                    <button
                      onClick={() => setCvRemoveOpen(true)}
                      className="rounded-full border px-3 py-1 hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-foreground/60">
                      No CV added yet.
                    </div>
                    <label className="rounded-full border px-3 py-1 cursor-pointer hover:bg-white text-sm">
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
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setTab("edit")}>Edit</Button>
              </div>
            </Tabs.Content>

            {/* Edit */}
            <Tabs.Content value="edit" className="space-y-5">
              {/* Personal */}
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>First name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. James"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Last name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Reid"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ""} disabled />
                </div>
              </div>

              {/* App defaults */}
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <Label>Tone</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["Professional", "Modern", "Creative", "Direct"] as const).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className={`rounded-full border px-3 py-1.5 text-sm ${
                            tone === t
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                              : "hover:bg-white"
                          }`}
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Locale</Label>
                  <div className="flex flex-wrap gap-2">
                    {(["UK", "US", "EU"] as const).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocale(loc)}
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          locale === loc
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                            : "hover:bg-white"
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label>Desired role</Label>
                  <Input
                    value={desiredRole}
                    onChange={(e) => setDesiredRole(e.target.value)}
                    placeholder="e.g. Marketing Manager, React Engineer"
                  />
                </div>
              </div>

              {/* CV row (same actions as overview for convenience) */}
              <div className="grid gap-1.5">
                <Label>CV</Label>
                {cv.filename ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <a
                      href={cv.signedUrl ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      {cv.filename}
                    </a>
                    <span className="text-foreground/30">·</span>
                    <label className="rounded-full border px-3 py-1 cursor-pointer hover:bg-white">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.odt,.txt,.md,.rtf"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadCv(f);
                        }}
                      />
                      Change
                    </label>
                    <button
                      onClick={() => setCvRemoveOpen(true)}
                      className="rounded-full border px-3 py-1 hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="rounded-full border px-3 py-1 cursor-pointer hover:bg-white w-fit text-sm">
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
                )}
                <p className="text-xs text-foreground/60">
                  Accepted: PDF, DOCX, ODT, TXT. We extract plain text to help with matching.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setTab("overview")}
                >
                  Cancel
                </Button>
                <Button onClick={onSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>

              {/* More settings (collapsible) */}
              <details className="mt-2 rounded-lg border bg-white p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  More settings
                </summary>
                <div className="mt-3">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-red-700">
                          Danger zone
                        </div>
                        <div className="mt-1 text-xs text-red-700/80">
                          Permanently deletes your account and all associated data.
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </details>
            </Tabs.Content>
          </Tabs.Root>
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-base font-semibold">
              Delete account?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-foreground/70">
              This action cannot be undone. Type <b>DELETE</b> to confirm.
            </AlertDialog.Description>

            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mt-3"
            />

            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  disabled={deleting}
                  className="rounded-full border px-3 py-2 text-sm hover:bg-white"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  disabled={!canDelete || deleting}
                  onClick={onDelete}
                  className="rounded-full bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  )}
                  Delete account
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Confirm remove CV dialog */}
      <AlertDialog.Root open={cvRemoveOpen} onOpenChange={setCvRemoveOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-5 shadow-xl focus:outline-none">
            <AlertDialog.Title className="text-base font-semibold">
              Remove saved CV?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-foreground/70">
              This removes the currently uploaded CV from your profile.
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <button
                  className="rounded-full border px-3 py-2 text-sm hover:bg-white"
                  disabled={removingCv}
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={removeCvConfirmed}
                  disabled={removingCv}
                  className="rounded-full bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {removingCv ? "Removing…" : "Remove CV"}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
