# PetPet — The Pet-Centric On-Chain Explorer
---

> **Tagline:** PetPet turns real pet care into verifiable, privacy-safe on-chain events using zero-knowledge proofs — and gives everyone a pet-first explorer to see what matters.


---


## Overview
**PetPet** is a pet-first blockchain explorer (built atop Blockscout Autoscout) where **each pet = a wallet address with ENS naming**. Real-world actions — walks, activity states (running, resting, sleeping), play interactions, feeding with consumption verification, medication logs, and vet visits — are captured by GPS-enabled devices (phone/IoT) and smart feeders, **proven via zero-knowledge proofs (ZKP)**, and recorded as **verifiable on-chain events**. Pet owners, vets/boarders, and rescue communities can browse and verify pet activity with strong, opt-in privacy controls through an intuitive **Explorer** and personalized **Dashboard**.

---

## Problem
- **Owners:** No trustworthy, unified log of a pet's care/activity. Daycare/walker updates are fragmented and easy to fake.
- **Vets/boarders:** Lack standardized, tamper-evident records (feeding amounts, actual consumption, meds, checkups) tied to the pet over time.
- **Pet wellness:** Difficult to track activity patterns (running, resting, sleeping), social interactions, and behavioral trends over time.
- **Privacy concerns:** Pet location and activity data needs to be verifiable without exposing sensitive details on-chain.


---

## Solution
**PetPet** provides:
- A **new explorer UX** for browsing all pet events across the network.
- A personalized **dashboard** for pet owners to monitor their pets' activity, health, and social interactions.
- **Zero-knowledge proofs (ZKP)** for privacy-preserving verification of activity data, movement patterns, and consumption.
- **ENS naming** for each pet as a human-readable identifier.
- **Verifiability** via ZKP, device signatures, and attestation references.
- **Privacy by design** — sensitive data stays off-chain; only ZK proofs are submitted.
- A **data index** powering timelines, activity summaries, and wellness insights.

**One-liner:** A public, pet-centric on-chain explorer where real-world care becomes verifiable ZK events you can browse, track, and (optionally) share.

---


## Key Features

### 1. Pet Creation & Identity
- **ENS Naming:** Each pet gets a human-readable ENS name (e.g., `buddy.petpet.eth`) as their on-chain identifier upon creation.
- **Wallet Address:** Each pet is assigned a unique wallet address linked to their ENS name.
- **GPS Device Binding:** Link GPS-enabled device (collar or owner's phone for demo purposes) to the pet's identity.
- **Device Registration:** Register device public key with the pet's on-chain profile for signature verification.

### 2. Explorer View
- **All Pets Directory:** Searchable directory with ENS names, species avatars, and status chips (active today, due meds, last fed).
- **Per-Pet Timeline:** Chronological log of all events (Activity, Play Interactions, Feed, Medication, VetVisit) with "View on Blockscout" links and ZK proof references.
- **Event Details:** Click any event to see proof verification status, timestamp, and approved metadata.
- **Stories/Grid Mode:** Owner-approved highlights (Snap/IG-style) showcasing pet moments.
- **Cross-Pet Interactions:** View which pets interacted with each other (from proximity/NFC data).

### 3. Dashboard View (Owner's Personal Hub)
- **My Pets:** Quick access to all pets owned by the connected wallet.
- **Real-Time Activity Status:** Current state (running, resting, sleeping) with duration timers.
- **Activity Summaries:** Daily/weekly reports showing:
  - Time spent running, resting, sleeping
  - Distance covered (from GPS ZKP data)
  - Social interactions (which pets met, duration)
  - Feeding consistency and consumption rates
  - Medication adherence
- **Wellness Insights:** Trend charts for activity patterns, behavioral changes, and health metrics.
- **Privacy Controls:** Per-pet sharing settings (private/public/share with trusted contacts like vet/boarder).
- **Alert System:** Notifications for irregular patterns, missed meals, or due medications.

### 4. Real-World Data Inputs with ZKP

#### GPS Activity Tracking (ZKP-Powered) 🎯 *Partner Prize Target*
**Implementation Details:**
- **Device:** GPS-enabled collar (production) or owner's phone (demo purposes).
- **Sensors:** GPS location, accelerometer, gyroscope for movement analysis.
- **Activity Detection:** Device classifies pet state as running, resting, or sleeping based on movement patterns.
- **ZK Proof Generation:**
  - Continuous sensor data is processed locally on the device.
  - For each activity period (e.g., 5-minute run), device generates **summarized ZK proofs** instead of logging every second.
  - Example: "Dog ran for 5 minutes" = 1-5 proof logs showing minute intervals, not 300 second-by-second logs.
  - Proofs verify: duration, activity type, distance covered (aggregated), without revealing exact GPS coordinates.
- **Proximity Detection:** When two GPS-enabled pets are nearby, log interaction with ZKP showing:
  - Which pets interacted (by address/ENS)
  - Duration of interaction
  - Activity type (playing, resting together)
- **On-Chain Submission:** Only ZK proofs submitted; raw GPS/sensor data stays off-chain.

#### Smart Feeding with Consumption Verification (ZKP)
**Implementation Details:**
- **Dispenser:** Smart feeder with scale and camera.
- **Dispense Logging:** Records amount (grams) of food/water dispensed with timestamp.
- **Object Detection ZKP:**
  - Camera captures pet approaching and consuming food/water.
  - AI model runs object detection to verify:
    - Pet identity (via visual features or collar tag)
    - Consumption occurred (pet ate/drank)
    - Estimated amount consumed (scale difference + vision verification)
  - ZK proof generated confirming consumption without storing images on-chain.
- **On-Chain Event:** Proof submitted showing "Pet X consumed Y grams at timestamp Z" with verification status.

#### Pet Interactions (NFC/Proximity)
- **NFC Tap:** Two pets with NFC-enabled collars/tags tap to log a verified play interaction.
- **Bluetooth Proximity:** GPS devices detect nearby pets via BLE and log interaction duration.
- **ZK Social Graph:** Proofs show which pets interacted without revealing exact location or time-series data.

#### Medications & Vet Visits
- **Boarder/Vet Attestations:** Signed submissions with metadata (med type, dosage, checkup notes).
- **Hashed Data:** Only content hash stored on-chain; detailed records accessible to authorized parties.

### 5. Verifiability & Trust
- **Zero-Knowledge Proofs:** All sensitive activity data (GPS, movement, consumption) verified via ZKP — no raw data on-chain.
- **Device Binding:** Bind device public key or NFC UID to the pet's on-chain identity; contracts verify event signatures and ZK proofs.
- **ENS Identity:** Human-readable pet names (e.g., `buddy.petpet.eth`) make verification and sharing easier.
- **Attestations:** Whitelisted vets/boarders add signed care attestations with cryptographic verification.
- **Challenge Prompts:** Random challenges (e.g., "scan collar in 5 minutes") deter spoofing and ensure device authenticity.
- **Proof References:** Content hashes for photos/weights stored off-chain; decryptable only by authorized parties.
- **Explorer Verification:** Anyone can verify ZK proofs through the Explorer without accessing private data.

---

## Technical Architecture

### Data Flow
1. **Pet Creation:** Owner creates pet profile → assigns ENS name → links GPS device/phone.
2. **Sensor Collection:** GPS device continuously monitors activity (GPS, accelerometer, gyro).
3. **Local Processing:** Device processes sensor data and generates summarized ZK proofs.
4. **Proof Submission:** ZK proofs submitted on-chain via pet's wallet address.
5. **Explorer Indexing:** Blockscout indexes pet events and ZK proof references.
6. **Dashboard Display:** Owner views aggregated insights; public can browse verified events in Explorer.

### ZKP Implementation (Partner Prize Focus)
- **Proof System:** Using zkSNARKs/zkSTARKs for activity verification.
- **Summarized Proofs:** Multi-minute activity periods compressed into single/few proofs.
- **Privacy Preservation:** GPS coordinates, exact timestamps, and sensor readings stay off-chain.
- **Verification:** Smart contracts verify ZK proofs before accepting events.
- **Gas Optimization:** Batching proofs for multiple events to reduce transaction costs.

### Demo Setup (MVP)
- **GPS Source:** Owner's smartphone acts as GPS device with accelerometer/gyro.
- **Phone App:** Collects movement data, classifies activity states, generates ZK proofs.
- **Smart Contracts:** Pet registry, ENS integration, ZK verifier contracts.
- **Explorer:** Custom Blockscout instance with pet-first UI and ZK proof viewer.
- **Dashboard:** React/Next.js app for owners to manage and monitor their pets.

---

## Use Cases

### For Pet Owners
- Track daily activity patterns (running, resting, sleeping) with verifiable proof.
- Monitor feeding consistency and actual consumption amounts.
- See which pets your pet interacted with at the park or daycare.
- Share wellness reports with vets using privacy-preserving proofs.
- Verify caretaker/walker claims with on-chain proof of activity.

### For Vets & Boarders
- Access complete, tamper-evident care history for each pet.
- Verify feeding schedules and medication adherence.
- Add signed attestations for treatments and checkups.
- Track recovery progress through activity data.

### For Pet Communities
- Discover pets in your area (opt-in only) for playdates.
- Browse public pet profiles and their activity highlights.
- Verify rescue/adoption care claims with on-chain proof.
- Build trust in pet care services through verifiable track records.