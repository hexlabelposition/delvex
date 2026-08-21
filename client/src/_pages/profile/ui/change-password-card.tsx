"use client";

import { Button, Card, CardContent, Input } from "@shared/ui";
import { useState } from "react";

import { changePasswordAction } from "../api/change-password";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    const result = await changePasswordAction({
      currentPassword,
      newPassword,
    });

    setMessage(result.message);

    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <Card className="mt-5 gap-0 py-0">
      <CardContent className="p-5">
        <h2 className="font-medium">Change password</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <Input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={() => void submit()}>Change password</Button>
          {message && (
            <p className="text-muted-foreground text-sm">{message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
