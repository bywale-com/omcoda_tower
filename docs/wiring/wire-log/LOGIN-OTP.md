# Wire log — Login OTP

**Status:** wired (stand-in)  
**Implementation:** Send code / Verify on Register CT Login  
**Stand-ins:** `mailer` · `otpStore`  
**Real cutover (out of scope):** Resend · Postgres challenge store · auth-service

## Behavior

1. **Send code** → `wirePorts.otpStore.issue({ email })` → store `challengeId` (+ optional `debugCode` hint) → advance to verify step.
2. **Resend code** → re-issue; replaces `challengeId` / `debugCode`.
3. **Verify** → `wirePorts.otpStore.verify({ challengeId, code })` → on ok, existing session success path (`onVerified` → Board); on fail, surface `expired` / `mismatch` / `locked` / `unknown-challenge`.
4. **Change email** → nav back; clears `challengeId` / `debugCode`.

No `authClient` / real auth-service. Hard-coded `000000` / `111111` verify hacks removed.

## codeRefs

| Control | Plant | Ant |
|---|---|---|
| Login surface | `src/app/register/prototype/RegisterLoginScene.tsx` | `src/app/register/prototype-ant/consultant/LoginModule.tsx` |
| Port | `src/app/wire/ports.ts` (`OtpStorePort`) | same |
| Stand-in | `src/app/wire/standins/otpStore.ts` | same |
| Registry | `src/app/wire/registry.ts` (`wirePorts.otpStore`) | same |
