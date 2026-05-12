# 🛠️ StepOff: Master Implementation Guide (v1.0)

**Objective:** Build a high-performance, industrial-grade marching band visualization and synchronization engine.
**Vibe:** Gritty, authoritative, "80s Swagger" met technical precision.

---

## Phase 1: The Core Engine (High-Precision Sync)

*Prioritize the 3D Render Loop and the Audio Source of Truth.*

### 1.1 The Synchronized State (Zustand)

Create a `useStore.ts` to act as the central nervous system.

* **Requirements:**
* Use **Zustand** for high-frequency updates.
* Track `currentTick` (MIDI-based), `bpm`, and `activeSet`.
* Store `performerData` as a `Float32Array` for direct mapping to GPU instances.
* **Logic:** The state must update at 60fps, driven by the Audio Clock, not React’s render cycle.



### 1.2 The Audio Engine (Tone.js)

Implement the `AudioController` to replace legacy metronomes.

* **Requirements:**
* Initialize `Tone.Transport` as the primary clock.
* Build a `MidiParser` utility to convert MIDI files into a **Tempo Map** (JSON).
* **Feature:** "Smart Metronome" that handles complex time signatures and tempo shifts automatically based on the MIDI map.
* **Constraint:** Zero-latency synchronization between the audio "click" and the 3D "step-off."



### 1.3 The 3D Field (React Three Fiber)

Build the `FieldCanvas` and `PerformerEngine`.

* **Requirements:**
* Use `<Instances>` and `<InstancedMesh>` from `@react-three/drei` to render 200+ students in one draw call.
* **Interpolation Logic:** Calculate position $P$ at time $t$ using linear interpolation between sets:

$$P(t) = P_{start} + (P_{end} - P_{start}) \cdot \frac{t - t_{start}}{t_{end} - t_{start}}$$


* Use daisyUI for the "HUD" (Heads-Up Display) overlaying the 3D scene.



---

## Phase 2: The Command Center (Admin & Auth)

*The Director's interface for show management.*

### 2.1 Database & Auth (Supabase + Auth.js)

Establish the "Ground Truth" for show data.

* **Requirements:**
* **Auth:** NextAuth (Auth.js) with Magic Link login (no passwords for directors).
* **Schema:** * `Bands`: UUID, School Name, Director ID.
* `DrillSets`: JSONB blob containing coordinate maps (optimized for rapid retrieval).
* `Performers`: Roster management linked to `BandID`.


* **Security:** Enable **Row Level Security (RLS)** to ensure Band A cannot see Band B’s secret show design.



### 2.2 Admin Console (daisyUI)

Create a "Gritty" Dashboard for show uploads.

* **Requirements:**
* **Upload Portal:** Drag-and-drop for MIDI and coordinate files (CSV/Pyware export).
* **Roster Manager:** Simple table to assign student emails to "Dots."
* **Theme:** Use daisyUI `business` or `dark` themes. High-contrast, industrial, "boots-on-the-ground" look.



---

## Phase 3: The "PhD" Modules (Advanced AR)

*The competitive edge: Distribution Shift & Model Distillation.*

### 3.1 The Shift Engine (Homography & Perspective)

Develop the logic for the "High Box" director view.

* **Requirements:**
* **Calibration:** Map 4 user-tapped screen points to the standard $360' \times 160'$ football field coordinates using a homography matrix $H$.
* **Perspective Correction:** Compensate for camera tilt and "Distribution Shift" (varying heights of different press boxes).
* **Feature:** Overlay the "Ghost Drill" (3D dots) onto a live camera feed via WebXR.



### 3.2 The Distill Module (Edge Tracking)

Lightweight person-tracking.

* **Requirements:**
* Execute a **Distilled Pose-Estimation Model** (Mediapipe or custom TensorFlow.js) in a Web Worker to track real students on the field.
* **The "Shame" Highlight:** Compare real-time student coordinates to the 3D "Ideal" coordinates. If error $E > 1.0$ meter, highlight the dot in red.

"Don't make it pretty. Make it precise. If a director is yelling at a student from the High Box, the app needs to back them up with objective data, not flashy animations."
