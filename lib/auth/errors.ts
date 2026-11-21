export type AuthClientError =
  | {
      status?: number;
      statusText?: string;
      code?: string;
      message?: string;
      error?: {
        code?: string;
        message?: string;
      };
    }
  | null
  | undefined;

export function authErrorCode(error: AuthClientError): string {
  return (error?.code || error?.error?.code || "").toUpperCase();
}

export function isRateLimited(error: AuthClientError): boolean {
  return error?.status === 429;
}

export function isEmailNotVerified(error: AuthClientError): boolean {
  return authErrorCode(error) === "EMAIL_NOT_VERIFIED" || error?.status === 403;
}

export function loginErrorMessage(error: AuthClientError): string {
  if (isRateLimited(error)) {
    return "Too many sign-in attempts. Please wait a minute and try again.";
  }
  if (isEmailNotVerified(error)) {
    return "Verify your email before signing in. You can request a new verification email below.";
  }
  return "Email or password is incorrect.";
}

export function registerErrorMessage(error: AuthClientError): string {
  if (isRateLimited(error)) {
    return "Too many account requests. Please wait a minute and try again.";
  }
  const code = authErrorCode(error);
  if (code === "PASSWORD_TOO_SHORT") {
    return "Choose a password with at least 8 characters.";
  }
  if (code === "PASSWORD_TOO_LONG") {
    return "Choose a shorter password.";
  }
  if (code === "INVALID_EMAIL") {
    return "Enter a valid email address.";
  }
  return "We could not create the account. Please review your details and try again.";
}

export function resetErrorMessage(error: AuthClientError): string {
  if (isRateLimited(error)) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  const code = authErrorCode(error);
  if (code === "INVALID_TOKEN" || error?.status === 400) {
    return "This password reset link is invalid or has expired. Request a new link.";
  }
  if (code === "PASSWORD_TOO_SHORT") {
    return "Choose a password with at least 8 characters.";
  }
  return "We could not update the password. Please try again.";
}

export function resendErrorMessage(error: AuthClientError): string {
  if (isRateLimited(error)) {
    return "Too many email requests. Please wait a minute and try again.";
  }
  return "We could not send the email. Please try again in a moment.";
}

export function googleErrorMessage(errorCode: string | undefined): string | null {
  if (!errorCode) return null;
  const value = errorCode.toLowerCase();
  if (value.includes("account_not_linked") || value.includes("account not linked")) {
    return "An account with this email already exists. Sign in with your password, then connect Google from your account page.";
  }
  if (value.includes("access_denied") || value.includes("cancel")) {
    return "Google sign-in was cancelled. You can try again or sign in with email and password.";
  }
  return "Google sign-in could not be completed. Please try again or use email and password.";
}
