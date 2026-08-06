# Wire log — implementations wired with stand-ins

**Method:** [`../STANDIN-WIRING.md`](../STANDIN-WIRING.md)  
**Code:** `src/app/wire/`

| Implementation | Status | Stand-ins | CT entry |
|---|---|---|---|
| Login OTP (Send code / Verify) | wired | mailer · otpStore | plant + Ant Login — [LOGIN-OTP.md](./LOGIN-OTP.md) |
| Halt outreach (Confirm halt / Lift / Resume) | wired | haltStore · auditTrail | plant + Ant Halt — [HALT-OUTREACH.md](./HALT-OUTREACH.md) |

Add a row per wired implementation. Do not graph here — this is the as-built list.
