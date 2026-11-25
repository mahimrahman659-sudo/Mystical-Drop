import { appendFileSync, writeFileSync } from "node:fs";
import type { AddressObject } from "mailparser";
import { simpleParser } from "mailparser";
import { SMTPServer } from "smtp-server";

function addressText(value: AddressObject | AddressObject[] | undefined): string {
  if (!value) return "";
  return (Array.isArray(value) ? value : [value])
    .map((entry) => entry.text)
    .join(", ");
}

export async function startTestSmtp(captureFile: string): Promise<{
  port: number;
  close: () => Promise<void>;
}> {
  writeFileSync(captureFile, "", "utf8");

  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ["STARTTLS"],
    logger: false,
    onData(stream, _session, callback) {
      simpleParser(stream)
        .then((mail) => {
          const subject = mail.subject ?? "";
          appendFileSync(
            captureFile,
            `${JSON.stringify({
              from: addressText(mail.from),
              to: addressText(mail.to),
              subject,
              text: mail.text ?? "",
              kind: /new cod order/i.test(subject)
                ? "order-alert"
                : /is confirmed/i.test(subject)
                  ? "order-confirmation"
                  : /reset your mystical drop password/i.test(subject)
                    ? "password-reset"
                    : "verification",
              createdAt: new Date().toISOString(),
            })}\n`,
            "utf8",
          );
          callback();
        })
        .catch((error: unknown) => {
          callback(error instanceof Error ? error : new Error("SMTP parse failed"));
        });
    },
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.server.address();
  if (!address || typeof address === "string") {
    throw new Error("Test SMTP server did not expose a port.");
  }

  return {
    port: address.port,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
}
