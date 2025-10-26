# PetPet — The Pet-Centric On-Chain Explorer
---

> **Tagline:** PetPet turns real pet care into verifiable, privacy-safe on-chain events using Trusted Execution Environments (TEE), IoT devices and computer vision object detection — and gives everyone a pet-first explorer to see what matters.


---


## Overview
**PetPet** is a pet-first blockchain explorer (built atop Blockscout Autoscout) where **each pet = a uniquely named smart contract deployed on-chain**. Real-world actions — activity states (running, playing, eating, drinking, sleeping), location tracking, and behavioral patterns — are captured by **camera-based object detection and GPS sensors**, processed within a **Trusted Execution Environment (TEE)** for privacy, and recorded as **verifiable on-chain events**. Pet owners, vets/boarders, and rescue communities can browse and verify pet activity with strong privacy controls through an intuitive **Explorer** powered by Blockscout Autoscout and **Dashboard** enhanced with Blockscout SDK.

---

## Problem
- **Owners:** No trustworthy, unified log of a pet's care/activity. Daycare/walker updates are fragmented and easy to fake.
- **Vets/boarders:** Lack standardized, tamper-evident records (feeding amounts, actual consumption, meds, checkups) tied to the pet over time.
- **Pet wellness:** Difficult to track activity patterns (running, playing, eating, drinking, sleeping) and behavioral trends over time with automated verification.
- **Privacy concerns:** Pet location and activity data needs to be verifiable without exposing sensitive details publicly.


---

## Solution
**PetPet** provides:
- A **new explorer UX** built with Blockscout Autoscout for browsing all pet events across the network.
- A personalized **dashboard** enhanced with Blockscout SDK for real-time transaction visualization and interactivity.
- **Trusted Execution Environment (TEE)** processing via Phala Network for privacy-preserving verification of activity data, movement patterns, and behaviors.
- **Named smart contracts** for each pet as searchable, human-readable identifiers in the explorer.
- **Verifiability** via TEE attestations, camera-based computer vision object detection, and GPS sensor data.
- **Privacy by design** — sensitive data processed within TEE; only verified events submitted on-chain.
- A **data index** powering timelines, activity summaries, and behavioral insights.

**One-liner:** A public, pet-centric on-chain explorer where real-world care becomes verifiable TEE-attested events you can browse, track, and (optionally) share.

---


## Key Features

### 1. Pet Creation & Identity
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 81c2e0e90eeac2d7f5347bfa85d612b800413d66
- **Named Smart Contract:** Each pet gets a uniquely named smart contract (e.g., `Buddy_The_Dog`) deployed on-chain as their identifier upon creation.
- **Contract Address:** Each pet is assigned a unique contract address that can be searched by name in the Blockscout explorer.
- **Name Registry:** A central registry contract prevents duplicate pet names and maintains a searchable directory.
- **Sensor Device Binding:** Link camera and GPS-enabled devices (owner's iPhone or IoT camera) to the pet's contract for verified data submissions.
<<<<<<< HEAD
=======
- **ENS Naming:** Each pet gets a human-readable ENS name (e.g., `shibaba.petpet.eth`) as their on-chain identifier upon creation.
- **Wallet Address:** Each pet is assigned a unique wallet address linked to their ENS name.
- **GPS Device Binding:** Link GPS-enabled device (collar or owner's phone for demo purposes) to the pet's identity.
- **Device Registration:** Register device public key with the pet's on-chain profile for signature verification.
>>>>>>> 8a0967dfbdb37ce711ca7fd990b6baae5d027109
=======
>>>>>>> 81c2e0e90eeac2d7f5347bfa85d612b800413d66

**Why Not ENS?**  
We initially planned to use ENS for pet naming, but deploying a custom ENS resolver and running our own subgraph to index ENS records would add significant complexity. Instead, we leverage Blockscout's native ability to search verified smart contracts by name — each pet contract is verified and searchable directly in the explorer, providing the same human-readable benefits without the additional infrastructure.

### 2. Explorer View (Blockscout Autoscout)
- **All Pets Directory:** Searchable directory with contract names, species avatars, and real-time status (currently running, sleeping, last activity timestamp).
- **Per-Pet Timeline:** Chronological log of all events (Activity states, location tracking, feeding, behaviors) with direct Blockscout transaction links and TEE attestation references.
- **Event Details:** Click any event to see TEE verification status, timestamp, duration, and activity metadata (powered by Blockscout SDK).
- **Contract Search:** Search pets by name directly in Blockscout explorer — each verified pet contract appears with its human-readable name.
- **Transaction Visualization:** Blockscout SDK integration provides rich transaction details and activity event history.

### 3. Dashboard View (Owner's Personal Hub)
- **My Pets:** Quick access to all pets owned by the connected wallet.
- **Real-Time Activity Status:** Current state (running, playing, eating, drinking, sleeping) with duration timers from camera computer vision detection.
- **Activity Summaries:** Daily/weekly reports showing:
  - Time spent in each activity state (running, playing, eating, drinking, sleeping)
  - Distance covered and speed from GPS tracking (longitude, latitude data)
  - Location history and movement patterns
  - Activity duration breakdown
- **Wellness Insights:** Trend charts for activity patterns and behavioral changes over time.
- **Privacy Controls:** Per-pet sharing settings — sensitive location data processed in TEE, only aggregated metrics on-chain.
- **Blockscout SDK Integration:** Real-time transaction updates and event notifications displayed inline.

### 4. Real-World Data Inputs with TEE Processing

#### Camera-Based Activity Detection (Computer Vision Object Detection)
**Implementation Details:**
- **Device:** Any standard camera (webcam, IP camera, smartphone camera).
- **Computer Vision Model:** Object detection model running inside TEE to identify pet behaviors.
- **Activity Classification:** Camera feed analyzes pet to detect states:
  - **Running:** Pet in motion, high movement velocity
  - **Playing:** Active movements, energetic behavior patterns
  - **Eating:** Pet at food bowl, head-down position
  - **Drinking:** Pet at water bowl
  - **Sleeping:** Stationary, resting position
- **Duration Tracking:** TEE records how long pet stays in each activity state.
- **TEE Processing:**
  - Camera feed processed entirely within Phala Network TEE for privacy.
  - Computer vision inference runs inside secure enclave — no raw video leaves the TEE.
  - Only verified activity events (type + duration) submitted on-chain.
- **On-Chain Submission:** TEE-attested events recorded to pet's smart contract with timestamp and duration.

**Why Not ZKP?**  
We initially explored zero-knowledge proofs for privacy, but ZK circuits cannot efficiently handle the complex computer vision computations required for real-time object detection and behavioral analysis. TEE provides the same privacy guarantees (sensitive data never exposed) while supporting full computer vision model inference inside the secure enclave.

#### GPS Location & Movement Tracking (iPhone GPS)
**Implementation Details:**
- **Device:** iPhone GPS sensor (or any GPS-enabled device).
- **Data Captured:**
  - **Longitude & Latitude:** Precise location coordinates
  - **Speed:** Movement velocity in real-time
  - **Distance:** Cumulative distance traveled
- **TEE Processing:**
  - Raw GPS data sent to Phala Network TEE.
  - TEE processes coordinates, calculates speed and distance.
  - Privacy-preserving: exact coordinates can remain in TEE, only aggregated metrics (distance, average speed) published on-chain if desired.
- **On-Chain Events:** Location updates and movement summaries recorded to pet's contract with TEE attestation.

#### Combined Camera & GPS Approach
**Two Data Sources Working Together:**
1. **Camera Computer Vision:** Detects what the pet is doing (running, playing, eating, drinking, sleeping) and for how long.
2. **GPS Tracking:** Provides location context (longitude, latitude) and movement metrics (speed, distance).
3. **TEE Fusion:** Both data streams processed in Phala Network TEE, cross-validated, and submitted as unified activity events on-chain.

### 5. Verifiability & Trust
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 81c2e0e90eeac2d7f5347bfa85d612b800413d66
- **TEE Attestations:** All sensitive activity data (camera feeds, GPS coordinates) processed within Phala Network TEE — no raw data exposed publicly.
- **Device Binding:** Camera and GPS devices registered to pet's smart contract; TEE verifies data source authenticity.
- **Named Contract Identity:** Human-readable pet names (e.g., `Buddy_The_Dog`) searchable directly in Blockscout explorer.
- **Cryptographic Verification:** TEE produces cryptographic attestations proving data was processed in secure enclave.
- **Immutable Event Log:** All verified activities recorded on-chain to pet's contract, viewable in Blockscout.
- **Privacy Preservation:** Raw video and precise GPS coordinates remain in TEE; only activity summaries published on-chain.
- **Explorer Verification:** Anyone can verify TEE attestations through Blockscout without accessing sensitive raw data.
<<<<<<< HEAD
=======
- **Zero-Knowledge Proofs:** All sensitive activity data (GPS, movement, consumption) verified via ZKP — no raw data on-chain.
- **Device Binding:** Bind device public key or NFC UID to the pet's on-chain identity; contracts verify event signatures and ZK proofs.
- **ENS Identity:** Human-readable pet names (e.g., `shibaba.petpet.eth`) make verification and sharing easier.
- **Attestations:** Whitelisted vets/boarders add signed care attestations with cryptographic verification.
- **Challenge Prompts:** Random challenges (e.g., "scan collar in 5 minutes") deter spoofing and ensure device authenticity.
- **Proof References:** Content hashes for photos/weights stored off-chain; decryptable only by authorized parties.
- **Explorer Verification:** Anyone can verify ZK proofs through the Explorer without accessing private data.
>>>>>>> 8a0967dfbdb37ce711ca7fd990b6baae5d027109
=======
>>>>>>> 81c2e0e90eeac2d7f5347bfa85d612b800413d66

---

## Technical Architecture

### Data Flow
1. **Pet Creation:** Owner creates pet profile → deploys named smart contract → registers with name registry.
2. **Sensor Collection:** Camera captures video feed; iPhone GPS tracks location (longitude, latitude, speed).
3. **TEE Processing:** All sensor data sent to Phala Network TEE for secure processing:
   - Camera feed → computer vision object detection → activity classification (running, playing, eating, drinking, sleeping) + duration
   - GPS data → location tracking → speed/distance calculations
4. **Event Submission:** TEE submits verified activity events on-chain to pet's smart contract with attestations.
5. **Explorer Indexing:** Blockscout Autoscout indexes all pet contract events and transactions.
6. **Dashboard Display:** Owner views activity via Blockscout SDK integration; public can browse verified events in explorer.

### Blockchain Infrastructure
- **Local Node:** Anvil (Foundry) spins up local Ethereum node for development and testing.
- **TEE Deployment:** Smart contracts deployed inside Phala Network TEE for enhanced security.
- **Chain ID:** 2403
- **RPC URL:** `https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952-8545.dstack-prod5.phala.network/`
- **Explorer:** Blockscout Autoscout instance connected to the chain RPC.

### TEE Implementation (Phala Network)
- **Secure Enclave:** All sensitive data processing happens inside Phala Network TEE.
- **Computer Vision Inference:** Camera-based object detection models run entirely within TEE.
- **Privacy Preservation:** Raw video feeds and precise GPS coordinates never leave the TEE.
- **Attestation:** TEE generates cryptographic attestations for each verified activity event.
- **On-Chain Events:** Only activity summaries (type, duration, timestamp) and TEE attestations recorded on-chain.

### Blockscout Integration
- **Autoscout Deployment:** Self-service explorer launched via deploy.blockscout.com for chain ID 2403.
- **Contract Verification:** Each pet contract verified and searchable by name in explorer.
- **SDK Integration:** Blockscout SDK embedded in dashboard for transaction visualization and real-time updates.
- **API Access:** Blockscout API used to query pet activity events and contract interactions.

---

## Prize Targets

### 🚀 Best use of Autoscout Self-Service Explorer Launchpad ($3,500)
**How PetPet Qualifies:**
- Launched custom Blockscout explorer for chain ID 2403 via deploy.blockscout.com
- Connected to Phala Network TEE-hosted RPC endpoint
- Explorer indexes all pet contract deployments and activity events
- Custom pet-centric UX: search pets by contract name, browse activity timelines
- Provides transaction tracking, event logs, and contract verification for the pet ecosystem

### 📚 Best Blockscout SDK Integration ($3,000)
**How PetPet Qualifies:**
- Blockscout SDK integrated into pet owner dashboard
- Real-time transaction visualization for activity event submissions
- Interactive explorer feedback embedded in UI
- SDK provides instant access to pet contract data and event history
- Enhanced UX: users see transaction details inline without leaving the dashboard

---

## Use Cases

### For Pet Owners
- Track daily activity patterns (running, playing, eating, drinking, sleeping) with TEE-verified proof.
- Monitor real-time location and movement via GPS tracking (longitude, latitude, speed).
- View activity duration breakdowns — how long pet spent in each state throughout the day.
- Search your pet by name in Blockscout explorer and view complete activity history.
- Share wellness reports with vets using privacy-preserving TEE attestations.
- Verify caretaker/walker claims with immutable on-chain proof of activity.

### For Vets & Boarders
- Access complete, tamper-evident care history via Blockscout explorer.
- Review activity patterns and behavioral trends from camera computer vision detection.
- Verify location and movement data from GPS tracking.
- Track recovery progress through objective activity measurements.
- Search pet contracts by name for instant access to records.

### For Pet Communities
- Browse public pet profiles and their activity timelines in the explorer.
- View verified activity events with TEE attestations for trust.
- Discover activity patterns and behavioral insights.
- Build trust in pet care services through verifiable, immutable track records on-chain.