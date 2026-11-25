import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { countOrders, resetTestDatabase } from "./helpers";

test.beforeEach(async () => {
  await resetTestDatabase();
});

const customer = {
  fullName: "Concurrency Tester",
  phone: "01712345678",
  email: "concurrency@example.com",
  street: "House 1, Road 1, Gulshan",
  city: "Dhaka",
  postalCode: "1207",
  instructions: "",
};

function orderBody(submissionKey: string, slug = "fountain-01") {
  return {
    submissionKey,
    customer,
    items: [{ slug, quantity: 1 }],
    expectedTotal: 399,
  };
}

function postOrder(
  request: APIRequestContext,
  body: ReturnType<typeof orderBody>,
) {
  return request.post("/api/orders", {
    headers: { Origin: process.env.PLAYWRIGHT_BASE_URL! },
    data: body,
  });
}

test("parallel duplicate submissions collapse into a single order", async ({
  request,
}) => {
  const submissionKey = randomUUID();
  const responses = await Promise.all(
    Array.from({ length: 5 }, () => postOrder(request, orderBody(submissionKey))),
  );

  for (const response of responses) {
    expect([200, 201]).toContain(response.status());
  }

  const ids = await Promise.all(
    responses.map(
      async (response) =>
        ((await response.json()) as { order: { id: string } }).order.id,
    ),
  );
  expect(new Set(ids).size).toBe(1);
  expect(await countOrders()).toBe(1);
});

test("parallel distinct submissions create distinct orders", async ({
  request,
}) => {
  const responses = await Promise.all(
    Array.from({ length: 3 }, () => postOrder(request, orderBody(randomUUID()))),
  );

  for (const response of responses) {
    expect(response.status()).toBe(201);
  }
  const ids = await Promise.all(
    responses.map(
      async (response) =>
        ((await response.json()) as { order: { id: string } }).order.id,
    ),
  );
  expect(new Set(ids).size).toBe(3);
  expect(await countOrders()).toBe(3);
});

test("a replayed key with a different cart is rejected without a second order", async ({
  request,
}) => {
  const submissionKey = randomUUID();

  const first = await postOrder(request, orderBody(submissionKey, "fountain-01"));
  expect(first.status()).toBe(201);

  const conflicting = await postOrder(
    request,
    orderBody(submissionKey, "fountain-02"),
  );
  expect(conflicting.status()).toBe(409);
  const payload = (await conflicting.json()) as { code?: string };
  expect(payload.code).toBe("SUBMISSION_CONFLICT");

  expect(await countOrders()).toBe(1);
});
