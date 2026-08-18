"use client";

import { Check, Pencil } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { updateProfile } from "@/features/profile/api";
import { ApiClientError } from "@/lib/api/client";
import { formatDate } from "@/lib/format";

export default function ProfilePage() {
  const { session, setSession, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const user = session?.user;

  const startEditing = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setErrors({});
    setMessage("");
    setEditing(true);
  };
  const save = async () => {
    if (session === null) return;
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "First name is required";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      const updated = await updateProfile(
        { firstName: firstName.trim(), lastName: lastName.trim() },
        session.accessToken,
      );
      setSession({ ...session, user: updated });
      setEditing(false);
      setMessage("Your name was updated.");
    } catch (error) {
      setErrors(error instanceof ApiClientError ? error.fieldErrors : {});
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (user === undefined)
    return <div className="text-muted-foreground">Loading profile…</div>;
  const fullName = `${user.firstName} ${user.lastName}`;
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
      <p className="text-muted-foreground mt-2">
        Your account details. Only your name can be changed here.
      </p>
      {message && (
        <Alert className="mt-5">
          <Check />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Card className="mt-6 gap-0 py-0">
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-4 border-b pb-5">
            <span className="bg-muted flex size-11 items-center justify-center rounded-full font-medium">
              {user.firstName[0]}
              {user.lastName[0]}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{fullName}</h2>
              <p className="text-muted-foreground truncate text-sm">
                {user.email}
              </p>
            </div>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={() => void save()} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={startEditing}>
                <Pencil /> Edit name
              </Button>
            )}
          </div>
          {editing ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  className="mt-2"
                  value={firstName}
                  maxLength={50}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                {errors.firstName && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  className="mt-2"
                  value={lastName}
                  maxLength={50}
                  onChange={(event) => setLastName(event.target.value)}
                />
                {errors.lastName && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <dl className="mt-5 grid gap-x-12 gap-y-5 text-sm sm:grid-cols-2">
              <Info label="User ID" value={user.id} mono />
              <Info label="Email" value={user.email} />
              <Info label="First name" value={user.firstName} />
              <Info label="Last name" value={user.lastName} />
              <Info
                label="Account created"
                value={formatDate(user.createdAt)}
                mono
              />
              <Info
                label="Last updated"
                value={formatDate(user.updatedAt)}
                mono
              />
            </dl>
          )}
        </CardContent>
      </Card>
      <Card className="mt-5 gap-0 py-0">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="font-medium">Log out</h2>
            <p className="text-muted-foreground text-sm">
              You will need to sign in again to see your shipments.
            </p>
          </div>
          <Button variant="destructive" onClick={() => void logout()}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={mono ? "mt-1 font-mono text-xs break-all" : "mt-1"}>
        {value}
      </dd>
    </div>
  );
}
