import { NavbarShell } from "@/components/layout/navbar-shell";

/**
 * Server-rendered navbar shell wrapper.
 * The inner NavbarShell retrieves the user state from AuthProvider.
 */
export function Navbar() {
  return <NavbarShell />;
}
