import { expect, type Page, test } from "@playwright/test";

const employeeEmail = process.env.E2E_EMPLOYEE_EMAIL;
const employeePassword = process.env.E2E_EMPLOYEE_PASSWORD;
const apiBaseUrl = process.env.E2E_API_BASE_URL;

test.skip(
  !employeeEmail || !employeePassword || !apiBaseUrl,
  "E2E employee credentials and API base URL are required",
);

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function changeStatus(page: Page, action: string, expected: string) {
  await page.getByRole("button", { name: action, exact: true }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: action, exact: true }).click();
  await expect(page.getByText(expected, { exact: true }).first()).toBeVisible();
}

test("customer and employee complete the shipment lifecycle", async ({
  page,
  request,
}) => {
  const unique = `${Date.now()}-${test.info().workerIndex}`;
  const customerEmail = `release-${unique}@example.test`;
  const customerPassword = "Release-test-123!";

  await page.goto("/register");
  await page.getByLabel("Email").fill(customerEmail);
  await page.locator('input[name="password"]').fill(customerPassword);
  await page.getByLabel("First name").fill("Release");
  await page.getByLabel("Last name").fill("Customer");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page
    .getByRole("main")
    .getByRole("link", { name: "Create shipment", exact: true })
    .click();
  await page.getByLabel("Pickup point").selectOption("WROCLAW");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Delivery point").selectOption("WARSAW");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Cargo description").fill("Release smoke parcel");
  await page.getByLabel("Weight (kg)").fill("2.50");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("button", { name: "Create shipment" })
    .click({ noWaitAfter: true });
  await expect(page.getByText("Shipment created successfully.")).toBeVisible();

  const reference = (
    await page.locator("tbody tr").first().locator("td").first().textContent()
  )?.trim();
  expect(reference).toBeTruthy();
  await page.getByRole("button", { name: "Log out" }).click();

  await signIn(page, employeeEmail!, employeePassword!);
  await expect(page).toHaveURL(/\/employee$/);
  await page.getByLabel("Reference").fill(reference!);
  await page.getByRole("button", { name: "Apply" }).click();
  await page.getByText(reference!, { exact: true }).click();
  await expect(page).toHaveURL(/\/employee\/shipments\//);

  const employeeLoginResponse = await request.post(
    `${apiBaseUrl}/api/auth/login`,
    { data: { email: employeeEmail, password: employeePassword } },
  );
  expect(employeeLoginResponse.ok()).toBe(true);
  const employee = (await employeeLoginResponse.json()) as {
    accessToken: string;
  };
  const shipmentId = page.url().split("/").at(-1);
  expect(shipmentId).toBeTruthy();
  const employeeRecordResponse = await request.get(
    `${apiBaseUrl}/api/employee/shipments/${shipmentId}`,
    { headers: { Authorization: `Bearer ${employee.accessToken}` } },
  );
  expect(employeeRecordResponse.ok()).toBe(true);
  const initialRecord = (await employeeRecordResponse.json()) as {
    shipment: { id: string; version: number };
  };

  await changeStatus(page, "Accept shipment", "Accepted");
  await changeStatus(page, "Mark in transit", "In transit");
  await changeStatus(page, "Mark delivered", "Delivered");
  await expect(page.getByText("Status history")).toBeVisible();

  const staleUpdateResponse = await request.patch(
    `${apiBaseUrl}/api/employee/shipments/${initialRecord.shipment.id}/status`,
    {
      data: { status: "CANCELLED", version: initialRecord.shipment.version },
      headers: { Authorization: `Bearer ${employee.accessToken}` },
    },
  );
  expect(staleUpdateResponse.status()).toBe(409);
  const historyResponse = await request.get(
    `${apiBaseUrl}/api/employee/shipments/${initialRecord.shipment.id}/status-events`,
    { headers: { Authorization: `Bearer ${employee.accessToken}` } },
  );
  expect(historyResponse.ok()).toBe(true);
  expect(((await historyResponse.json()) as unknown[]).length).toBe(3);
  await page.getByRole("button", { name: "Log out" }).click();

  await signIn(page, customerEmail, customerPassword);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("link", { name: "Shipments" }).click();
  const row = page.locator("tbody tr").filter({ hasText: reference! });
  await expect(row).toContainText("Delivered");

  await page.goto("/employee");
  await expect(page).toHaveURL(/\/dashboard$/);

  const loginResponse = await request.post(`${apiBaseUrl}/api/auth/login`, {
    data: { email: customerEmail, password: customerPassword },
  });
  expect(loginResponse.ok()).toBe(true);
  const customer = (await loginResponse.json()) as { accessToken: string };
  const forbiddenResponse = await request.get(
    `${apiBaseUrl}/api/employee/shipments`,
    { headers: { Authorization: `Bearer ${customer.accessToken}` } },
  );
  expect(forbiddenResponse.status()).toBe(403);
});
