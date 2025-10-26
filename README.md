# PetPet — The Pet-Centric On-Chain Explorer

> **Tagline:** PetPet turns real pet care into verifiable, privacy-safe on-chain events using Trusted Execution Environments (TEE), IoT devices and computer vision object detection — and gives everyone a pet-first explorer to see what matters.

---

## 🐾 Quick Overview

An ESP32 + GPS board turns your pet's collar into a privacy-preserving tracker. Raw coordinates are sent to a Phala Network TEE, which processes them to compute speed, distance, and trip summaries. Only TEE-attested, aggregated metrics are published on-chain for verifiable tracking without exposing raw location data.

---

## 📖 Description

**PetPet** is a revolutionary pet-first blockchain explorer where **each pet is represented by a uniquely named smart contract deployed on-chain**. Think of it as a verifiable, tamper-proof "digital twin" for your pet that tracks their real-world activities while preserving privacy through cutting-edge cryptographic techniques.

### The Problem We're Solving

Pet owners face a fundamental trust problem: there's no unified, trustworthy way to verify pet care and activity. Daycare updates are fragmented and easily fabricated. Vets and boarders lack standardized, tamper-evident records for feeding amounts, actual consumption, medications, and checkups tied to specific pets over time. Activity tracking is manual, subjective, and prone to bias. Most critically, existing pet tracking solutions expose sensitive location data publicly, creating privacy and security risks.

### Our Solution

PetPet creates a **privacy-preserving, verifiable on-chain identity** for each pet through a combination of:

1. **Named Smart Contracts:** Each pet gets a unique smart contract (e.g., `Buddy_The_Dog`) deployed on-chain, searchable by name in the Blockscout explorer. This eliminates the need for ENS while providing human-readable pet identities.

2. **Multi-Sensor Data Collection:**
   - **ESP32 + GPS Collar:** An IoT device attached to the pet's collar captures real-time location coordinates (longitude, latitude), speed, and movement patterns
   - **Camera Computer Vision:** Webcams or smartphone cameras detect pet activity states (running, playing, eating, drinking, sleeping) using object detection models
   - **Duration Tracking:** Automatically records how long pets spend in each activity state

3. **Trusted Execution Environment (TEE) Processing via Phala Network:**
   - All sensitive data (raw GPS coordinates, video feeds) is processed **entirely within** a secure enclave
   - Computer vision inference runs inside the TEE — no raw video or precise location data ever leaves the secure environment
   - TEE performs privacy-preserving computations: calculates distance traveled, average speed, activity duration, and behavioral patterns
   - Generates cryptographic attestations proving data was processed correctly without exposing sensitive information

4. **Privacy-First On-Chain Events:**
   - Only aggregated, TEE-attested metrics are published on-chain (e.g., "traveled 2.5km today" instead of exact coordinates)
   - Activity events include type, duration, and timestamp — verified but not invasive
   - Pet owners control privacy settings: choose what data to make public vs. keep private

5. **Blockscout-Powered Explorer & Real-Time Dashboard:**
   - **Autoscout Self-Service Deployment:** Custom explorer for chain ID 2403 connected to Phala Network TEE-hosted RPC
   - **Contract Search:** Search any pet by name directly in Blockscout
   - **Activity Timeline:** Browse chronological logs of all pet activities with transaction links and TEE attestation references
   - **Interactive 3D Dashboard:** Users see their pet's 3D avatar in the dashboard that mimics real-time behavior while activities are recorded on-chain simultaneously—when the physical pet runs, eats, or plays, the 3D avatar mirrors these actions instantly

### Why This Matters

**For Pet Owners:** Trustless verification of pet care. If a dog walker claims they walked your dog for an hour, the on-chain record with TEE attestation proves it. Monitor activity patterns, location history, and wellness trends with cryptographic certainty.

**For Vets & Boarders:** Access complete, tamper-evident care histories. Track recovery progress through objective measurements. Build trust with clients through verifiable, immutable records.

**For Privacy:** Unlike traditional GPS trackers that expose location data, PetPet processes everything in a TEE. Raw coordinates never appear on-chain or in public APIs. Only you and authorized parties can access detailed data, while third parties see only aggregated, privacy-safe metrics.

**For Rescue & Community:** Public, searchable pet profiles help reunite lost pets with owners. Immutable care records prevent abuse and ensure accountability in pet care services.

### Technical Innovation

We initially explored ENS for pet naming but realized Blockscout's native contract search provides the same human-readable benefits without deploying custom ENS resolvers or maintaining separate subgraphs. We also considered zero-knowledge proofs (ZKP) for privacy but discovered ZK circuits cannot efficiently handle complex computer vision computations required for real-time object detection. TEE provides equivalent privacy guarantees while supporting full computer vision model inference inside secure enclaves.

---

## 🛠 How It's Made

### Architecture Overview

PetPet is built as a **Next.js full-stack application** with smart contracts deployed on a custom blockchain, all integrated with Phala Network TEE for privacy-preserving computation and Blockscout for blockchain exploration.

### Technology Stack

**Frontend:**
- **Next.js (Pages Router):** React framework for server-side rendering and API routes
- **React:** Component-based UI with hooks for state management
- **Tailwind CSS:** Utility-first styling with custom component system
- **Spline 3D Viewer:** Interactive 3D pet avatars and room visualizations that mirror real-time pet behavior
- **shadcn/ui Components:** Reusable UI components (buttons, cards, dialogs, charts)
- **Canvas API:** Real-time video processing and object detection visualization
- **Geolocation API:** Browser-based GPS tracking from mobile devices
- **WebSocket/Real-time Updates:** Live synchronization between physical pet activities and on-chain events

**Backend & Smart Contracts:**
- **Solidity:** Smart contract language for pet identity and activity records
- **Hardhat:** Ethereum development environment for compiling, testing, and deploying contracts
- **TypeScript:** Type-safe contract interactions and deployment scripts
- **Phala Network TEE:** Secure enclave for privacy-preserving data processing
- **Anvil (Foundry):** Local Ethereum node for development (Chain ID: 2403)

**Blockchain Infrastructure:**
- **Custom Chain:** TEE-hosted RPC endpoint on Phala Network
- **RPC URL:** `https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952-8545.dstack-prod5.phala.network/`
- **Blockscout Autoscout:** Self-service explorer launched via deploy.blockscout.com
- **Blockscout API:** Contract verification, event indexing, and transaction queries

**IoT & Sensors:**
- **ESP32 + GPS Module:** Microcontroller with GPS sensor for collar-based tracking
- **Computer Vision Models:** Object detection for activity classification (running, playing, eating, drinking, sleeping)
- **Video Processing:** Real-time camera feed analysis

### How Everything Pieces Together

**1. Pet Creation & Identity System**

The core innovation is treating each pet as a **first-class blockchain citizen** through smart contracts:

```solidity
// PetTemplate.sol - Each pet instance is a deployed contract
contract Pet {
    string public petName;
    string public species;
    address public owner;
    mapping(uint256 => ActivityEvent) public activities;
}
```

- Owner connects wallet and creates pet profile via dashboard
- Frontend calls API route (`/api/deploy-pet.js`) which compiles and deploys a new pet contract
- Contract is deployed with a unique name (e.g., `Buddy_The_Dog`) to the Phala Network TEE-hosted chain
- `PetRegistry.sol` maintains a central directory preventing duplicate names
- Contract address is registered and searchable in Blockscout explorer

**2. ESP32 + GPS Collar Tracking (Hardware Integration)**

The ESP32 board with GPS module runs a lightweight firmware that:
- Reads GPS coordinates (latitude, longitude) every few seconds
- Calculates instantaneous speed and cumulative distance
- Sends raw sensor data to the TEE via HTTP POST to our Next.js API endpoint (`/api/process-gps`)
- API forwards data to Phala Network TEE for processing

**Critical Hacky Detail:** Instead of building a separate IoT backend, we leverage Next.js API routes as the data ingestion layer. The ESP32 posts JSON payloads directly to our Next.js server, which acts as a gateway to the TEE. This simplifies deployment and lets us use the same authentication system for web and IoT clients.

**3. Camera Computer Vision Pipeline**

Pet activity detection uses browser-based computer vision:
- Webcam or smartphone camera captures live video feed
- `DetectionCamera.js` component uses Canvas API to process frames
- Frames are sent to TEE via API endpoint (`/api/process-video`)
- Inside TEE: object detection model identifies pet and classifies activity state
- Duration tracking: TEE maintains state machine to calculate how long pet stays in each activity
- Only activity classifications (e.g., "running for 15 minutes") are returned, never raw video

**Notable Hack:** We initially tried running TensorFlow.js models client-side, but model size and inference speed were prohibitive on mobile devices. Offloading to TEE provides better performance AND privacy since video never hits public servers — it goes directly to the secure enclave.

**4. Phala Network TEE Integration**

This is where the **privacy magic** happens:

- All sensitive data processing occurs inside Phala Network's Trusted Execution Environment
- TEE runs a confidential smart contract (pink contract) that:
  - Receives raw GPS coordinates and video frames
  - Performs computer vision inference entirely within the secure enclave
  - Calculates privacy-preserving aggregates (total distance, average speed, activity durations)
  - Generates cryptographic attestations proving computations were performed correctly
  - Submits only aggregated, attested events to the pet's on-chain contract

**Why This Is Hard:** Running full computer vision models inside a TEE requires significant optimization. We had to quantize models, use TensorFlow Lite, and implement frame batching to fit within TEE memory constraints. The benefit is absolute privacy: no cloud provider, developer, or third party ever sees raw location or video data.

**5. Blockscout Explorer Deployment**

We launched a custom Blockscout instance using the **Autoscout Self-Service Launchpad**:
- Deployed via deploy.blockscout.com for chain ID 2403
- Connected to Phala Network TEE-hosted RPC endpoint
- Configured contract verification to support pet contract search by name
- Each deployed pet contract is verified, making it searchable as `Buddy_The_Dog` instead of `0x742d35Cc6...`

**Real-Time 3D Pet Mirroring:**
- Dashboard displays interactive 3D pet avatars using Spline 3D Viewer
- Physical pet activities trigger real-time animations in the 3D avatar
- When the real pet runs, the 3D avatar runs; when eating, the 3D avatar shows eating animation
- All activities are simultaneously recorded on-chain via TEE-attested events
- Creates an immersive experience where users watch their "digital twin" pet mirror real behavior while blockchain records verify every action

**6. Smart Contract Architecture**

We use a **factory pattern** for pet deployment:

- `PetRegistry.sol`: Central registry maintaining name → address mapping
- `PetTemplate.sol`: Template contract for each pet with activity logging
- Deployment scripts in `ignition/modules/` using Hardhat Ignition
- Type-safe contract interactions via TypeScript bindings in `types/ethers-contracts/`

**Particularly Hacky Pattern:** Instead of using OpenZeppelin's Clone pattern (EIP-1167) for gas-efficient pet deployments, we deploy full contracts. Why? Because Blockscout's contract verification doesn't play nicely with minimal proxies — full contracts ensure each pet is verifiable and searchable by name in the explorer. We prioritized explorer UX over gas optimization.

**7. Data Flow Summary**

```
ESP32 GPS Collar → Raw Coordinates → TEE Processing → Aggregated Metrics → On-Chain Event
Camera Feed → Video Frames → TEE CV Model → Activity Classification → On-Chain Event + 3D Avatar Update
Physical Pet Activity → Real-Time Detection → Simultaneous: {3D Avatar Animation + On-Chain Recording}
Blockscout Indexer → Event Logs → Dashboard Display
```

### Partner Technologies & Benefits

**Blockscout Autoscout:**
- Saved weeks of development time — no need to build custom blockchain explorer from scratch
- Self-service deployment via deploy.blockscout.com was remarkably smooth
- Contract verification system enabled human-readable pet names without ENS complexity
- Provides public explorer for viewing pet contract events and transaction history
- **Explorer Link:** [PetPet Blockscout Explorer](https://c2e90a7139bb5f5fe1c6deab725ee1a45631b952.dstack-prod5.phala.network/) (Chain ID: 2403)

**PayPal USD (PYUSD):**
- Enables stablecoin payments for pet care services with predictable, fiat-pegged pricing globally
- Powers automated stray animal feeding stations where users pay in PYUSD to dispense food with verified proof-of-impact
- Facilitates conditional smart contract payments to vets and shelters that auto-release when care is cryptographically verified
- Cross-border micropayment capabilities allow global communities to support local animal welfare instantly
- Programmable payment features enable subscription-based pet care and transparent crowdfunding with on-chain accountability
- **Resources:** [PYUSD Developer Documentation](https://linktr.ee/pyusd_dev)

**Hardhat 3:**
- Industry-standard development environment for compiling, testing, and deploying Solidity smart contracts
- Hardhat 3's Ignition deployment system provides reproducible, modular deployments for our factory pattern architecture
- TypeScript integration generates type-safe contract bindings enabling seamless frontend-backend communication
- Comprehensive testing framework validates pet identity creation, activity logging, and payment escrow logic
- Local network capabilities with Anvil accelerated development cycles for TEE integration testing
- Built-in contract verification tools streamlined the Blockscout verification process
- **Documentation:** [Hardhat Official Docs](https://hardhat.org/docs)

### Particularly Notable Hacks

1. **Real-Time 3D Pet Mirroring:** The dashboard displays a 3D avatar of the pet that mirrors real-world behavior in real-time while simultaneously recording on-chain. When the physical pet runs, the 3D avatar runs; when eating, it shows eating animations. This creates an immersive "digital twin" experience where users watch their pet's virtual representation sync perfectly with reality while blockchain events verify every action cryptographically. The synchronization happens through WebSocket connections that trigger both Spline 3D animations and on-chain transaction submissions in parallel.

2. **Next.js API Routes as IoT Gateway:** Using Next.js `/api` endpoints to ingest ESP32 sensor data avoids deploying separate IoT infrastructure. Same authentication, same deployment pipeline.

3. **TEE Frame Batching:** To reduce TEE round-trips, we batch video frames and process them in 5-second windows, dramatically reducing latency and cost.

4. **Blockscout Contract Name Search:** Leveraging Blockscout's existing verified contract search as a "free ENS" — each pet contract is verified with its name, making it searchable without deploying ENS resolvers.

5. **Privacy-Public Hybrid:** Pet contracts store both public events (activity counts) and encrypted references to detailed TEE-processed data. Owners can decrypt full GPS tracks; public only sees "2.5km traveled today."

6. **Local TEE Development:** During development, we ran a local Phala Network phat contract development environment to test TEE integration without deploying to mainnet — saved significant time and debugging headaches.

### Challenges Overcome

- **ZKP Limitation:** Discovered ZK circuits can't handle computer vision inference; pivoted to TEE
- **ENS Complexity:** Abandoned ENS in favor of Blockscout's contract verification for simpler deployment
- **TEE Memory Constraints:** Had to optimize CV models heavily to fit in secure enclave
- **Real-time Processing:** Implemented WebSocket fallback for low-latency activity updates when REST APIs were too slow

---

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Smart Contract Deployment

Navigate to the `smartcontract/` directory:

```bash
cd smartcontract
npm install
npx hardhat ignition deploy ignition/modules/PetRegistry.ts --network phala
```

---

## 📚 Learn More

- **Phala Network TEE:** [https://phala.network](https://phala.network)
- **Blockscout Explorer:** [https://www.blockscout.com](https://www.blockscout.com)
- **Next.js Documentation:** [https://nextjs.org/docs](https://nextjs.org/docs)
- **Hardhat Development:** [https://hardhat.org](https://hardhat.org)
