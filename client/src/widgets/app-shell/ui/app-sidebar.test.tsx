import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@shared/ui";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/shipments/create" }));
vi.mock("@features/auth/logout", () => ({ logoutAction: vi.fn() }));

describe("app sidebar", () => {
  it("marks the deepest matching route as current", async () => {
    render(
      <Sidebar.Provider>
        <AppSidebar
          fullName="Ada Lovelace"
          email="ada@delvex.test"
          initials="AL"
        />
        <Sidebar.Inset>
          <AppHeader />
        </Sidebar.Inset>
      </Sidebar.Provider>,
    );

    expect(screen.getByRole("link", { name: "New shipment" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Shipments" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    await userEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "Expand sidebar" }),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="sidebar-wrapper"]'),
    ).toHaveAttribute("data-state", "collapsed");
  });
});
