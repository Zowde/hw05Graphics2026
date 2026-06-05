# Computer Graphics - Exercise 5 - WebGL Bowling Alley

A static 3D bowling alley scene built with Three.js / WebGL. This exercise
implements the full visual infrastructure (lane, pins, ball, lighting, and UI
scaffolding). Interactive gameplay, physics, and scoring are reserved for HW06.

## Group Members

* Zowde Adam

## How to Run

1. Make sure you have Node.js installed (LTS recommended).
2. From the project root, install dependencies:
   ```
   npm install
   ```
3. Start the local web server:
   ```
   node index.js
   ```
4. Open your browser and go to: http://localhost:8000

## Controls

| Key | Action |
| --- | ------ |
| `O` | Toggle orbit camera on/off |
| `1` | Camera preset: Bowler view (default, down the lane) |
| `2` | Camera preset: Overhead view |
| `3` | Camera preset: Pin close-up |
| `4` | Camera preset: Ball view (on the approach) |
| `5` | Camera preset: Side view (shows bench & ball return) |

When orbit is enabled: left-drag to rotate, scroll to zoom, right-drag to pan.

## What Is Implemented (HW05 Infrastructure)

**Bowling lane & markings**
* Light maple, glossy lane surface (~3.5 x 60 units)
* Separate approach area in a darker, less glossy shade
* Red foul line across the full lane width
* Two gutters running the full length, recessed below the lane surface
* Two rows of approach dots
* Seven targeting arrows in the standard chevron formation, ~15 units from the
  foul line

**Pins**
* Ten pins in the regulation 1-2-3-4 triangular formation
* Pin shape built with `THREE.LatheGeometry` (a 2D profile revolved around the
  vertical axis to produce the classic base/belly/neck/head silhouette)
* White body with a red band at the neck
* Distinct darker pin-deck surface beneath the pins
* Positions taken directly from the coordinates in the exercise instructions

**Bowling ball**
* Glossy sphere (radius 0.45) with a high-shininess material
* Three finger holes (two adjacent, one offset) represented as small dark
  cylinders flush with the surface
* Positioned static on the approach area, centered on the lane

**Camera & lighting**
* Ambient + directional key light, plus a softer fill light
* Shadows enabled; the directional light's shadow camera is enlarged to cover
  the entire lane, with a 2048x2048 shadow map and soft (PCF) shadow edges
* A floor plane grounds the scene and receives shadows
* Orbit controls, toggleable with the `O` key
* Sensible initial camera position looking down the lane

**UI framework**
* Scorecard container across the top with a 10-frame layout (empty, ready for
  HW06 to populate)
* Controls panel listing the available keys
* Shared CSS styling for the UI panels

## Additional Features (Bonus)

* **Multiple camera preset positions** — keys `1`-`5` snap the camera to preset
  views (bowler, overhead, pin close-up, ball, and a side view), making it easy
  to inspect the scene from standard angles.
* **Ball return track** — a rail/trough running the length of the lane plus a
  return unit near the bowler, modelling where a returned ball would travel and
  rest.
* **Seating area** — a wooden bench (seat, backrest, legs) positioned behind the
  approach, where a bowler would wait between turns.

## Known Issues / Limitations

* The finger holes are surface-flush cylinders rather than true drilled holes
  (true CSG subtraction was avoided for simplicity and stability). They read
  correctly from normal viewing angles.
* No physics, collision, aiming, power meter, or scoring logic — these are
  intentionally out of scope for HW05 and will be added in HW06.

## External Assets

* None. All geometry and materials are generated procedurally with Three.js
  primitives (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`,
  `LatheGeometry`, `ShapeGeometry`, `PlaneGeometry`). No external models,
  textures, or images were used.