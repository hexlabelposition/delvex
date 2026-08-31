import type { UserEntity } from "@entities/user";
import { Card } from "@shared/ui";
import { CalendarIcon, MailIcon } from "lucide-react";
import { cn } from "tailwind-variants";
import { getDetails } from "../model/details";
import { memberSinceFormatter } from "../lib/date";
import { UpdateProfileForm } from "@features/update-profile";
import { ChangePasswordForm } from "@features/change-password";
import { LogoutCard } from "@features/auth/logout";

interface ProfileViewProps {
  user: UserEntity;
}

export function ProfileView({ user }: ProfileViewProps) {
  const details = getDetails(user);

  return (
    <main className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your Delvex account details.</p>
      </div>

      <section className="bg-card relative overflow-hidden rounded-2xl border">
        <div
          className="bg-primary/10 pointer-events-none absolute -top-24 right-0 size-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div
          className="bg-muted pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:gap-6 sm:px-10 sm:py-10">
          <span className="bg-primary/10 text-primary flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold sm:size-16 sm:text-xl">
            {user.initials}
          </span>

          <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight wrap-break-word sm:text-3xl">
              {user.fullName}
            </h2>

            <div className="text-muted-foreground mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-5">
              <span className="flex min-w-0 items-center gap-2">
                <MailIcon
                  className="text-primary size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{user.email}</span>
              </span>

              <span className="flex items-center gap-2">
                <CalendarIcon
                  className="text-primary size-4 shrink-0"
                  aria-hidden="true"
                />
                Client since {memberSinceFormatter.format(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header>
          <p className="text-primary text-sm font-medium">Settings</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Keep your details up to date.
          </h3>
        </header>

        <div className="grid gap-6 xl:grid-cols-2">
          <UpdateProfileForm
            key={`${user.firstName}|${user.lastName}`}
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
          />

          <ChangePasswordForm />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header>
          <p className="text-primary text-sm font-medium">Account details</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            Everything we keep about you.
          </h3>
        </header>

        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {details.map(({ label, value, className }) => (
            <Card.Root
              key={label}
              className="min-w-0 gap-0 px-(--card-spacing) shadow-none"
            >
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
              </dt>
              <dd className={cn("mt-2 font-medium", className ?? "truncate")}>
                {value}
              </dd>
            </Card.Root>
          ))}
        </dl>
      </section>

      <section>
        <LogoutCard />
      </section>
    </main>
  );
}
