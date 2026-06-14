"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authRoutes } from "@/config/auth";
import { mapAuthError } from "@/lib/auth/errors";
import { validateSignIn, validateSignUp } from "@/lib/auth/validation";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";
import { initialAuthActionState } from "@/types/auth";

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignIn(formData);

  if (!validation.success) {
    return {
      ...initialAuthActionState,
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  if (error) {
    return {
      ...initialAuthActionState,
      error: mapAuthError(error),
    };
  }

  revalidatePath("/", "layout");

  const redirectTo = String(formData.get("redirectTo") ?? authRoutes.dashboard);
  const safeRedirect =
    redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : authRoutes.dashboard;

  redirect(safeRedirect);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validation = validateSignUp(formData);

  if (!validation.success) {
    return {
      ...initialAuthActionState,
      fieldErrors: validation.fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${authRoutes.callback}`,
    },
  });

  if (error) {
    return {
      ...initialAuthActionState,
      error: mapAuthError(error),
    };
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(authRoutes.dashboard);
  }

  return {
    success: true,
    message:
      "Account created! Check your email to confirm your address, then sign in.",
  };
}

export async function magicLinkAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fieldErrors: Record<string, string> = {};

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialAuthActionState,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${authRoutes.callback}`,
      },
    });

    if (error) {
      return {
        ...initialAuthActionState,
        error: mapAuthError(error),
      };
    }

    return {
      success: true,
      message: `We sent a magic link to ${email}. Click the link in the email to sign in.`,
    };
  } catch {
    return {
      ...initialAuthActionState,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fieldErrors: Record<string, string> = {};

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialAuthActionState,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/reset/confirm`,
    });

    if (error) {
      return {
        ...initialAuthActionState,
        error: mapAuthError(error),
      };
    }

    return {
      success: true,
      message: `Password reset instructions sent to ${email}. Check your inbox.`,
    };
  } catch {
    return {
      ...initialAuthActionState,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fieldErrors: Record<string, string> = {};

  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords do not match.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ...initialAuthActionState,
      fieldErrors,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return {
        ...initialAuthActionState,
        error: mapAuthError(error),
      };
    }

    revalidatePath("/", "layout");
    redirect(authRoutes.dashboard);
  } catch {
    return {
      ...initialAuthActionState,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(authRoutes.login);
}
