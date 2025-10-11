# PetPet — The Pet-Centric On-Chain Explorer
---

> **Tagline:** PetPet turns real pet care into verifiable, privacy-safe on-chain events — and gives everyone a pet-first explorer to see what matters.


---


## Overview
**PetPet** is a pet-first blockchain explorer (built atop Blockscout Autoscout) where **each pet = a wallet address**. Real-world actions — walks, play sessions (via NFC tap), feeding (smart feeder), medication logs, and vet visits — are captured by phone/IoT, **signed**, and recorded as **verifiable on-chain events**. Pet owners, vets/boarders, and rescue communities can browse and verify pet activity with strong, opt-in privacy controls.

---

## Problem
- **Owners:** No trustworthy, unified log of a pet’s care/activity. Daycare/walker updates are fragmented and easy to fake.
- **Vets/boarders:** Lack standardized, tamper-evident records (feeding amounts, meds, checkups) tied to the pet over time.
- **Rescue/shelter communities:** Need **opt-in**, **privacy-safe** visibility of *areas* (not exact locations) to coordinate feeding/support and reduce abuse.


---

## Solution
**PetPet** provides:
- A **new explorer UX** for pet events (not just transfers).
- **Verifiability** via device/owner/vet signatures and attestation references.
- **Privacy by design** (coarse or delayed location, encrypted proofs).
- A **data index** powering timelines, summaries, and care insights.

**One-liner:** A public, pet-centric on-chain explorer where real-world care becomes verifiable events you can browse, verify, and (optionally) share.

---


## Key Features
### Explorer UI
- **All Pets View:** Searchable directory (name/species avatar), status chips (active today, due meds, last fed).
- **Per-Pet Timeline:** Chronological log of events (Walk, Play, Feed, Medication, VetVisit) with “View on Blockscout” links and proof references.
- **Stories/Grid Mode:** Owner-approved highlights (Snap/IG-style); location is coarse or delayed by default.
- **Map Heat (Opt-in):** Coarse geohash tiles (~1 km) showing activity density; no precise dots by default.
- **Care Insights:** Weekly summaries (distance walked, feeding consistency, meds adherence).
- **Privacy Controls:** Per-pet sharing settings (private/coarse/share with trusted contacts like vet/boarder).

### Real-World Data Inputs
- **NFC “Play Tap”:** Two pets tap collars/phone to log a play interaction.
- **Walks:** GPS (phone/BLE) logs distance; device/owner signs compact summary.
- **Feeding:** Smart feeder records grams dispensed; optional AI object detection commits “eaten” estimate.
- **Meds/Vet Visit:** Boarder/vet submits a signed attestation (only hashed metadata on-chain by default).

### Verifiability & Trust
- **Device Binding:** Bind device public key or NFC UID to the pet’s on-chain identity; contracts verify event signatures.
- **Attestations:** Whitelisted vets/boarders add signed care attestations.
- **Challenge Prompts:** Random challenges (e.g., “scan collar in 5 minutes”) deter spoofing.
- **Proof References:** Content hashes for photos/weights stored off-chain; decryptable only by authorized parties.