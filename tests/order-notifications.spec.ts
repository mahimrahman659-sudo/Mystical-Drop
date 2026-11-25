import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import {
  addFromHomepage,
  capturedMails,
  countOrders,
  fillCheckout,
  resetTestDatabase,
  submitOrder,
  waitForAppReady,
  waitForMail,
} from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
});

test("placing an order sends the customer confirmation and admin alert exactly once", async ({
  page,
}) => {
  test.slow();
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Miniature Well Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await waitForAppReady(page);
  await fillCheckout(page, {
    fullName: "Notification Buyer",
    phone: "01712345678",
    email: "cod.notify@example.com",
    street: "House 5, Road 6, Banani",
    city: "Dhaka",
    postalCode: "1213",
  });
  await submitOrder(page);

  expect(await countOrders()).toBe(1);

  const confirmation = await waitForMail(
    "cod.notify@example.com",
    "order-confirmation",
  );
  expect(confirmation.subject).toContain("is confirmed");
  const reference = confirmation.text.match(/MD-\d{5}/)?.[0];
  expect(reference).toBeTruthy();
  expect(confirmation.text).toContain("Amount payable on delivery: ৳399");
  expect(confirmation.text).toContain("Cash on Delivery");
  expect(confirmation.text).toContain(
    "We will call you to confirm your order and delivery details",
  );
  expect(confirmation.text).toContain("Notification Buyer");

  // The capture file is shared across the whole run, so match the admin alert
  // by this order's reference rather than "the latest alert".
  await expect
    .poll(
      () =>
        capturedMails().filter(
          (mail) =>
            mail.kind === "order-alert" && mail.text.includes(reference!),
        ).length,
      { timeout: 15_000, message: `Waiting for admin alert for ${reference}` },
    )
    .toBeGreaterThan(0);
  const alert = capturedMails().find(
    (mail) => mail.kind === "order-alert" && mail.text.includes(reference!),
  )!;
  expect(alert.subject).toContain(reference!);
  expect(alert.text).toContain("Amount payable on delivery: ৳399");
  expect(alert.text).toContain("Notification Buyer");
  expect(alert.text).toContain("01712345678");
  expect(alert.text).toContain("call the customer to confirm delivery");
});

test("idempotent replays never resend order notifications", async ({
  request,
}) => {
  const email = "cod.replay@example.com";
  const body = {
    submissionKey: randomUUID(),
    customer: {
      fullName: "Replay Buyer",
      phone: "01812345678",
      email,
      street: "House 8, Road 9, Dhanmondi",
      city: "Dhaka",
      postalCode: "1209",
      instructions: "",
    },
    items: [{ slug: "fountain-01", quantity: 1 }],
    expectedTotal: 399,
  };
  const headers = { Origin: process.env.PLAYWRIGHT_BASE_URL! };

  const first = await request.post("/api/orders", { headers, data: body });
  expect(first.status()).toBe(201);
  const firstPayload = (await first.json()) as {
    order: { id: string; reference: string };
  };
  expect(firstPayload.order.reference).toMatch(/^MD-/);

  // Wait for the first (fire-and-forget) confirmation to land before counting.
  await waitForMail(email, "order-confirmation");
  const beforeReplay = capturedMails().filter(
    (mail) => mail.kind === "order-confirmation",
  ).length;

  const second = await request.post("/api/orders", { headers, data: body });
  expect(second.status()).toBe(200);
  const secondPayload = (await second.json()) as {
    order: { id: string };
  };
  expect(secondPayload.order.id).toBe(firstPayload.order.id);

  // Give any (incorrect) resend time to arrive before asserting none did.
  await new Promise((resolve) => setTimeout(resolve, 1_500));
  const afterReplay = capturedMails().filter(
    (mail) => mail.kind === "order-confirmation",
  ).length;
  expect(afterReplay).toBe(beforeReplay);
  expect(await countOrders()).toBe(1);
});
