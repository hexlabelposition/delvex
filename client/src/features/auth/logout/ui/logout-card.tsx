import { Button, Card } from "@shared/ui";
import { LogOutIcon } from "lucide-react";
import { logoutAction } from "../api/action";

export function LogoutCard() {
  return (
    <Card.Root>
      <Card.Content className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Card.Title>Session</Card.Title>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign out of Delvex on this device. Your shipments stay untouched.
          </p>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <LogOutIcon aria-hidden="true" />
            Log out
          </Button>
        </form>
      </Card.Content>
    </Card.Root>
  );
}
