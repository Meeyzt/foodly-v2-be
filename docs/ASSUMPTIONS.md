# Sprint-1 Assumptions

1. **Customer identity**: Customer order history/review eligibility is keyed by `customerRef` (string token from client) since dedicated customer auth is out of Sprint-1 scope.
2. **Branch-scoped auth**: Authorization is evaluated against `BranchMembership` (`BusinessAdmin`, `BranchManager`, `Staff`) per branch.
3. **Staff permissions**: Staff permissions are assignable via `BranchMembershipPermission`; managers/admins are considered privileged for QR confirmation even without explicit permission rows.
4. **Same table multi-order**: Multiple active orders for the same table are allowed; no uniqueness constraint on table active orders.
5. **QR lifecycle**: `OrderQR` tracks QR state and confirmation metadata; order lifecycle state is kept in `Order.status` and follows the PRD sequence.
6. **Cart pricing**: Pricing is resolved from current active product prices at order creation time and copied to `OrderItem.unitPrice` for immutability.
7. **Analytics payload**: `AnalyticsEvent.payload` is stored as serialized text (JSON string) to stay SQLite-friendly in Sprint-1.
8. **Review eligibility**: Orders are review-eligible only when `Order.status = COMPLETED` and no `Review` row exists.
