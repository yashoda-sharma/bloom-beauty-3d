/* ============================================================
   Product photography showcase
   DOM images replace the former Three.js product meshes.
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

const SHADES = ["#ffeaf2", "#fbc4d4", "#f49ac1", "#e8628f", "#7a2b4c"];
const sectionOrder = ["hero", "lipstick", "perfume", "compact", "footer"];
const sectionCenters = { hero: 0.02, lipstick: 0.27, perfume: 0.5, compact: 0.73, footer: 0.95 };
const products = [...document.querySelectorAll(".product-visual")];
const pointer = { x: 0, y: 0, active: false };
let scrollProgress = 0;

function lerp(a, b, amount) {
  return a + (b - a) * amount;
}

function focusAmount(progress, center, spread = 0.16) {
  return Math.max(0, 1 - Math.abs(progress - center) / spread);
}

function getScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? window.scrollY / max : 0;
}

function applyTilt(visual) {
  const rect = visual.getBoundingClientRect();
  const x = pointer.active ? (pointer.x - (rect.left + rect.width / 2)) / rect.width : 0;
  const y = pointer.active ? (pointer.y - (rect.top + rect.height / 2)) / rect.height : 0;
  visual.style.setProperty("--tilt-x", `${Math.max(-1, Math.min(1, y)) * -5}deg`);
  visual.style.setProperty("--tilt-y", `${Math.max(-1, Math.min(1, x)) * 6}deg`);
  visual.style.setProperty("--shadow-x", `${x * 18}px`);
  visual.style.setProperty("--shadow-y", `${Math.max(5, 18 + y * 12)}px`);
}

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.active = true;
  products.forEach(applyTilt);
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
  products.forEach(applyTilt);
});

function openDetail(key) {
  const product = PRODUCTS[key];
  if (!product) return;
  document.getElementById("detailEyebrow").textContent = product.eyebrow;
  document.getElementById("detailName").textContent = product.name;
  document.getElementById("detailPrice").textContent = product.price;
  document.getElementById("detailTagline").textContent = product.tagline;
  document.getElementById("detailBody").textContent = product.body;
  document.getElementById("detailOverlay").hidden = false;
}

document.querySelectorAll(".view-btn").forEach((button) => {
  button.addEventListener("click", () => openDetail(button.dataset.open));
});
document.getElementById("detailClose").addEventListener("click", () => {
  document.getElementById("detailOverlay").hidden = true;
});
document.getElementById("detailOverlay").addEventListener("click", (event) => {
  if (event.target.id === "detailOverlay") event.currentTarget.hidden = true;
});

function animate() {
  scrollProgress = getScrollProgress();
  const scaled = scrollProgress * (SHADES.length - 1);
  const shadeIndex = Math.min(Math.floor(scaled), SHADES.length - 2);
  document.body.style.backgroundColor = lerpColor(SHADES[shadeIndex], SHADES[shadeIndex + 1], scaled - shadeIndex);

  products.forEach((visual) => {
    const key = visual.dataset.product;
    const focus = focusAmount(scrollProgress, sectionCenters[key]);
    const isHovered = visual.matches(":hover") || (pointer.active && focus > 0.35 &&
      Math.hypot(pointer.x - (visual.getBoundingClientRect().left + visual.offsetWidth / 2),
        pointer.y - (visual.getBoundingClientRect().top + visual.offsetHeight / 2)) < 170);
    const targetOpacity = 0.08 + focus * 0.92;
    const targetScale = 0.76 + focus * 0.24 + (isHovered ? 0.045 : 0);
    visual.style.opacity = lerp(parseFloat(visual.style.opacity || "0"), targetOpacity, 0.1);
    visual.style.setProperty("--photo-scale", targetScale.toFixed(3));
    visual.classList.toggle("is-revealed", isHovered && focus > 0.25);
    applyTilt(visual);
  });
  requestAnimationFrame(animate);
}

function lerpColor(first, second, amount) {
  const parse = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const a = parse(first);
  const b = parse(second);
  return `rgb(${a.map((value, index) => Math.round(lerp(value, b[index], amount))).join(", ")})`;
}

window.addEventListener("resize", () => products.forEach(applyTilt));
animate();