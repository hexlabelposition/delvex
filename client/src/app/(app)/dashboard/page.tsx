"use client";

import { ArrowRight, List, PackagePlus, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-provider";
import { getShipments } from "@/features/dashboard/api";
import { EmptyState } from "@/features/dashboard/empty-state";
import { ShipmentsTable } from "@/features/dashboard/shipments-table";
import type { ShipmentPage } from "@/lib/api/types";

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const [data, setData] = useState<ShipmentPage | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (session === null) return;
    void getShipments(session.accessToken, 0, 5)
      .then(setData)
      .catch(() => setError(true));
  }, [session]);

  const firstName = session?.user.firstName ?? "there";
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        Good afternoon, {firstName}
      </h1>
      <p className="text-muted-foreground mt-2">
        Here is where your shipments stand right now.
      </p>
      <div className="mt-7 grid gap-3 md:grid-cols-3">
        <Card className="gap-0 py-0">
          <CardHeader className="px-5 pt-5">
            <CardDescription>Total shipments</CardDescription>
            <CardTitle className="mt-1 text-4xl">
              {data?.totalElements ?? (isLoading ? "—" : "0")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground px-5 pt-2 pb-5 text-sm">
            All shipments on your account
          </CardContent>
        </Card>
        <Link href="/create">
          <Card className="hover:bg-muted/30 h-full gap-0 py-0 transition-colors">
            <CardHeader className="px-5 pt-5">
              <PackagePlus className="bg-muted mb-3 size-8 rounded-md p-1.5" />
              <CardTitle>Create shipment</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground px-5 pt-2 pb-5 text-sm">
              Origin, destination, cargo and schedule in four steps.
            </CardContent>
          </Card>
        </Link>
        <Link href="/shipments">
          <Card className="hover:bg-muted/30 h-full gap-0 py-0 transition-colors">
            <CardHeader className="px-5 pt-5">
              <List className="bg-muted mb-3 size-8 rounded-md p-1.5" />
              <CardTitle>All shipments</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground px-5 pt-2 pb-5 text-sm">
              Browse the full paginated list, newest first.
            </CardContent>
          </Card>
        </Link>
      </div>
      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently created</h2>
          {data !== null && data.content.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/shipments" />}
            >
              View all <ArrowRight />
            </Button>
          )}
        </div>
        {error ? (
          <EmptyState
            icon={Truck}
            title="Couldn’t load shipments"
            description="Please try again in a moment."
          />
        ) : data !== null && data.content.length > 0 ? (
          <ShipmentsTable shipments={data.content} compact />
        ) : (
          <EmptyState
            icon={Truck}
            title="No shipments yet"
            description="Create your first shipment to start tracking it here."
            action={
              <Button render={<Link href="/create" />}>
                Create shipment <ArrowRight />
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
