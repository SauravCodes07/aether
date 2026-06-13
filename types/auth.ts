export type AuthActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAuthActionState: AuthActionState = {
  success: false,
};
