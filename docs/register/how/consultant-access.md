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

**Clarity:** On Login I complete OTP; Board becomes the signed-in landing with Client rows / Phase signals; Meetings shows booked rows I can open with Live brief.

**DNA for children:**
1. verify a one-time code on Login
2. land on Board to see what's in motion under my name
3. open Meetings for what's booked

---

### Leaf 1.1 — OTP sign-in

**Q:** How do I verify a one-time code on Login?

**Clarity:** Starting from Login, type work email in the Email field and click **Send code**. On Login verify, type the one-time code in the Code field and click **Verify** (primary button). Session cookie lands; Board becomes the next screen. Typed-but-unverified characters are view-only until Verify.

**Criteria — when:** Not already signed in.  
**Conditions:** Email provisioned to a firm user; code valid and unexpired.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Login | Module | **existing** | Signed-out entry |
| Email field | Block | **existing** | Text input |
| Send code | Block | **existing** | **Primary / secondary button** — writes OTP challenge (read by Login verify) |
| Code field | Block | **existing** | Text input |
| Verify | Block | **existing** | **Primary button** — writes session (read by Board / firm shell) |

**Requirements:** Auth Service, OTP, session cookie (process at leaf). Operator Provision may have minted the user on the assisted door.

---

### Leaf 1.2 — land on Board

**Q:** How do I land on Board to see what's in motion under my name?

**Clarity:** After Verify succeeds, land on Board (signed-in default). View Client rows with Phase signal chips for the firm book — inhabit only. Click a Client row to open Client workspace; selection is view chrome (nothing downstream reads selectedId). No pack-authorship controls appear on Board.

**Criteria — when:** Immediately after successful sign-in.  
**Conditions:** Session valid; Board is signed-in landing.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Board | Module | **existing** | Default post-Login landing |
| Client row | Block | **existing** | Row list; Phase signal **chip** (view) |
| Phase signal | Block | **existing** | **View** chip — reads bound engagement state (authored off-desk) |
| Client workspace | Modal / pane | **existing** | Open from Client row click |
| Primary navigation | Block | **existing** | Nav to Meetings / Contacts |

---

### Leaf 1.3 — open Meetings for what's booked

**Q:** How do I open Meetings for what's booked?

**Clarity:** Starting from Board, click **Meetings** in primary nav (or open Meetings directly). On Meetings, view Meeting rows booked for me; click a Meeting row to open Meeting. On Meeting, click **Live brief** panel to view current fact rows before joining. Booking rows are written by bound engagement (operator packs) — consultant does not enroll sequences here.

**Criteria — when:** When meetings exist or I check for them.  
**Conditions:** Bookings created by bound engagement (requirement); consultant is recipient.

| UI | Kind | Status | Affordance |
|---|---|---|---|
| Meetings | Module | **new** | Calendar receive surface |
| Meeting row | Block | **new** | Clickable row list |
| Meeting | Modal / pane | **new** | Opened from Meeting row |
| Live brief | Block | **partial-existing** (Client Brief) | **Panel** — view facts; reads write-back from contact Loop-closer / Nudge |
