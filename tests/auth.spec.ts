import { expect, test, type Page } from "@playwright/test";
import {
  addFromHomepage,
  createGuestOrderViaApi,
  createVerifiedUserDirect,
  fillCheckout,
  getProductPrice,
  getTestDb,
  loginViaUi,
  promoteAdmin,
  registerViaUi,
  registerVerifyAndLogin,
  resetLink,
  priceTestProducts,
  resetTestDatabase,
  submitDemoOrder,
  verificationLink,
  waitForAppReady,
  waitForMail,
} from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
  await priceTestProducts();
});

const KNOWN_STREAMING_HYDRATION_RACE =
  /Minified React error #418;.*args\[\]=HTML/;

function collectHydrationErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !KNOWN_STREAMING_HYDRATION_RACE.test(message.text())
    ) {
      errors.push(`[${page.url()}] ${message.text()}`);
    }
    if (
      message.type() === "warning" &&
      /hydrat|did not match|server rendered/i.test(message.text()) &&
      !KNOWN_STREAMING_HYDRATION_RACE.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (!KNOWN_STREAMING_HYDRATION_RACE.test(error.message)) {
      errors.push(`[${page.url()}] ${error.message}`);
    }
  });
  return errors;
}

test("registration, verification, login, logout, duplicate, and role boundary", async ({
  page,
  request,
}) => {
  await page.goto("/register");
  await waitForAppReady(page);
  await expect(page).toHaveTitle("Create account • Mystical Drop");
  await page.getByLabel(/Full name/).fill("Customer One");
  await page.getByLabel(/Email address/).fill("customer.one@example.com");
  await page.getByLabel(/^Password/).fill("CustomerPass123");
  await page.getByLabel(/Confirm password/).fill("CustomerPass123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/Check your inbox/)).toBeVisible();

  await page.goto("/login");
  await waitForAppReady(page);
  await expect(page).toHaveTitle("Sign in • Mystical Drop");
  await page.getByLabel(/Email address/).fill("customer.one@example.com");
  await page.getByLabel(/^Password/).fill("CustomerPass123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/Verify your email before signing in/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Resend verification email" })).toBeVisible();
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(
    page.getByText(/If the account still needs verification/),
  ).toBeVisible();

  const verificationMail = await waitForMail(
    "customer.one@example.com",
    "verification",
  );
  expect(verificationMail.from).toContain("Mystical Drop");
  expect(verificationMail.subject).toBe("Verify your Mystical Drop account");
  expect(verificationMail.text).toContain("Welcome to Mystical Drop.");
  await page.goto(verificationLink(verificationMail));
  await expect(page).toHaveURL(/\/login\?verified=1/);
  await waitForAppReady(page);
  await expect(page.getByText("Email verified. Sign in to continue.")).toBeVisible();

  await page.getByLabel(/Email address/).fill("customer.one@example.com");
  await page.getByLabel(/^Password/).fill("CustomerPass123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/account");
  await expect(page).toHaveTitle("Your account • Mystical Drop");
  await expect(page.getByRole("heading", { name: "Your quiet corner." })).toBeVisible();
  await expect(page.getByText("customer.one@example.com")).toBeVisible();

  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name.includes("session_token"));
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");

  await page.request.post("/api/auth/update-user", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: { name: "Customer One", role: "admin" },
  });

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/");
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?returnTo=/);

  await page.goto("/login");
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill("customer.one@example.com");
  await page.getByLabel(/^Password/).fill("WrongPassword123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email or password is incorrect.")).toBeVisible();

  await page.goto("/register");
  await waitForAppReady(page);
  await page.getByLabel(/Full name/).fill("Customer Duplicate");
  await page.getByLabel(/Email address/).fill("customer.one@example.com");
  await page.getByLabel(/^Password/).fill("CustomerPass123");
  await page.getByLabel(/Confirm password/).fill("CustomerPass123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText(/Check your inbox/)).toBeVisible();

  const db = await getTestDb();
  expect(
    await db.collection("user").countDocuments({ email: "customer.one@example.com" }),
  ).toBe(1);
  expect(
    (await db.collection("user").findOne({ email: "customer.one@example.com" }))?.role,
  ).toBe("customer");

  const normalized = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      name: "Normalized Email",
      email: "Normalized.Case@Example.com",
      password: "CustomerPass123",
    },
  });
  expect(normalized.ok()).toBe(true);
  expect(
    await db.collection("user").countDocuments({
      email: "normalized.case@example.com",
    }),
  ).toBe(1);

  const injected = await request.post("/api/auth/sign-up/email", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      name: "Role Injection",
      email: "role.injection@example.com",
      password: "CustomerPass123",
      role: "admin",
    },
  });
  expect(injected.ok()).toBe(true);
  const injectedUser = await db
    .collection("user")
    .findOne({ email: "role.injection@example.com" });
  expect(injectedUser?.role).toBe("customer");
});

test("production ignores DEV_MAILBOX_ENABLED and delivers through SMTP without storing mailbox content", async ({
  page,
}) => {
  const mailboxResponse = await page.goto("/dev/mailbox");
  expect(mailboxResponse?.status()).toBe(404);

  const deliveryResponse = await page.request.get("/api/auth-delivery");
  expect(deliveryResponse.ok()).toBe(true);
  await expect(deliveryResponse.json()).resolves.toMatchObject({
    available: true,
    mode: "smtp",
  });

  await registerViaUi(page, {
    name: "SMTP Delivery",
    email: "smtp.delivery@example.com",
    password: "SmtpDeliveryPass123",
  });
  await waitForMail("smtp.delivery@example.com", "verification");

  const db = await getTestDb();
  expect(await db.collection("devMailbox").countDocuments()).toBe(0);
});

test("password reset is generic, single-use, and revokes the old password", async ({
  page,
  request,
}) => {
  await createVerifiedUserDirect(request, {
    name: "Reset Customer",
    email: "reset.customer@example.com",
    password: "OldPass12345",
  });

  await page.goto("/forgot-password");
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill("unknown.person@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByText(/If an account exists for that email/),
  ).toBeVisible();

  await page.goto("/forgot-password");
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill("reset.customer@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByText(/If an account exists for that email/),
  ).toBeVisible();

  const mail = await waitForMail("reset.customer@example.com", "password-reset");
  expect(mail.from).toContain("Mystical Drop");
  expect(mail.subject).toBe("Reset your Mystical Drop password");
  expect(mail.text).toContain("Mystical Drop account.");
  await page.goto(resetLink(mail));
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  await waitForAppReady(page);
  await page.getByLabel(/^New password/).fill("NewPass12345");
  await page.getByLabel(/^Confirm new password/).fill("NewPass12345");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText(/Your password has been updated/)).toBeVisible();

  const resetUrl = mail.text.match(
    /https?:\/\/[^\s]+\/api\/auth\/reset-password\/[^\s]+/,
  )![0];
  await page.goto(resetUrl);
  await expect(page).toHaveURL(/\/reset-password\?error=INVALID_TOKEN/);
  await expect(page.getByText(/invalid, expired, or already used/)).toBeVisible();

  await page.goto("/login");
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill("reset.customer@example.com");
  await page.getByLabel(/^Password/).fill("OldPass12345");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Email or password is incorrect.")).toBeVisible();

  await page.getByLabel(/^Password/).fill("NewPass12345");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/account");
});

test("expired sessions lose access to account pages", async ({
  page,
  request,
}) => {
  const user = await createVerifiedUserDirect(request, {
    name: "Expired Session",
    email: "expired.session@example.com",
    password: "ExpiredPass123",
  });
  await loginViaUi(page, "expired.session@example.com", "ExpiredPass123");
  const db = await getTestDb();
  const { ObjectId } = await import("mongodb");
  await db.collection("session").updateMany(
    { userId: new ObjectId(user.id) },
    { $set: { expiresAt: new Date(Date.now() - 60_000) } },
  );

  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Faccount/);
  await expect(page.getByRole("heading", { name: "Welcome back." })).toBeVisible();
});

test("Google unavailable, simulated OAuth errors, and safe return destinations", async ({
  page,
  request,
}) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  await expect(page.getByText(/Google sign-in is not configured/)).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  await expect(page.getByText(/Google sign-in is not configured/)).toBeVisible();

  await page.goto("/login?error=access_denied");
  await expect(page.getByText(/Google sign-in was cancelled/)).toBeVisible();
  await page.goto("/login?error=account_not_linked");
  await expect(
    page.getByText(/An account with this email already exists/),
  ).toBeVisible();

  await createVerifiedUserDirect(request, {
    name: "Redirect Customer",
    email: "redirect.customer@example.com",
    password: "RedirectPass123",
  });
  await page.goto(
    "/login?returnTo=https%3A%2F%2Fevil.example%2Fphish",
  );
  await waitForAppReady(page);
  await page.getByLabel(/Email address/).fill("redirect.customer@example.com");
  await page.getByLabel(/^Password/).fill("RedirectPass123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL("**/account");
  expect(page.url()).not.toContain("evil.example");
  await expect(
    page.getByText(/Google sign-in is not configured/),
  ).toBeVisible();
});

test("cart survives registration and login, order appears in account and admin", async ({
  page,
  request,
}) => {
  test.slow();
  const errors = collectHydrationErrors(page);
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Miniature Well Fountain");
  await addFromHomepage(page, "Twin-Bowl Cascade Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await expect(page.locator("aside").getByText("৳8,050").first()).toBeVisible();

  await page.goto("/register?returnTo=%2Fcheckout");
  await registerViaUi(page, {
    name: "Journey Customer",
    email: "journey.customer@example.com",
    password: "JourneyPass123",
    returnTo: "/checkout",
  });

  const mail = await waitForMail("journey.customer@example.com", "verification");
  await page.goto(verificationLink(mail));
  await expect(page).toHaveURL(/\/login\?verified=1/);
  await loginViaUi(page, "journey.customer@example.com", "JourneyPass123", "/checkout");
  await expect(page.getByLabel(/Full Name/)).toBeVisible();
  await expect(page.locator("aside").getByText("Miniature Well").first()).toBeVisible();
  await expect(page.locator("aside").getByText("Twin-Bowl Cascade").first()).toBeVisible();
  await expect(page.locator("aside").getByText("৳8,050").first()).toBeVisible();
  await expect(
    page.getByText(/This storefront is not connected to a payment or fulfilment service/),
  ).toBeVisible();
  await expect(page.locator('input[value="cod"]')).toBeChecked();
  await expect(page.locator('input[value="mfs"]')).toBeDisabled();
  await expect(page.locator('input[value="card"]')).toBeDisabled();

  await page.getByRole("button", { name: /Place Demo Order/ }).click();
  await expect(page.getByText(/Please enter your full name/)).toBeVisible();
  await expect(page.getByText(/Please enter a mobile number/)).toBeVisible();
  await expect(page.getByText(/Please enter a complete street address/)).toBeVisible();
  await expect(page.getByText(/Please enter your city or district/)).toBeVisible();

  await fillCheckout(page, {
    fullName: "Journey Customer",
    phone: "+880 1712-345678",
    email: "journey.customer@example.com",
    street: "House 42, Road 11, Block D, Banani",
    city: "Dhaka",
    postalCode: "1213",
    instructions: "Please call before arrival.",
  });
  await submitDemoOrder(page);
  const confirmationText = await page.locator("body").innerText();
  const reference = confirmationText.match(/#TNV-\d{5}/)?.[0].replace("#", "");
  expect(reference).toBeTruthy();

  const db = await getTestDb();
  const order = await db.collection("orders").findOne({ reference });
  expect(order?.userId).toBeTruthy();
  expect(order?.total).toBe(8050);
  expect(order?.paymentStatus).toBe("not_collected");
  expect(order?.demo).toBe(true);
  expect(order?.items).toHaveLength(2);

  await page.reload();
  await waitForAppReady(page);
  await expect(page.getByText("Artisanal Pieces Ordered")).toBeVisible();

  await page.goto("/account");
  await expect(page.getByText(`#${reference}`)).toBeVisible();
  await expect(page.getByText("৳8,050").first()).toBeVisible();

  await page.goto("/cart");
  await expect(page.getByText("(0 items)")).toBeVisible();

  promoteAdmin("journey.customer@example.com");
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText(`#${reference}`).first()).toBeVisible();

  await page.goto("/");
  await waitForAppReady(page);
  await page.getByRole("button", { name: "Account menu for Journey Customer" }).click();
  await expect(page.getByRole("link", { name: "Admin panel" })).toBeVisible();

  expect(errors, errors.join("\n")).toEqual([]);
});

test("logout preserves cart items and quantities", async ({ page, request }) => {
  await createVerifiedUserDirect(request, {
    name: "Logout Shopper",
    email: "logout.shopper@example.com",
    password: "LogoutPass123",
  });
  await loginViaUi(page, "logout.shopper@example.com", "LogoutPass123");
  await page.goto("/");
  await waitForAppReady(page);
  await addFromHomepage(page, "Rustic Miniature Well Fountain");
  await addFromHomepage(page, "Twin-Bowl Cascade Fountain");
  await page.goto("/account");
  await waitForAppReady(page);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.waitForURL("**/");
  await page.goto("/cart");
  await waitForAppReady(page);
  await expect(page.getByText("(2 items)")).toBeVisible();
  await expect(page.locator("aside").getByText("৳8,050").first()).toBeVisible();
});

test("guest confirmation is token-scoped and duplicate submissions create one order", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await addFromHomepage(page, "Woodland Tree & Well Fountain");
  await page.getByRole("link", { name: "View Cart", exact: true }).click();
  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await fillCheckout(page, {
    fullName: "Guest Buyer",
    phone: "01712-345678",
    email: "guest.buyer@example.com",
    street: "House 9, Road 4, Dhanmondi",
    city: "Dhaka",
  });
  await submitDemoOrder(page);

  const reference = (await page.locator("body").innerText()).match(/#TNV-\d{5}/)?.[0].replace("#", "")!;
  const db = await getTestDb();
  const guestOrder = await db.collection("orders").findOne({ reference });
  expect(guestOrder?.userId).toBeNull();
  const orderId = guestOrder!._id.toString();
  const handle = await page.evaluate(() => {
    const raw = sessionStorage.getItem("terranova-order-confirmation-v1");
    return raw ? (JSON.parse(raw) as { accessToken?: string }) : null;
  });
  expect(handle?.accessToken).toBeTruthy();

  await page.reload();
  await expect(page.getByText("Artisanal Pieces Ordered")).toBeVisible();

  const fresh = await page.context().browser()!.newContext();
  const freshPage = await fresh.newPage();
  await freshPage.goto("/order-confirmation");
  await expect(
    freshPage.getByRole("heading", { name: "This confirmation is empty" }),
  ).toBeVisible();
  await fresh.close();

  const noToken = await request.post("/api/orders/confirmation", {
    data: { orderId },
  });
  expect(noToken.status()).toBe(404);
  const wrongToken = await request.post("/api/orders/confirmation", {
    data: { orderId, accessToken: "x".repeat(64) },
  });
  expect(wrongToken.status()).toBe(404);
  const validToken = await request.post("/api/orders/confirmation", {
    data: { orderId, accessToken: handle!.accessToken },
  });
  expect(validToken.ok()).toBe(true);

  await page.emulateMedia({ media: "print" });
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(
    page.getByText("Demo order summary • Not a live invoice"),
  ).toBeVisible();
  await expect(
    page.locator(".print-only").getByText("Mystical Drop"),
  ).toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(() => {
    (window as unknown as { __printed?: boolean }).__printed = false;
    window.print = () => {
      (window as unknown as { __printed?: boolean }).__printed = true;
    };
  });
  await page.getByRole("button", { name: /Print Invoice/ }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __printed?: boolean }).__printed,
    ),
  ).toBe(true);

  const price = await getProductPrice("fountain-01");
  const key = crypto.randomUUID();
  const body = {
    submissionKey: key,
    customer: {
      fullName: "Idempotent Guest",
      phone: "01812345678",
      email: "idempotent@example.com",
      street: "House 5, Road 6, Uttara",
      city: "Dhaka",
      postalCode: "1230",
      instructions: "",
    },
    items: [{ slug: "fountain-01", quantity: 1 }],
    expectedTotal: price,
  };
  const first = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: body,
  });
  const second = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: body,
  });
  expect(first.status()).toBe(201);
  expect(second.status()).toBe(200);
  const firstOrder = (await first.json()) as { order: { id: string; reference: string } };
  const secondOrder = (await second.json()) as { order: { id: string; reference: string } };
  expect(secondOrder.order.id).toBe(firstOrder.order.id);
  expect(
    await db.collection("orders").countDocuments({ submissionKey: key }),
  ).toBe(1);

  await db
    .collection("products")
    .updateOne({ slug: "fountain-01" }, { $set: { price: price + 100 } });
  const retryAfterPriceChange = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: body,
  });
  expect(retryAfterPriceChange.status()).toBe(200);
  const retriedOrder = (await retryAfterPriceChange.json()) as {
    order: { id: string };
  };
  expect(retriedOrder.order.id).toBe(firstOrder.order.id);

  const bambooPrice = await getProductPrice("fountain-02");
  const mismatchedCart = await request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      ...body,
      items: [{ slug: "fountain-02", quantity: 1 }],
      expectedTotal: bambooPrice,
    },
  });
  expect(mismatchedCart.status()).toBe(409);
  expect(
    await db.collection("orders").countDocuments({ submissionKey: key }),
  ).toBe(1);

  const concurrentKey = crypto.randomUUID();
  const concurrentBody = {
    ...body,
    submissionKey: concurrentKey,
    items: [{ slug: "fountain-02", quantity: 1 }],
    expectedTotal: bambooPrice,
  };
  const [concurrentFirst, concurrentSecond] = await Promise.all([
    request.post("/api/orders", {
      headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
      data: concurrentBody,
    }),
    request.post("/api/orders", {
      headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
      data: concurrentBody,
    }),
  ]);
  expect(
    [concurrentFirst.status(), concurrentSecond.status()].sort((a, b) => a - b),
  ).toEqual([200, 201]);
  const concurrentFirstOrder = (await concurrentFirst.json()) as {
    order: { id: string };
  };
  const concurrentSecondOrder = (await concurrentSecond.json()) as {
    order: { id: string };
  };
  expect(concurrentSecondOrder.order.id).toBe(concurrentFirstOrder.order.id);
  expect(
    await db.collection("orders").countDocuments({ submissionKey: concurrentKey }),
  ).toBe(1);
});

test("one customer cannot read another customer's order", async ({
  browser,
  page,
  request,
}) => {
  test.slow();
  await createVerifiedUserDirect(request, {
    name: "Order Owner",
    email: "owner@example.com",
    password: "OwnerPass123",
  });
  await createVerifiedUserDirect(request, {
    name: "Other Customer",
    email: "other@example.com",
    password: "OtherPass123",
  });

  await loginViaUi(page, "owner@example.com", "OwnerPass123");
  const price = await getProductPrice("fountain-02");
  const orderResponse = await page.request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: {
      submissionKey: crypto.randomUUID(),
      customer: {
        fullName: "Order Owner",
        phone: "01712345678",
        email: "owner@example.com",
        street: "House 12, Road 3, Gulshan",
        city: "Dhaka",
        postalCode: "1212",
        instructions: "",
      },
      items: [{ slug: "fountain-02", quantity: 1 }],
      expectedTotal: price,
    },
  });
  expect(orderResponse.ok()).toBe(true);
  const ownerOrder = (await orderResponse.json()) as { order: { id: string } };
  await page.getByRole("button", { name: "Sign out", exact: true }).click().catch(async () => {
    await page.goto("/account");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
  });
  await page.waitForURL("**/");

  await loginViaUi(page, "other@example.com", "OtherPass123");
  const forbidden = await page.goto(`/account/orders/${ownerOrder.order.id}`);
  expect(forbidden?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This path has run dry." }),
  ).toBeVisible();

  const confirmation = await page.request.post("/api/orders/confirmation", {
    data: { orderId: ownerOrder.order.id },
  });
  expect(confirmation.status()).toBe(404);

  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "This area is restricted" }),
  ).toBeVisible();

  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto("/admin");
  await expect(anonymousPage).toHaveURL(/\/login\?returnTo=%2Fadmin/);
  await anonymous.close();
});

test("fresh-context page loads have no application hydration errors", async ({
  browser,
}) => {
  test.slow();
  const routes = [
    "/",
    "/products/fountain-01",
    "/cart",
    "/checkout",
    "/order-confirmation",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-email",
  ];

  for (const route of routes) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        !KNOWN_STREAMING_HYDRATION_RACE.test(message.text())
      ) {
        errors.push(message.text());
      }
      if (
        message.type() === "warning" &&
        /hydrat|did not match|server rendered/i.test(message.text()) &&
        !KNOWN_STREAMING_HYDRATION_RACE.test(message.text())
      ) {
        errors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      if (!KNOWN_STREAMING_HYDRATION_RACE.test(error.message)) {
        errors.push(error.message);
      }
    });
    await page.goto(route, { waitUntil: "load", timeout: 120_000 });
    await waitForAppReady(page);
    await page.waitForTimeout(500);
    expect(errors, `${route}: ${errors.join("\n")}`).toEqual([]);
    await context.close();
  }
});

test("auth and account screens fit phone, tablet, and desktop widths", async ({
  browser,
  request,
}) => {
  test.slow();
  await createVerifiedUserDirect(request, {
    name: "Responsive Customer",
    email: "responsive.customer@example.com",
    password: "ResponsivePass123",
  });

  const authenticated = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const loginPage = await authenticated.newPage();
  await loginViaUi(loginPage, "responsive.customer@example.com", "ResponsivePass123");
  const storageState = await authenticated.storageState();
  await authenticated.close();

  for (const width of [320, 390, 768, 1440]) {
    const anonymous = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await anonymous.newPage();
    for (const route of ["/login", "/register", "/forgot-password"]) {
      await page.goto(route, { waitUntil: "load" });
      await waitForAppReady(page);
      await expect(page.locator("footer")).toBeVisible();
      if (route !== "/forgot-password") {
        await expect(
          page.getByRole("button", { name: "Continue with Google" }),
        ).toBeVisible();
      }
      const overflow = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
      if (width === 320 && route === "/login") {
        await page.getByRole("button", { name: "Sign in", exact: true }).click();
        await expect(page.getByText("Enter your email address.")).toBeVisible();
      }
    }
    await anonymous.close();

    const signedIn = await browser.newContext({
      viewport: { width, height: 900 },
      storageState,
    });
    const accountPage = await signedIn.newPage();
    await accountPage.goto("/account", { waitUntil: "load" });
    await waitForAppReady(accountPage);
    await expect(
      accountPage.getByRole("heading", { name: "Your quiet corner." }),
    ).toBeVisible();
    await expect(accountPage.locator("footer")).toBeVisible();
    const overflow = await accountPage.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
    await signedIn.close();
  }
});
