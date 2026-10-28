# Security Spec for EV Rescue

## Data Invariants
- A rescue request must have a valid `userId` matching the authenticated user.
- Users can only read and write their own requests.
- The `status` must follow a specific sequence (though rules will primarily focus on ownership and schema validity).
- `createdAt` must be set by the server.

## The Dirty Dozen Payloads (Rejection Targets)
1. Creating a request for another user (`userId` mismatch).
2. Updating `userId` after creation.
3. Updating `createdAt` after creation.
4. Setting a status not in the enum.
5. Creating a request without a provider object.
6. Injecting a 1MB string into `instructions`.
7. Deleting a request that doesn't belong to the user.
8. Updating `vehicleType` to a non-string value.
9. Listing all requests without a filter for the user's ID.
10. Creating a request with a malicious document ID (e.g., junk characters).
11. Updating `provider.fee` to an invalid type.
12. Creating a request without being authenticated.

## Rules Draft
The rules will be written to `firestore.rules`.
