import * as THREE from "three";

/* ============================================================
   Product data (used by the detail overlay)
   ============================================================ */
const PRODUCTS = {
  lipstick: {
    eyebrow: "01 · lip",
    name: "Bloom Velvet Lipstick",
    price: "$28",
    tagline: "Long-wear matte in dusk rose.",
    body: "A weightless matte lipstick that glides on soft and sets to a blurred-velvet finish. Infused with shea butter for all-day comfort. Shade: Dusk Rose.",
  },
  perfume: {
    eyebrow: "02 · scent",
    name: "Petal Mist Eau de Parfum",
    price: "$65",
    tagline: "Powdery rose, warm peony, soft musk.",
    body: "A skin-close fragrance built on Bulgarian rose and peony petals, settled into warm musk. 50ml. Vegan and cruelty-free.",
  },
  compact: {
    eyebrow: "03 · finish",
    name: "Dew Powder Compact",
    price: "$34",
    tagline: "Silky pressed powder, built-in mirror.",
    body: "A translucent pink-tinted pressed powder that blurs pores and locks makeup in place without flattening your glow. Comes with a plush puff and mirror.",
  },
};

/* ============================================================
   Pink gradient stops — background lerps continuously on scroll
   ============================================================ */
const SHADES = [
  new THREE.Color(0xffeaf2), // hero
  new THREE.Color(0xfbc4d4), // lipstick
  new THREE.Color(0xf49ac1), // perfume
  new THREE.Color(0xe8628f), // compact
  new THREE.Color(0x7a2b4c), // footer
];

function lerpShade(t) {
  const scaled = t * (SHADES.length - 1);
  const i = Math.min(Math.floor(scaled), SHADES.length - 2);
  const localT = scaled - i;
  return SHADES[i].clone().lerp(SHADES[i + 1], localT);
}

/* ============================================================
   Renderer / scene / camera
   ============================================================ */
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 11);

/* Lights — warm pink key + soft fill */
const key = new THREE.DirectionalLight(0xffffff, 1.4);
key.position.set(4, 6, 8);
scene.add(key);

const fill = new THREE.PointLight(0xff8fbf, 1.2, 30);
fill.position.set(-6, -2, 6);
scene.add(fill);

const rim = new THREE.PointLight(0xffffff, 0.6, 30);
rim.position.set(0, 4, -6);
scene.add(rim);

const ambient = new THREE.AmbientLight(0xffe4ef, 0.55);
scene.add(ambient);

/* ============================================================
   Materials
   ============================================================ */
const matGold = new THREE.MeshPhysicalMaterial({
  color: 0xdba9a0,
  metalness: 0.85,
  roughness: 0.25,
});
const matDeepPink = new THREE.MeshPhysicalMaterial({
  color: 0xe8628f,
  metalness: 0.3,
  roughness: 0.35,
});
const matBullet = new THREE.MeshPhysicalMaterial({
  color: 0xc23f6f,
  metalness: 0.1,
  roughness: 0.5,
});
const matGlass = new THREE.MeshPhysicalMaterial({
  color: 0xffd6e6,
  metalness: 0,
  roughness: 0.05,
  transmission: 0.85,
  thickness: 0.6,
  transparent: true,
  opacity: 0.9,
});
const matCompactShell = new THREE.MeshPhysicalMaterial({
  color: 0xf6cdd9,
  metalness: 0.4,
  roughness: 0.3,
});
const matMirror = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 1,
  roughness: 0.1,
});
const matPowder = new THREE.MeshPhysicalMaterial({
  color: 0xffe3ee,
  metalness: 0,
  roughness: 0.9,
});

/* ============================================================
   Build: Lipstick (base + body + sliding cap)
   ============================================================ */
function buildLipstick() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.5, 32),
    matGold
  );
  base.position.y = -0.9;
  group.add(base);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.42, 1.1, 32),
    matGold
  );
  body.position.y = -0.1;
  group.add(body);

  const bullet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.5, 32),
    matBullet
  );
  bullet.position.y = 0.7;
  group.add(bullet);

  const cap = new THREE.Group();
  const capMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 1.55, 32),
    matDeepPink
  );
  cap.add(capMesh);
  cap.position.y = 0.4;
  group.add(cap);

  group.userData.cap = cap;
  group.userData.capClosedY = 0.4;
  group.userData.capOpenY = 1.5;

  return group;
}

/* ============================================================
   Build: Perfume bottle (glass body + lifting cap)
   ============================================================ */
function buildPerfume() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 1.5, 6),
    matGlass
  );
  body.position.y = -0.2;
  group.add(body);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.35, 24),
    matGlass
  );
  neck.position.y = 0.72;
  group.add(neck);

  const cap = new THREE.Group();
  const capMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.3, 0.55, 24),
    matGold
  );
  cap.add(capMesh);
  cap.position.y = 1.15;
  group.add(cap);

  group.userData.cap = cap;
  group.userData.capClosedY = 1.15;
  group.userData.capOpenY = 1.75;

  return group;
}

/* ============================================================
   Build: Compact (base + hinged lid + mirror)
   ============================================================ */
function buildCompact() {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.28, 40),
    matCompactShell
  );
  group.add(base);

  const powder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.75, 0.75, 0.06, 40),
    matPowder
  );
  powder.position.y = 0.17;
  group.add(powder);

  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.14, -0.9);
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.9, 0.1, 40),
    matCompactShell
  );
  lid.position.set(0, 0, 0.9);
  const mirror = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.72, 0.02, 40),
    matMirror
  );
  mirror.position.set(0, -0.06, 0.9);
  lidPivot.add(lid, mirror);
  group.add(lidPivot);

  group.userData.lid = lidPivot;
  group.userData.lidClosedX = 0;
  group.userData.lidOpenX = -Math.PI * 0.62;

  return group;
}

/* ============================================================
   Assemble products with idle-float data
   ============================================================ */
const lipstick = buildLipstick();
lipstick.scale.setScalar(1.15);
scene.add(lipstick);

const perfume = buildPerfume();
perfume.scale.setScalar(1.05);
scene.add(perfume);

const compact = buildCompact();
compact.scale.setScalar(1.0);
scene.add(compact);

const productMeshes = {
  lipstick: { obj: lipstick, phase: 0, openAmount: 0 },
  perfume: { obj: perfume, phase: 2.1, openAmount: 0 },
  compact: { obj: compact, phase: 4.2, openAmount: 0 },
};

/* ============================================================
   Scroll-driven layout
   Each section maps to a target X/Y/Z + opacity for its product.
   Progress 0..1 across the whole page.
   ============================================================ */
const sectionOrder = ["hero", "lipstick", "perfume", "compact", "footer"];

function getScrollProgress() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

// Returns 0..1 "focus" amount for a product given global progress
function focusAmount(progress, center, spread = 0.16) {
  const d = Math.abs(progress - center);
  return Math.max(0, 1 - d / spread);
}

const sectionCenters = {
  hero: 0.02,
  lipstick: 0.27,
  perfume: 0.5,
  compact: 0.73,
  footer: 0.95,
};

/* ============================================================
   Pointer tracking + screen projection for proximity opening
   ============================================================ */
const pointer = { x: -999, y: -999 };
window.addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
});
window.addEventListener("pointerleave", () => {
  pointer.x = -999;
  pointer.y = -999;
});

const projVec = new THREE.Vector3();
function toScreenXY(object3D) {
  projVec.setFromMatrixPosition(object3D.matrixWorld);
  projVec.project(camera);
  return {
    x: (projVec.x * 0.5 + 0.5) * window.innerWidth,
    y: (-projVec.y * 0.5 + 0.5) * window.innerHeight,
  };
}

/* ============================================================
   Click-to-open detail overlay (raycast)
   ============================================================ */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function openDetail(key) {
  const p = PRODUCTS[key];
  if (!p) return;
  document.getElementById("detailEyebrow").textContent = p.eyebrow;
  document.getElementById("detailName").textContent = p.name;
  document.getElementById("detailPrice").textContent = p.price;
  document.getElementById("detailTagline").textContent = p.tagline;
  document.getElementById("detailBody").textContent = p.body;
  document.getElementById("detailOverlay").hidden = false;
}

document.getElementById("detailClose").addEventListener("click", () => {
  document.getElementById("detailOverlay").hidden = true;
});
document.getElementById("detailOverlay").addEventListener("click", (e) => {
  if (e.target.id === "detailOverlay") e.currentTarget.hidden = true;
});
document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => openDetail(btn.dataset.open));
});

canvas.style.pointerEvents = "none"; // page handles scroll; we raycast on window click instead
window.addEventListener("click", (e) => {
  if (!document.getElementById("detailOverlay").hidden) return;
  ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(
    [lipstick, perfume, compact].flatMap((g) => g.children),
    true
  );
  if (hits.length) {
    for (const key of Object.keys(productMeshes)) {
      const root = productMeshes[key].obj;
      let n = hits[0].object;
      while (n) {
        if (n === root) return openDetail(key);
        n = n.parent;
      }
    }
  }
});

/* ============================================================
   Resize
   ============================================================ */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   Animation loop
   ============================================================ */
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();
  const progress = getScrollProgress();

  // Background shade
  document.body.style.backgroundColor = "#" + lerpShade(progress).getHexString();

  // Layout targets per product
  const layouts = {
    lipstick: { x: -2.6, y: 0.2 },
    perfume: { x: 2.6, y: 0.1 },
    compact: { x: -2.4, y: -0.1 },
  };

  Object.entries(productMeshes).forEach(([key, entry]) => {
    const focus = focusAmount(progress, sectionCenters[key]);
    const obj = entry.obj;
    const base = layouts[key];

    // drift toward center-ish + slightly up when focused, else drift off to the side/blurred out
    const targetX = base.x * (1 - focus * 0.55);
    const targetY = base.y + (1 - focus) * -1.4;
    const targetZ = -2 + focus * 2;
    const targetScale = 0.7 + focus * 0.55;
    const targetOpacity = 0.15 + focus * 0.85;

    obj.position.x += (targetX - obj.position.x) * 0.08;
    obj.position.y += (targetY + Math.sin(t * 0.6 + entry.phase) * 0.12 - obj.position.y) * 0.08;
    obj.position.z += (targetZ - obj.position.z) * 0.08;

    const s = THREE.MathUtils.lerp(obj.scale.x, targetScale, 0.08);
    obj.scale.setScalar(s);

    obj.rotation.y += 0.0025 + focus * 0.003;
    obj.rotation.x = Math.sin(t * 0.3 + entry.phase) * 0.05;

    obj.traverse((n) => {
      if (n.isMesh && n.material && "opacity" in n.material) {
        n.material.transparent = true;
        n.material.opacity += (targetOpacity - n.material.opacity) * 0.08;
      }
    });

    // Cursor-proximity open interaction (only when reasonably focused)
    const screenPos = toScreenXY(obj);
    const dx = pointer.x - screenPos.x;
    const dy = pointer.y - screenPos.y;
    const dist = Math.hypot(dx, dy);
    const proximityThreshold = 160;
    const wantsOpen = focus > 0.4 && dist < proximityThreshold;

    entry.openAmount += ((wantsOpen ? 1 : 0) - entry.openAmount) * 0.09;

    if (obj.userData.cap) {
      const closedY = obj.userData.capClosedY;
      const openY = obj.userData.capOpenY;
      obj.userData.cap.position.y = THREE.MathUtils.lerp(closedY, openY, entry.openAmount);
    }
    if (obj.userData.lid) {
      const closedX = obj.userData.lidClosedX;
      const openX = obj.userData.lidOpenX;
      obj.userData.lid.rotation.x = THREE.MathUtils.lerp(closedX, openX, entry.openAmount);
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
