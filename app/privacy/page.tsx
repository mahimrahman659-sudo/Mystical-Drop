import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Mystical Drop handles account, Google sign-in, order, delivery, and support information.",
};

export default function PrivacyPage() {
  return (
    <section className="site-container py-space-lg sm:py-space-xl">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow text-primary">Privacy</p>
        <h1 className="mt-1 font-display text-display-sm tracking-tight text-on-surface">
          Privacy Policy
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Prepared for {BRAND_NAME} owner review.
        </p>

        <div
          role="note"
          className="mt-6 rounded-xl border border-tertiary/25 bg-[#fbf4e6] p-4 text-body-sm leading-relaxed text-on-surface sm:p-5"
        >
          <p className="font-semibold uppercase tracking-wider text-secondary">
            Owner approval required before publication
          </p>
          <p className="mt-2">
            This draft does not contain a monitored support address, legal
            business identity or address, or final retention periods. The owner
            must supply those details and approve the deletion process before
            this page is published for Google OAuth verification.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <p>
            This policy explains what information {BRAND_NAME} collects, why we
            collect it, and the choices available to customers. {BRAND_NAME} is a
            demo storefront for handcrafted tabletop water fountains. The legal
            business identity and registered business address have not yet been
            supplied by the owner.
          </p>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Information we collect
            </h2>

            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              Account information
            </h3>
            <p className="mt-2">
              When you create an email and password account, we store your name,
              email address, a password hash rather than the plain password,
              whether the email is verified, your account role, and session
              information needed to keep you signed in securely.
            </p>

            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              Google sign-in
            </h3>
            <p className="mt-2">
              Google sign-in is optional. The app requests the Google scopes{" "}
              <strong className="text-on-surface">openid</strong>,{" "}
              <strong className="text-on-surface">email</strong>, and{" "}
              <strong className="text-on-surface">profile</strong>. Google
              provides your name, email address, profile image if available, a
              Google account identifier, and whether Google has verified the
              email address.
            </p>
            <p className="mt-2">
              We use that information to create or link your {BRAND_NAME}{" "}
              account, sign you in, and display your account name and image. The
              app stores the provider account link and the OAuth token and scope
              information needed to maintain the connection. We do not request
              Gmail, Google Drive, Google Contacts, or other Google service data.
              Implicit account linking based only on matching email addresses is
              disabled; linking Google while signed in is an explicit action.
            </p>

            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              Orders and delivery information
            </h3>
            <p className="mt-2">
              Checkout collects the recipient name, mobile number, optional email
              address, street address, city or district, optional postal code, and
              optional delivery instructions. We also record the items and
              quantities ordered, prices and totals calculated by the server,
              delivery estimate, order status history, and whether the order is
              linked to an account.
            </p>
            <p className="mt-2">
              This storefront uses a demo Cash on Delivery flow. It does not
              collect card numbers, bKash or Nagad credentials, or other payment
              credentials. Guest confirmation access tokens are stored as hashes
              rather than plain tokens.
            </p>

            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              Browser storage and cookies
            </h3>
            <p className="mt-2">
              A security session cookie keeps signed-in customers authenticated.
              Cart, favorites, checkout-attempt, and guest-confirmation data are
              stored in your browser so the storefront can restore those features.
              This application does not include advertising or third-party
              analytics scripts.
            </p>

            <h3 className="mt-4 font-display text-headline-sm text-on-surface">
              Administration
            </h3>
            <p className="mt-2">
              Authorized administrators can access customer and order information
              needed to manage products, orders, uploads, and support. Admin access
              is restricted by a server-verified role.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              How we use information
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Create and secure customer accounts and sign customers in.</li>
              <li>Send verification and password-recovery messages.</li>
              <li>Record, confirm, and manage demo orders and delivery details.</li>
              <li>Respond to customer questions and privacy requests.</li>
              <li>Prevent abuse, secure the admin area, and maintain service reliability.</li>
              <li>Meet legal, accounting, and record-keeping obligations where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              When information is shared
            </h2>
            <p className="mt-2">
              Information is available to authorized store administrators and to
              service providers that host the application, operate its database,
              deliver transactional email, and support Google sign-in. Information
              may also be disclosed where required by law or necessary to protect
              the store, customers, or others. This storefront does not sell
              customer information or send it to advertising networks.
            </p>
            <p className="mt-2">
              Service providers may process information outside Bangladesh. The
              owner must confirm the applicable transfer terms before publication.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Retention
            </h2>
            <p className="mt-2">
              Account, order, support, security, and uploaded content are kept only
              as long as needed for the purposes described above and for applicable
              legal obligations. The exact retention periods, backup periods, and
              deletion schedule have not yet been approved by the store owner and
              must be added before publication.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Access, correction, and deletion
            </h2>
            <p className="mt-2">
              Signed-in customers can review their profile and order history on the
              account page. To request access, correction, or deletion of personal
              information, contact the support channel published in the site
              footer.
            </p>
            <p className="mt-2">
              A monitored support or privacy email address has not yet been
              supplied. The footer currently shows “to be confirmed,” so the
              request process is not yet operational. The storefront does not
              currently provide self-service account deletion; deletion requests
              must be reviewed and handled by the store owner after verifying the
              requester. Some order records may need to be retained for legal,
              accounting, or dispute-resolution reasons, as determined by the
              owner.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Security
            </h2>
            <p className="mt-2">
              Passwords are stored as hashes, sessions and admin access are
              server-checked, and guest confirmation tokens are stored as hashes.
              No online system can guarantee absolute security, but access to
              customer information is limited to authorized administrators and
              required service providers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Changes to this policy
            </h2>
            <p className="mt-2">
              This policy will be updated when the storefront or its data practices
              change. The owner must approve the final policy and publish the
              effective date before relying on it for Google OAuth verification.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-md text-on-surface">
              Contact
            </h2>
            <p className="mt-2">
              {BRAND_NAME} has not yet supplied a monitored privacy contact. The
              store owner must add a support or privacy address and a deletion
              request process before this page is published.
            </p>
          </section>
        </div>

        <Link href="/" className="btn btn-outline mt-8">
          Return to {BRAND_NAME}
        </Link>
      </div>
    </section>
  );
}
