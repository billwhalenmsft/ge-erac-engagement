# GE ERAC Lite CRM resource center

This customer-safe resource center is published through the existing gated GitHub Pages lane. It explains the solution, package roles, sandbox-first managed import, post-import verification, and implementation boundaries.

**Release state:** published guided handoff. Managed and unmanaged version `1.0.0.1` exports each contain exactly zero `MissingDependency` nodes. The exact managed hash completed a normal non-destructive update in a pre-provisioned Primary CE environment with no import error and unchanged record IDs/counts.

That evidence is a managed-update test, not a clean-first-install claim. Static zero-dependency validation is the separate portability evidence. Normal update semantics can retain legacy managed components already present in a target.

No demo/customer data is included. The site has no telemetry, forms, external scripts, or remote fonts. The recap video, caption file, and walkthrough deck remain unchanged.

The existing hash-only soft gate is unchanged. Access expires on `2026-12-31`; revocation remains a manual governance action.
