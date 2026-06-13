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

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(authRoutes.login);
}
