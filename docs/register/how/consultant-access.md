# Consultant — Access

**Kind:** secondary  
**Subject:** Consultant

**Statement**
> As Consultant, I can sign in and land in my firm workspace to see what's being done in my name and
> take the meetings booked for me.

*(so-that local/obvious — omitted)*

---

## Root — outcome

**Clarity:** *(statement)*  
**Criteria — when:** When a provisioned consultant opens Tower.  
**Conditions:** Work email known; firm tenancy provisioned (ALG or assisted).

---

## Depth 1 — first How

**Q:** How do I sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me?

**Clarity:** I verify a one-time code on Login, then land on Board to see what's in motion under my name and open Meetings for what's booked.

**DNA for children:**
1. verify a one-time code on Login
2. land on Board to see what's in motion under my name
3. open Meetings for what's booked

---

### Leaf 1.1 — OTP sign-in

**Q:** How do I verify a one-time code on Login?

**Clarity:** Starting from Login, enter work email, then On Login verify enter the one-time code to open the firm session.

**Criteria — when:** Not already signed in.  
**Conditions:** Email provisioned to a firm user; code valid and unexpired.

| UI | Kind | Status |
|---|---|---|
| Login | Module | **existing** |
| Email field / Send code | Block | **existing** |
| Verify code | Block | **existing** |

**Requirements:** Auth Service, OTP, session cookie (process at leaf). Operator Provision may have minted the user on the assisted door.

---

### Leaf 1.2 — land on Board

**Q:** How do I land on Board to see what's in motion under my name?

**Clarity:** After verify succeeds, Starting from Board I see Client rows and Phase signals for the firm book — inhabit only.

**Criteria — when:** Immediately after successful sign-in.  
**Conditions:** Session valid; Board is signed-in landing.

| UI | Kind | Status |
|---|---|---|
| Board | Module | **existing** |
| Clients section / Client row | Block | **existing** |
| Primary navigation | Block | **existing** |

---

### Leaf 1.3 — open Meetings for what's booked

**Q:** How do I open Meetings for what's booked?

**Clarity:** Starting from Meetings, scan Meeting rows booked for me and open one to take it with Live brief.

**Criteria — when:** When meetings exist or I check for them.  
**Conditions:** Bookings created by bound engagement (requirement); consultant is recipient.

| UI | Kind | Status |
|---|---|---|
| Meetings | Module | **new** |
| Meeting row | Block | **new** |
| Live brief | Block | **partial-existing** (Client Brief) |
