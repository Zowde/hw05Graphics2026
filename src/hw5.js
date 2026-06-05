import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(renderer.domElement);

// Keep the canvas matched to the window size
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set background color
scene.background = new THREE.Color(0x1a1a2e);

// ============================================================
// LIGHTING + SHADOWS (Step 4)
// ============================================================

// Soft ambient fill so nothing is pure black (slightly brighter for legibility)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

// Main directional light — the "sun" that casts shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 30, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Enlarge the light's shadow "camera" so it covers the WHOLE 60-unit lane.
// (By default it's a tiny ~10x10 box, so most of the lane gets no shadow.)
directionalLight.shadow.camera.left   = -10;
directionalLight.shadow.camera.right  =  10;
directionalLight.shadow.camera.top    =  20;
directionalLight.shadow.camera.bottom = -70;
directionalLight.shadow.camera.near   =  0.5;
directionalLight.shadow.camera.far    =  100;
// Higher resolution shadow map = crisper shadow edges
directionalLight.shadow.mapSize.width  = 2048;
directionalLight.shadow.mapSize.height = 2048;

// A second, softer light from the other side so the far end isn't gloomy (no shadows from this one)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
fillLight.position.set(-10, 15, -40);
scene.add(fillLight);

// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // softer shadow edges



// Floor plane under everything — catches shadows and grounds the scene
function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(40, 120);
  const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a3a }); // lighter than before
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;   // lay it flat
  floor.position.set(0, -0.3, -25);  // just below the lane/gutters
  floor.receiveShadow = true;
  scene.add(floor);
}

// ============================================================
// LANE + MARKINGS (Step 1)
// ============================================================

// Create bowling lane
function createBowlingLane() {
  // Lane surface - just a simple light maple wood surface
  const laneGeometry = new THREE.BoxGeometry(3.5, 0.2, 60);
  const laneMaterial = new THREE.MeshPhongMaterial({
    color: 0xDEB887,  // Light maple wood color
    shininess: 80
  });
  const lane = new THREE.Mesh(laneGeometry, laneMaterial);
  lane.position.set(0, 0, -30);  // Lane extends from Z=0 (foul line) to Z=-60 (pin end)
  lane.receiveShadow = true;
  scene.add(lane);
}

// Approach area — where the bowler stands; slightly darker & less glossy than the lane
function createApproachArea() {
  const approachGeometry = new THREE.BoxGeometry(3.5, 0.2, 15);
  const approachMaterial = new THREE.MeshPhongMaterial({
    color: 0xC9A66B,   // warmer/darker than the lane's 0xDEB887
    shininess: 30      // duller than the lane (lane is 80)
  });
  const approach = new THREE.Mesh(approachGeometry, approachMaterial);
  approach.position.set(0, 0, 7.5);  // spans z=0 (foul line) to z=+15
  approach.receiveShadow = true;
  scene.add(approach);
}

// Foul line — thin red bar across the full lane width at z=0
function createFoulLine() {
  const foulGeometry = new THREE.BoxGeometry(3.5, 0.02, 0.15);
  const foulMaterial = new THREE.MeshPhongMaterial({ color: 0xcc2222 });
  const foulLine = new THREE.Mesh(foulGeometry, foulMaterial);
  foulLine.position.set(0, 0.11, 0);  // just on top of the surface
  scene.add(foulLine);
}

// Gutters — long channels on both sides, sitting LOWER than the lane surface
function createGutters() {
  const gutterMaterial = new THREE.MeshPhongMaterial({ color: 0x222630, shininess: 10 });
  const gutterGeometry = new THREE.BoxGeometry(0.5, 0.2, 60);

  const leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
  leftGutter.position.set(-2.0, -0.06, -30);  // top at y=0.04, below lane top (0.1)
  leftGutter.receiveShadow = true;
  scene.add(leftGutter);

  const rightGutter = new THREE.Mesh(gutterGeometry.clone(), gutterMaterial);
  rightGutter.position.set(2.0, -0.06, -30);
  rightGutter.receiveShadow = true;
  scene.add(rightGutter);
}

// Approach dots — two rows of targeting dots on the approach area
function createApproachDots() {
  const dotMaterial = new THREE.MeshPhongMaterial({ color: 0x3b2f2f });
  const dotGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16); // thin flat disc
  const rows = [3, 5.5];                                  // two rows down the approach
  const xs = [-1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5];        // 7 dots across

  rows.forEach(z => {
    xs.forEach(x => {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      dot.position.set(x, 0.11, z);  // flat on the approach surface
      scene.add(dot);
    });
  });
}

// Lane arrows — 7 triangles in the classic chevron, pointing toward the pins
function createLaneArrows() {
  const arrowMaterial = new THREE.MeshPhongMaterial({ color: 0x8a5a2b });

  // one small triangle, tip at +Y; we'll lay it flat so the tip points down-lane
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.35);      // tip
  shape.lineTo(-0.13, -0.18); // back-left
  shape.lineTo(0.13, -0.18);  // back-right
  shape.closePath();
  const arrowGeometry = new THREE.ShapeGeometry(shape);

  // center arrow ~15 units from the foul line (per spec), outer arrows recede toward the pins
  const positions = [
    { x:  0.0, z: -15.0 },
    { x: -0.5, z: -15.7 }, { x: 0.5, z: -15.7 },
    { x: -1.0, z: -16.4 }, { x: 1.0, z: -16.4 },
    { x: -1.5, z: -17.1 }, { x: 1.5, z: -17.1 },
  ];

  positions.forEach(p => {
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.rotation.x = -Math.PI / 2;   // lay the triangle flat on the lane
    arrow.position.set(p.x, 0.105, p.z);
    scene.add(arrow);
  });
}

// ============================================================
// PINS (Step 2)
// ============================================================

// Build ONE bowling pin using LatheGeometry (spin a 2D profile around the Y axis)
function createPin() {
  const pinGroup = new THREE.Group();

  // 2D profile: each point is (radius from center, height). Traces base -> belly -> neck -> head.
  const profile = [
    new THREE.Vector2(0.00, 0.00),  // bottom center
    new THREE.Vector2(0.18, 0.00),  // base edge
    new THREE.Vector2(0.20, 0.10),  // widen slightly
    new THREE.Vector2(0.22, 0.35),  // belly (widest part)
    new THREE.Vector2(0.16, 0.60),  // taper in
    new THREE.Vector2(0.09, 0.85),  // neck (narrowest)
    new THREE.Vector2(0.13, 1.05),  // head bulges back out
    new THREE.Vector2(0.10, 1.20),  // round toward the top
    new THREE.Vector2(0.00, 1.25),  // top center (rounded cap)
  ];

  const pinGeometry = new THREE.LatheGeometry(profile, 24); // 24 segments around = smooth
  const pinMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 60 });
  const pinBody = new THREE.Mesh(pinGeometry, pinMaterial);
  pinBody.castShadow = true;
  pinBody.receiveShadow = true;
  pinGroup.add(pinBody);

  // Red band around the neck — a thin cylinder hugging the pin at neck height
  const bandGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 24);
  const bandMaterial = new THREE.MeshPhongMaterial({ color: 0xcc2222 });
  const band = new THREE.Mesh(bandGeometry, bandMaterial);
  band.position.y = 0.78;  // sits just below the neck
  pinGroup.add(band);

  return pinGroup;
}

// Place all 10 pins in the standard triangle (coords straight from the instructions)
function createPins() {
  const pinPositions = [
    { x:  0.0, z: -57.000 },  // 1 head pin
    { x: -0.5, z: -57.866 },  // 2
    { x:  0.5, z: -57.866 },  // 3
    { x: -1.0, z: -58.732 },  // 4
    { x:  0.0, z: -58.732 },  // 5
    { x:  1.0, z: -58.732 },  // 6
    { x: -1.5, z: -59.598 },  // 7
    { x: -0.5, z: -59.598 },  // 8
    { x:  0.5, z: -59.598 },  // 9
    { x:  1.5, z: -59.598 },  // 10
  ];

  pinPositions.forEach(p => {
    const pin = createPin();
    pin.position.set(p.x, 0.1, p.z);  // base sits on the lane surface (y=0.1)
    scene.add(pin);
  });
}

// Pin deck — a distinct darker surface behind the pins
function createPinDeck() {
  const deckGeometry = new THREE.BoxGeometry(3.5, 0.21, 6);
  const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3520, shininess: 20 });
  const deck = new THREE.Mesh(deckGeometry, deckMaterial);
  deck.position.set(0, 0, -58);  // under and around the pins
  deck.receiveShadow = true;
  scene.add(deck);
}

// ============================================================
// BOWLING BALL (Step 3)
// ============================================================

// Bowling ball — glossy sphere with three finger holes, resting on the approach
function createBowlingBall() {
  const ballGroup = new THREE.Group();

  const radius = 0.45;

  // The ball itself — glossy dark sphere
  const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0x1133aa,    // deep blue
    shininess: 100,     // high shine = glossy
    specular: 0x666666  // bright highlight
  });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.castShadow = true;
  ballGroup.add(ball);

  // Three finger holes — small dark cylinders sitting flush on the top surface
  const holeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
  const holeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16);

  // local positions on the upper surface of the ball (two adjacent, one offset)
  const holeSpots = [
    { x: -0.10, z:  0.08 },
    { x:  0.10, z:  0.08 },
    { x:  0.00, z: -0.14 },
  ];

  holeSpots.forEach(s => {
    const hole = new THREE.Mesh(holeGeometry, holeMaterial);
    // place near the top of the sphere, poking slightly in
    hole.position.set(s.x, radius - 0.02, s.z);
    ballGroup.add(hole);
  });

  // Sit the whole ball on the approach area, centered on the lane
  ballGroup.position.set(0, radius + 0.1, 6);  // y so it rests on the surface; z=6 on the approach
  scene.add(ballGroup);
}

// ============================================================
// BONUS FEATURES
// ============================================================

// Ball return — a track running the length of the lane plus a return unit near the bowler
function createBallReturn() {
  const returnGroup = new THREE.Group();

  const railMaterial = new THREE.MeshPhongMaterial({ color: 0x444a55, shininess: 40 });

  // Two side rails forming a trough, running nearly the full lane length on the right side.
  // Length ~66 spans from the bowler end (z=+9) back toward the pin end (z=-57).
  const railGeometry = new THREE.BoxGeometry(0.15, 0.4, 66);

  const innerRail = new THREE.Mesh(railGeometry, railMaterial);
  innerRail.position.set(2.6, 0.1, -24);  // centered so it runs z=+9 .. z=-57
  innerRail.castShadow = true;
  innerRail.receiveShadow = true;
  returnGroup.add(innerRail);

  const outerRail = new THREE.Mesh(railGeometry.clone(), railMaterial);
  outerRail.position.set(3.2, 0.1, -24);
  outerRail.castShadow = true;
  outerRail.receiveShadow = true;
  returnGroup.add(outerRail);

  // Floor of the trough between the rails
  const troughGeometry = new THREE.BoxGeometry(0.6, 0.1, 66);
  const trough = new THREE.Mesh(troughGeometry, railMaterial);
  trough.position.set(2.9, -0.05, -24);
  trough.receiveShadow = true;
  returnGroup.add(trough);

  // Return unit — a box near the bowler where the ball comes back
  const unitGeometry = new THREE.BoxGeometry(1.4, 1.0, 1.6);
  const unitMaterial = new THREE.MeshPhongMaterial({ color: 0x2b3340, shininess: 30 });
  const unit = new THREE.Mesh(unitGeometry, unitMaterial);
  unit.position.set(2.9, 0.4, 9);
  unit.castShadow = true;
  unit.receiveShadow = true;
  returnGroup.add(unit);

  scene.add(returnGroup);
}

// Seating — a bench behind the approach (where the bowler waits)
function createSeating() {
  const benchGroup = new THREE.Group();

  const woodMaterial = new THREE.MeshPhongMaterial({ color: 0x6b4a2b, shininess: 25 });

  // Seat slab
  const seatGeometry = new THREE.BoxGeometry(4, 0.2, 1.2);
  const seat = new THREE.Mesh(seatGeometry, woodMaterial);
  seat.position.set(0, 0.6, 0);
  seat.castShadow = true;
  seat.receiveShadow = true;
  benchGroup.add(seat);

  // Backrest
  const backGeometry = new THREE.BoxGeometry(4, 1.0, 0.2);
  const back = new THREE.Mesh(backGeometry, woodMaterial);
  back.position.set(0, 1.1, -0.5);
  back.castShadow = true;
  back.receiveShadow = true;
  benchGroup.add(back);

  // Four legs
  const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
  const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const legXs = [-1.8, 1.8];
  const legZs = [-0.4, 0.4];
  legXs.forEach(lx => {
    legZs.forEach(lz => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(lx, 0.3, lz);
      leg.castShadow = true;
      benchGroup.add(leg);
    });
  });

  // Place the bench behind the approach (positive Z = bowler side)
  benchGroup.position.set(0, 0, 18);
  scene.add(benchGroup);
}

// ============================================================
// CREATE ALL ELEMENTS
// ============================================================
createFloor();
createBowlingLane();
createApproachArea();
createFoulLine();
createGutters();
createApproachDots();
createLaneArrows();
createPinDeck();
createPins();
createBowlingBall();
createBallReturn();
createSeating();

// ============================================================
// CAMERA + ORBIT CONTROLS
// ============================================================

// Set initial camera position — raised and behind the foul line, looking down the lane
camera.position.set(0, 12, 20);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -30);   // look at the middle of the lane
controls.update();
let isOrbitEnabled = true;

// Camera presets — each is a position + a point to look at.
// Pressing 1-4 snaps the camera so screenshots are easy to grab.
const cameraPresets = {
  '1': { name: 'Bowler view',  pos: [0, 12, 20],   target: [0, 0, -30] },
  '2': { name: 'Overhead',     pos: [0, 45, -28],  target: [0, 0, -28] },
  '3': { name: 'Pin close-up', pos: [0, 4, -50],   target: [0, 1, -58] },
  '4': { name: 'Ball view',    pos: [0, 3, 12],    target: [0, 0.5, 6]  },
  '5': { name: 'Side view',    pos: [16, 8, 12],   target: [0, 1, 0]    },
};

function applyPreset(preset) {
  camera.position.set(preset.pos[0], preset.pos[1], preset.pos[2]);
  controls.target.set(preset.target[0], preset.target[1], preset.target[2]);
  controls.update();
}

// ============================================================
// UI FRAMEWORK (Step 5)
// Empty containers + styling for the FUTURE scorecard and controls (HW06 fills these in)
// ============================================================

function createUI() {
  // ---- Inject CSS for all UI elements ----
  const style = document.createElement('style');
  style.textContent = `
    .ui-panel {
      position: absolute;
      background: rgba(20, 20, 35, 0.85);
      color: #fff;
      font-family: Arial, sans-serif;
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      box-sizing: border-box;
    }
    /* Scorecard across the top */
    #scorecard {
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    #scorecard .title {
      font-weight: bold;
      margin-right: 8px;
      white-space: nowrap;
    }
    #scorecard .frame {
      width: 46px;
      height: 46px;
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: 12px;
    }
    #scorecard .frame .frame-num {
      font-size: 10px;
      opacity: 0.7;
    }
    #scorecard .frame .frame-score {
      flex: 1;
      display: flex;
      align-items: center;
      font-size: 14px;
    }
    /* Controls panel bottom-left */
    #controls-panel {
      bottom: 20px;
      left: 20px;
      padding: 12px 16px;
      max-width: 260px;
    }
    #controls-panel h3 { margin: 0 0 6px 0; font-size: 16px; }
    #controls-panel p  { margin: 4px 0; font-size: 14px; }
    #controls-panel .future { opacity: 0.5; font-style: italic; }
  `;
  document.head.appendChild(style);

  // ---- Scorecard container (10 empty frames, ready for HW06) ----
  const scorecard = document.createElement('div');
  scorecard.id = 'scorecard';
  scorecard.className = 'ui-panel';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'SCORE';
  scorecard.appendChild(title);

  for (let i = 1; i <= 10; i++) {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.innerHTML = `<span class="frame-num">${i}</span><span class="frame-score"></span>`;
    scorecard.appendChild(frame);
  }
  document.body.appendChild(scorecard);

  // ---- Controls panel (upgraded version of the starter's instructions box) ----
  const controlsPanel = document.createElement('div');
  controlsPanel.id = 'controls-panel';
  controlsPanel.className = 'ui-panel';
  controlsPanel.innerHTML = `
    <h3>Bowling Alley Controls</h3>
    <p>O - Toggle orbit camera</p>
    <p>1 - Bowler view &nbsp; 2 - Overhead</p>
    <p>3 - Pin close-up &nbsp; 4 - Ball view</p>
    <p>5 - Side view</p>
    <p class="future">Aiming &amp; throw controls coming in HW06</p>
  `;
  document.body.appendChild(controlsPanel);
}

createUI();

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
  // Camera presets: keys 1-4
  if (cameraPresets[e.key]) {
    applyPreset(cameraPresets[e.key]);
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();