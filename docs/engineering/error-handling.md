# Error Handling Standards

* Never swallow errors silently.
* Errors must instantiate typed domain exceptions (e.g. `PermissionDeniedError`, `AdapterUnavailableError`).
* Host adapters gracefully degrade if underlying hardware permissions are revoked.
