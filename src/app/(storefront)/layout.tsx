// ─────────────────────────────────────────────────────────────────────────────
// LANAN — Storefront Layout
// Navbar, Footer and CartDrawer are handled in the root app/layout.tsx.
// This layout is a transparent passthrough for the route group.
// ─────────────────────────────────────────────────────────────────────────────

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
