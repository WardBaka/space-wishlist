
/* ========================================
   SUPABASE CONNECTION
======================================== */


const SUPABASE_URL = "https://gqkubboufojjjmlzcxdu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_giVSbWaVDO7d8kicRNqEnQ_GrPjr2us";

const SAVE_GIFT_ENDPOINT =
  `${SUPABASE_URL}/functions/v1/save-gift`;

  
async function sendGiftToSupabase(gift) {
  const response = await fetch(SAVE_GIFT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_PUBLISHABLE_KEY
    },
    body: JSON.stringify({
      name: gift.name,
      link: gift.link,
      occasion: gift.occasion,
      price: gift.price,
      notes: gift.notes
    })
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success !== true) {
    throw new Error(
      result.error || "Unable to save gift to Supabase"
    );
  }

  return result;
}


const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const buttonArea = document.getElementById("buttonArea");

const noMessages = [
  "Hey now... c'mon",
  "Sure?",
  "Just think for a minute",
  "Jenny..."
];

let noClickCount = 0;
let escaping = false;
let lastMove = 0;

// Change the No button text after each click.
noBtn.addEventListener("click", () => {
  if (escaping) return;

  if (noClickCount < noMessages.length) {
    noBtn.textContent = noMessages[noClickCount];
    noClickCount++;
    return;
  }

  startEscaping();
});

// Start the escape behavior.
function startEscaping() {
  escaping = true;

  // Prevent the No button from being clicked again.
  noBtn.style.pointerEvents = "none";

  // Start making Yes glow after five seconds.
  setTimeout(() => {
    yesBtn.classList.add("glowing");
  }, 5000);
}

// Move the No button away from the cursor.
document.addEventListener("pointermove", (event) => {
  if (!escaping || event.pointerType !== "mouse") return;

  const noRect = noBtn.getBoundingClientRect();
  const areaRect = buttonArea.getBoundingClientRect();

  const centerX = noRect.left + noRect.width / 2;
  const centerY = noRect.top + noRect.height / 2;

  const distance = Math.hypot(
    event.clientX - centerX,
    event.clientY - centerY
  );

  // The cursor must get within 120 pixels.
  if (distance > 120) return;

  // Limit how frequently the button moves.
  if (Date.now() - lastMove < 180) return;
  lastMove = Date.now();

  moveNoButton(event.clientX, event.clientY, areaRect);
});

function moveNoButton(mouseX, mouseY, areaRect) {
  const buttonWidth = noBtn.offsetWidth;
  const buttonHeight = noBtn.offsetHeight;

  const maxX = Math.max(0, areaRect.width - buttonWidth);
  const maxY = Math.max(0, areaRect.height - buttonHeight);

  const yesRect = yesBtn.getBoundingClientRect();

  const candidates = [];

  // Find a new position far from the cursor.
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    const screenX = areaRect.left + x;
    const screenY = areaRect.top + y;

    const distance = Math.hypot(
      mouseX - (screenX + buttonWidth / 2),
      mouseY - (screenY + buttonHeight / 2)
    );

    const overlapsYes = !(
      screenX + buttonWidth < yesRect.left ||
      screenX > yesRect.right ||
      screenY + buttonHeight < yesRect.top ||
      screenY > yesRect.bottom
    );

    if (!overlapsYes) {
      candidates.push({ x, y, distance });
    }
  }

  if (candidates.length === 0) return;

  // Choose the position furthest from the cursor.
  candidates.sort((a, b) => b.distance - a.distance);

  const best = candidates[0];

  noBtn.style.left = `${best.x}px`;
  noBtn.style.top = `${best.y}px`;
}



/* ========================================
   INTERACTIVE PLANET & MOONS — V3
======================================== */

const planetSystem = document.getElementById("planetSystem");

const moons = [
  document.getElementById("moonOne"),
  document.getElementById("moonTwo"),
  document.getElementById("moonThree"),
  document.getElementById("moonFour"),
  document.getElementById("moonFive")
];

const center = {
  x: 340,
  y: 340
};

const orbitSettings = [
  { rx: 285, ry: 110, speed: 0.00022, phase: 0.6 },
  { rx: 230, ry: 165, speed: -0.00032, phase: 2.4 },
  { rx: 310, ry: 200, speed: 0.00015, phase: 4.1 },
  { rx: 250, ry: 140, speed: 0.00027, phase: 5.2 },
  { rx: 330, ry: 175, speed: -0.00019, phase: 1.8 }
];

const moonColors = [
  "#dceaff",
  "#d6a9cc",
  "#a7e2ee",
  "#c5b0f7",
  "#e8d5b8"
];

let destroyedMoons = 0;
const destroyed = new Set();
const particles = [];

const startTime = performance.now();

/* ========================================
   CLICK EVENTS
======================================== */

moons.forEach((moon, index) => {
  moon.addEventListener("click", () => {
    if (destroyed.has(index)) return;

    explodeMoon(index);
  });
});

/* ========================================
   EXPLODE A MOON
======================================== */

function explodeMoon(index) {
  const moon = moons[index];

  destroyed.add(index);
  destroyedMoons++;

  // Capture the moon's current position.
  const startX = parseFloat(moon.style.left);
  const startY = parseFloat(moon.style.top);

  // Hide the moon.
  moon.style.display = "none";

  // Create a bright flash.
  createFlash(startX, startY);

  // Each moon contributes one fifth of the ring.
  createRingFragments(index, startX, startY);

  // All moons destroyed!
  if (destroyedMoons === moons.length) {
    planetSystem.classList.add("ring-complete");
  }
}

/* ========================================
   EXPLOSION FLASH
======================================== */

function createFlash(x, y) {
  const flash = document.createElement("div");

  flash.className = "explosion-flash";
  flash.style.left = `${x}px`;
  flash.style.top = `${y}px`;
  flash.style.zIndex = "10";

  planetSystem.appendChild(flash);

  setTimeout(() => {
    flash.remove();
  }, 500);
}

/* ========================================
   CREATE RING FRAGMENTS
======================================== */


function createRingFragments(moonIndex, startX, startY) {
  const fragmentCount = 90;

  for (let i = 0; i < fragmentCount; i++) {
    const element = document.createElement("div");

    element.className = "ring-particle";

    const size = 1 + Math.random() * 2.5;

    element.style.width = `${size}px`;
    element.style.height = `${size}px`;

    const color = moonColors[moonIndex];

    element.style.background = color;
    element.style.color = color;

    planetSystem.appendChild(element);

    // Each moon contributes a section of the ring.
    const sectionSize = (Math.PI * 2) / moons.length;

    const targetAngle =
      moonIndex * sectionSize +
      Math.random() * sectionSize;

    // Different ring distances create thickness.
    const radius = 205 + Math.random() * 105;

    // Initial explosion direction.
    const explosionAngle = Math.random() * Math.PI * 2;

    // How far this fragment initially scatters.
    const explosionForce = 80 + Math.random() * 140;

    // Slight random variation in vertical movement.
    const verticalForce = 0.5 + Math.random() * 0.5;

    particles.push({
      element,

      startX,
      startY,

      targetAngle,
      radius,

      explosionAngle,
      explosionForce,
      verticalForce,

      birth: performance.now(),

      // Take 5–7 seconds to settle into orbit.
      duration: 5000 + Math.random() * 2000,

      orbitSpeed: 0.000035 + Math.random() * 0.00002
    });
  }
}

/* ========================================
   ANIMATION HELPERS
======================================== */

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ========================================
   MAIN ANIMATION LOOP
======================================== */

function animateSpace(time) {
  const elapsed = time - startTime;

  // Animate surviving moons.
  moons.forEach((moon, index) => {
    if (destroyed.has(index)) return;

    const orbit = orbitSettings[index];

    const angle =
      elapsed * orbit.speed + orbit.phase;

    const x =
      center.x + Math.cos(angle) * orbit.rx;

    const y =
      center.y + Math.sin(angle) * orbit.ry;

    const depth = Math.sin(angle);

    const scale =
      0.8 + (depth + 1) * 0.15;

    moon.style.left = `${x}px`;
    moon.style.top = `${y}px`;

    moon.style.transform =
      `translate(-50%, -50%) scale(${scale})`;

    moon.style.zIndex = depth > 0 ? "7" : "4";

    moon.style.filter =
      `brightness(${0.75 + (depth + 1) * 0.2})`;
  });

  
// ========================================
// SMOOTH GRAVITATIONAL ORBIT CAPTURE
// ========================================

particles.forEach((particle) => {
  const age = Math.max(0, time - particle.birth);

  const progress = Math.min(
    age / particle.duration,
    1
  );

  // Smooth acceleration and deceleration.
  // Continuous from 0 to 1.
  const smoothProgress =
    progress * progress * (3 - 2 * progress);

  // The target continues orbiting while
  // the fragment approaches it.
  const currentAngle =
    particle.targetAngle +
    age * particle.orbitSpeed;

  const ringX =
    center.x +
    Math.cos(currentAngle) * particle.radius;

  const ringY =
    center.y +
    Math.sin(currentAngle) * particle.radius * 0.33;

  // ========================================
  // EXPLOSION MOTION
  // ========================================

  // The explosion starts at zero displacement,
  // expands, then gradually fades away.
  //
  // sin(PI * progress) gives us a continuous
  // curve with no sudden position changes.

  const explosionStrength =
    Math.sin(Math.PI * progress);

  const explosionX =
    Math.cos(particle.explosionAngle) *
    particle.explosionForce *
    explosionStrength;

  const explosionY =
    Math.sin(particle.explosionAngle) *
    particle.explosionForce *
    particle.verticalForce *
    explosionStrength;

  // ========================================
  // GRAVITATIONAL PULL
  // ========================================

  // Slowly interpolate from the moon's
  // original position toward its orbit.

  const gravityX =
    lerp(
      particle.startX,
      ringX,
      smoothProgress
    );

  const gravityY =
    lerp(
      particle.startY,
      ringY,
      smoothProgress
    );

  // Combine scattering and orbital capture.
  const x = gravityX + explosionX;
  const y = gravityY + explosionY;

  particle.element.style.left = `${x}px`;
  particle.element.style.top = `${y}px`;

  // ========================================
  // ORBIT DEPTH
  // ========================================

  const depth = Math.sin(currentAngle);

  particle.element.style.zIndex =
    depth > 0 ? "8" : "4";

  // Slight brightness variation.
  particle.element.style.opacity =
    `${0.65 + (depth + 1) * 0.15}`;
});


  requestAnimationFrame(animateSpace);
}

requestAnimationFrame(animateSpace);



/* ========================================
   ADDITIONAL PLANET MOONS
======================================== */

const extraPlanets = [
  {
    element: document.getElementById("saturnWorld"),

    moons: [
      {
        element: document.querySelector(".moon-icy"),
        rx: 175,
        ry: 75,
        speed: 0.00016,
        phase: 0
      },
      {
        element: document.querySelector(".moon-rocky"),
        rx: 145,
        ry: 95,
        speed: -0.00023,
        phase: 2
      },
      {
        element: document.querySelector(".moon-gold"),
        rx: 200,
        ry: 115,
        speed: 0.00012,
        phase: 4
      }
    ]
  },
  {
    element: document.getElementById("volcanicWorld"),

    moons: [
      {
        element: document.querySelector(".moon-ash"),
        rx: 125,
        ry: 58,
        speed: 0.0003,
        phase: 1
      },
      {
        element: document.querySelector(".moon-dark"),
        rx: 155,
        ry: 82,
        speed: -0.00021,
        phase: 3.5
      }
    ]
  }
];

/* ========================================
   ANIMATE ADDITIONAL MOONS
======================================== */

function animateExtraMoons(time) {
  extraPlanets.forEach((planet) => {
    const size = planet.element.offsetWidth;
    const middle = size / 2;

    planet.moons.forEach((moon) => {
      const angle = time * moon.speed + moon.phase;

      // Orbit sizes scale with the planet.
      const scale = size / (
        planet.element.id === "saturnWorld" ? 230 : 165
      );

      const x =
        middle + Math.cos(angle) * moon.rx * scale;

      const y =
        middle + Math.sin(angle) * moon.ry * scale;

      const depth = Math.sin(angle);

      moon.element.style.left = `${x}px`;
      moon.element.style.top = `${y}px`;

      // Moons remain spherical.
      const moonScale = 0.85 + (depth + 1) * 0.12;

      moon.element.style.transform =
        `translate(-50%, -50%) scale(${moonScale})`;

      // Move behind or in front of the planet.
      moon.element.style.zIndex = depth > 0 ? "6" : "2";

      moon.element.style.filter =
        `brightness(${0.75 + (depth + 1) * 0.2})`;
    });
  });

  requestAnimationFrame(animateExtraMoons);
}

requestAnimationFrame(animateExtraMoons);

/* ========================================
   SPACESHIP FLYBYS
======================================== */

const spaceship = document.getElementById("spaceship");

let spaceshipFlying = false;
let flightAnimation = null;
let astronautActive = false;

const flightPaths = [
  // Left to right
  {
    start: () => [-200, window.innerHeight * 0.25],
    end: () => [window.innerWidth + 200, window.innerHeight * 0.55]
  },

  // Right to left
  {
    start: () => [window.innerWidth + 200, window.innerHeight * 0.7],
    end: () => [-200, window.innerHeight * 0.3]
  },

  // Lower left to upper right
  {
    start: () => [-200, window.innerHeight + 100],
    end: () => [window.innerWidth + 200, -100]
  },

  // Upper right to lower left
  {
    start: () => [window.innerWidth + 200, -100],
    end: () => [-200, window.innerHeight + 100]
  },

  // Straight across the upper sky
  {
    start: () => [-200, window.innerHeight * 0.12],
    end: () => [window.innerWidth + 200, window.innerHeight * 0.15]
  }
];

function flySpaceship() {
  if (spaceshipFlying) return;

  spaceshipFlying = true;

  const path =
    flightPaths[Math.floor(Math.random() * flightPaths.length)];

  const [startX, startY] = path.start();
  const [endX, endY] = path.end();

  const angle =
    Math.atan2(endY - startY, endX - startX) *
    180 / Math.PI;

  const duration = 7000 + Math.random() * 5000;

  spaceship.style.visibility = "visible";

  // The spaceship SVG naturally points right.
  // Rotate it to face its travel direction.
flightAnimation = spaceship.animate(    [
      {
        transform:
          `translate(${startX}px, ${startY}px) rotate(${angle}deg)`,
        opacity: 0
      },
      {
        offset: 0.08,
        transform:
          `translate(${startX + (endX-startX)*0.08}px, ${startY + (endY-startY)*0.08}px) rotate(${angle}deg)`,
        opacity: 0.9
      },
      {
        offset: 0.92,
        transform:
          `translate(${startX + (endX-startX)*0.92}px, ${startY + (endY-startY)*0.92}px) rotate(${angle}deg)`,
        opacity: 0.9
      },
      {
        transform:
          `translate(${endX}px, ${endY}px) rotate(${angle}deg)`,
        opacity: 0
      }
    ],
    {
      duration,
      easing: "linear",
      fill: "forwards"
    }
  );

  flightAnimation.onfinish = () => {
    spaceship.style.visibility = "hidden";
    spaceshipFlying = false;

    scheduleNextFlyby();
  };
}

function scheduleNextFlyby() {
  // Random wait between 12 and 25 seconds.
  const delay = 12000 + Math.random() * 13000;

  setTimeout(flySpaceship, delay);
}

// First spaceship appears after 5 seconds.
setTimeout(flySpaceship, 5000);


/* ========================================
   SPACESHIP DESTRUCTION
======================================== */

const astronaut = document.getElementById("astronaut");

spaceship.addEventListener("click", () => {
  if (!spaceshipFlying || astronautActive) return;

  destroySpaceship();
});

function destroySpaceship() {
  astronautActive = true;

  // Capture spaceship's current screen position.
  const rect = spaceship.getBoundingClientRect();

  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  // Stop its current flight.
  if (flightAnimation) {
    flightAnimation.cancel();
    flightAnimation = null;
  }

  spaceship.style.visibility = "hidden";
  spaceship.style.opacity = "0";

  createShipExplosion(x, y);
  createShipDebris(x, y);

  // Astronaut appears shortly after the blast.
  setTimeout(() => {
    launchAstronaut(x, y);
  }, 650);
}

/* ========================================
   EXPLOSION EFFECT
======================================== */

function createShipExplosion(x, y) {
  const explosion = document.createElement("div");

  explosion.className = "ship-explosion";
  explosion.style.left = `${x}px`;
  explosion.style.top = `${y}px`;

  document.body.appendChild(explosion);

  setTimeout(() => explosion.remove(), 700);
}

/* ========================================
   FLYING DEBRIS
======================================== */

function createShipDebris(x, y) {
  const colors = [
    "#ffffff",
    "#ffce75",
    "#ff8a55",
    "#89cfff",
    "#a7a4ff"
  ];

  for (let i = 0; i < 35; i++) {
    const debris = document.createElement("div");

    debris.className = "ship-debris";

    const color = colors[
      Math.floor(Math.random() * colors.length)
    ];

    debris.style.background = color;
    debris.style.color = color;

    debris.style.left = `${x}px`;
    debris.style.top = `${y}px`;

    document.body.appendChild(debris);

    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 170;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const animation = debris.animate(
      [
        {
          transform: "translate(0, 0) rotate(0deg)",
          opacity: 1
        },
        {
          transform:
            `translate(${dx}px, ${dy}px) rotate(450deg)`,
          opacity: 0
        }
      ],
      {
        duration: 1000 + Math.random() * 1100,
        easing: "cubic-bezier(0.15, 0.6, 0.3, 1)",
        fill: "forwards"
      }
    );

    animation.onfinish = () => debris.remove();
  }
}

/* ========================================
   ASTRONAUT APPROACH
======================================== */

function launchAstronaut(startX, startY) {
  astronaut.style.visibility = "visible";

  const middleX = window.innerWidth / 2;
  const middleY = window.innerHeight / 2;

  // Center positions account for astronaut size.
  const targetX = middleX - 45;
  const targetY = middleY - 60;

  const initialX = startX - 45;
  const initialY = startY - 60;

  const approach = astronaut.animate(
    [
      {
        transform:
          `translate(${initialX}px, ${initialY}px) scale(0.15) rotate(-30deg)`,
        opacity: 0
      },
      {
        offset: 0.15,
        transform:
          `translate(${initialX}px, ${initialY}px) scale(0.3) rotate(-20deg)`,
        opacity: 1
      },
      {
        offset: 0.65,
        transform:
          `translate(${targetX}px, ${targetY}px) scale(1.2) rotate(8deg)`,
        opacity: 1
      },
      {
        transform:
          `translate(${targetX}px, ${targetY}px) scale(4.5) rotate(-8deg)`,
        opacity: 1
      }
    ],
    {
      duration: 3800,
      easing: "cubic-bezier(0.25, 0.3, 0.55, 1)",
      fill: "forwards"
    }
  );

  approach.onfinish = () => {
    triggerImpact();
    bounceAstronaut(targetX, targetY);
  };
}

/* ========================================
   CAMERA IMPACT
======================================== */

function triggerImpact() {
  const container = document.querySelector(".container");

  container.classList.remove("camera-shake");

  // Restart animation if needed.
  void container.offsetWidth;

  container.classList.add("camera-shake");

  const flash = document.createElement("div");

  flash.className = "impact-flash";

  document.body.appendChild(flash);

  setTimeout(() => {
    flash.remove();
    container.classList.remove("camera-shake");
  }, 500);
}

/* ========================================
   ASTRONAUT BOUNCES INTO SPACE
======================================== */

function bounceAstronaut(x, y) {
  const direction = Math.random() > 0.5 ? 1 : -1;

  const endX =
    x + direction * (window.innerWidth * 0.8);

  const endY =
    y - window.innerHeight * 0.7;

  const bounce = astronaut.animate(
    [
      {
        transform:
          `translate(${x}px, ${y}px) scale(4.5) rotate(-8deg)`,
        opacity: 1
      },
      {
        offset: 0.18,
        transform:
          `translate(${x - direction * 45}px, ${y + 35}px) scale(3.7) rotate(25deg)`,
        opacity: 1
      },
      {
        offset: 0.55,
        transform:
          `translate(${x + direction * 130}px, ${y - 150}px) scale(1.4) rotate(180deg)`,
        opacity: 1
      },
      {
        transform:
          `translate(${endX}px, ${endY}px) scale(0.05) rotate(720deg)`,
        opacity: 0
      }
    ],
    {
      duration: 4800,
      easing: "cubic-bezier(0.2, 0.5, 0.4, 1)",
      fill: "forwards"
    }
  );

  bounce.onfinish = () => {
    astronaut.style.visibility = "hidden";

    // Clear completed animation styles.
    astronaut.getAnimations().forEach((animation) => {
      animation.cancel();
    });

    astronautActive = false;
    spaceshipFlying = false;

    // Resume normal spaceship appearances.
    scheduleNextFlyby();
  };
}



/* ========================================
   INTRO TO WELCOME TRANSITION
======================================== */

const welcomeScreen = document.getElementById("welcomeScreen");
const dashboardScreen = document.getElementById("dashboardScreen");

const enterDashboardBtn = document.getElementById("enterDashboard");

let currentScreen = "intro";

// Yes button opens the welcome screen.
yesBtn.addEventListener("click", () => {
  if (currentScreen !== "intro") return;

  currentScreen = "welcome";

  // Blur the background and hide intro.
  document.body.classList.add("second-screen");

  // Disable interactive background objects.
  document.querySelectorAll(".moon").forEach((moon) => {
    moon.style.pointerEvents = "none";
  });

  spaceship.style.pointerEvents = "none";

  // Reveal the welcome card after the blur begins.
  setTimeout(() => {
    welcomeScreen.classList.add("visible");
    welcomeScreen.setAttribute("aria-hidden", "false");
  }, 700);
});

/* ========================================
   WELCOME TO MISSION CONTROL
======================================== */

enterDashboardBtn.addEventListener("click", () => {
  if (currentScreen !== "welcome") return;

  currentScreen = "dashboard";

  // Fade out personal welcome.
  welcomeScreen.classList.remove("visible");
  welcomeScreen.setAttribute("aria-hidden", "true");

  // Reveal Mission Control.
  setTimeout(() => {
    dashboardScreen.classList.add("visible");
    dashboardScreen.setAttribute("aria-hidden", "false");
  }, 500);
});



/* ========================================
   GIFT COLLECTION SYSTEM — V1
======================================== */

const giftScreen = document.getElementById("giftScreen");
const giftForm = document.getElementById("giftForm");

const addGiftCard = document.getElementById("addGiftCard");
const closeGiftScreenBtn = document.getElementById("closeGiftScreen");

const giftFeedback = document.getElementById("giftFeedback");

const STORAGE_KEY = "bobs-wishlist-v1";

/* ========================================
   LOAD SAVED GIFTS
======================================== */

function loadGifts() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let savedGifts = loadGifts();

/* ========================================
   OPEN / CLOSE GIFT SCREEN
======================================== */

addGiftCard.addEventListener("click", () => {
  giftScreen.classList.add("visible");
  giftScreen.setAttribute("aria-hidden", "false");

  giftFeedback.textContent = "";

  document.getElementById("giftName").focus();
});

function closeGiftScreen() {
  giftScreen.classList.remove("visible");
  giftScreen.setAttribute("aria-hidden", "true");
}

closeGiftScreenBtn.addEventListener("click", closeGiftScreen);

// Escape key closes the form.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" &&
      giftScreen.classList.contains("visible")) {
    closeGiftScreen();
  }
});


/* ========================================
   WISHLIST COLLECTION — V1
======================================== */

const wishlistScreen = document.getElementById("wishlistScreen");
const wishlistGrid = document.getElementById("wishlistGrid");
const wishlistEmpty = document.getElementById("wishlistEmpty");
const wishlistCount = document.getElementById("wishlistCount");

let activeOccasion = "All";
let editingGiftId = null;

/* ========================================
   SCREEN NAVIGATION
======================================== */

function openWishlist() {
  dashboardScreen.classList.remove("visible");
  dashboardScreen.setAttribute("aria-hidden", "true");

  wishlistScreen.classList.add("visible");
  wishlistScreen.setAttribute("aria-hidden", "false");

  renderWishlist();
}

function closeWishlist() {
  wishlistScreen.classList.remove("visible");
  wishlistScreen.setAttribute("aria-hidden", "true");

  dashboardScreen.classList.add("visible");
  dashboardScreen.setAttribute("aria-hidden", "false");
}

document.getElementById("wishlistCard")
  .addEventListener("click", openWishlist);

document.getElementById("wishlistBack")
  .addEventListener("click", closeWishlist);

/* ========================================
   ADD GIFT FROM WISHLIST
======================================== */

function openNewGiftForm() {
  editingGiftId = null;

  giftForm.reset();
  giftFeedback.textContent = "";

  giftScreen.classList.add("visible");
  giftScreen.setAttribute("aria-hidden", "false");

  document.getElementById("giftName").focus();
}

document.getElementById("wishlistAdd")
  .addEventListener("click", openNewGiftForm);

document.getElementById("emptyAddGift")
  .addEventListener("click", openNewGiftForm);

// Reset edit mode when Add Gift is clicked
// from Mission Control.
addGiftCard.addEventListener("click", () => {
  editingGiftId = null;
  giftForm.reset();
});

/* ========================================
   SAFE URL HELPER
======================================== */

function validWebUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

/* ========================================
   CREATE CARD ELEMENT
======================================== */

function createGiftCard(gift) {
  const card = document.createElement("article");
  card.className = "wish-card";

  const imageBox = document.createElement("div");
  imageBox.className = "wish-image";

  const imageUrl = validWebUrl(gift.image);

  if (imageUrl) {
    const image = document.createElement("img");

    image.src = imageUrl;
    image.alt = gift.name;
    image.loading = "lazy";

    image.onerror = () => {
      image.remove();

      const placeholder = document.createElement("span");
      placeholder.className = "wish-placeholder";
      placeholder.textContent = "✧";

      imageBox.appendChild(placeholder);
    };

    imageBox.appendChild(image);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "wish-placeholder";
    placeholder.textContent = "✧";

    imageBox.appendChild(placeholder);
  }

  const details = document.createElement("div");
  details.className = "wish-details";

  const occasion = document.createElement("span");
  occasion.className = "wish-occasion";
  occasion.textContent = gift.occasion || "Anytime";

  const name = document.createElement("h3");
  name.className = "wish-name";
  name.textContent = gift.name;

  details.append(occasion, name);

  if (gift.price) {
    const price = document.createElement("div");
    price.className = "wish-price";
    price.textContent = gift.price;

    details.appendChild(price);
  }

  if (gift.notes) {
    const notes = document.createElement("p");
    notes.className = "wish-notes";
    notes.textContent = gift.notes;

    details.appendChild(notes);
  }

  const actions = document.createElement("div");
  actions.className = "wish-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "wish-edit";
  editButton.textContent = "✎ Edit";

  editButton.addEventListener("click", () => {
    editGift(gift.id);
  });

  actions.appendChild(editButton);

  const storeUrl = validWebUrl(gift.link);

  if (storeUrl) {
    const storeLink = document.createElement("a");

    storeLink.className = "wish-store";
    storeLink.href = storeUrl;
    storeLink.target = "_blank";
    storeLink.rel = "noopener noreferrer";
    storeLink.textContent = "View Store ↗";

    actions.appendChild(storeLink);
  }

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.className = "wish-delete";
  deleteButton.textContent = "× Remove";

  deleteButton.addEventListener("click", () => {
    deleteGift(gift.id);
  });

  actions.appendChild(deleteButton);

  details.appendChild(actions);

  card.append(imageBox, details);

  return card;
}

/* ========================================
   RENDER WISHLIST
======================================== */

function renderWishlist() {
  wishlistGrid.replaceChildren();

  const filtered = savedGifts.filter((gift) => {
    return activeOccasion === "All" ||
      gift.occasion === activeOccasion;
  });

  wishlistCount.textContent =
    `${savedGifts.length} ${
      savedGifts.length === 1 ? "wish" : "wishes"
    } collected`;

  wishlistEmpty.classList.toggle(
    "visible",
    filtered.length === 0
  );

  filtered.forEach((gift) => {
    wishlistGrid.appendChild(createGiftCard(gift));
  });
}

/* ========================================
   OCCASION FILTERS
======================================== */

document.querySelectorAll(".wish-filter").forEach((button) => {
  button.addEventListener("click", () => {
    activeOccasion = button.dataset.occasion;

    document.querySelectorAll(".wish-filter").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderWishlist();
  });
});

/* ========================================
   EDIT AN EXISTING GIFT
======================================== */

function editGift(id) {
  const gift = savedGifts.find((item) => item.id === id);

  if (!gift) return;

  editingGiftId = id;

  document.getElementById("giftName").value = gift.name || "";
  document.getElementById("giftLink").value = gift.link || "";
  document.getElementById("giftOccasion").value = gift.occasion || "Anytime";
  document.getElementById("giftPrice").value = gift.price || "";
  document.getElementById("giftNotes").value = gift.notes || "";

  giftFeedback.textContent = "";

  giftScreen.classList.add("visible");
  giftScreen.setAttribute("aria-hidden", "false");

  document.getElementById("giftName").focus();
}

/* ========================================
   SAVE OR UPDATE A GIFT
======================================== */


giftForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = giftForm.querySelector(
    'button[type="submit"]'
  );

  if (submitButton.disabled) return;

  const name = document.getElementById("giftName").value.trim();
  const link = document.getElementById("giftLink").value.trim();
  const occasion = document.getElementById("giftOccasion").value;
  const price = document.getElementById("giftPrice").value.trim();
  const notes = document.getElementById("giftNotes").value.trim();

  if (!name) {
    giftFeedback.textContent = "Please enter a gift name.";
    return;
  }

  if (link && !validWebUrl(link)) {
    giftFeedback.textContent = "Please enter a valid product link.";
    return;
  }

  const existing = savedGifts.find(
    item => item.id === editingGiftId
  );

  const gift = {
    id: existing?.id || crypto.randomUUID(),
    name,
    link,
    occasion,
    price,
    notes,
    createdAt: existing?.createdAt || new Date().toISOString()
  };

  submitButton.disabled = true;
  giftFeedback.textContent = "Saving your wish...";

  try {
    if (!editingGiftId) {
      // New gifts are submitted to the shared database.
      await sendGiftToSupabase(gift);
    }

    const updated = editingGiftId
      ? savedGifts.map(item =>
          item.id === editingGiftId ? gift : item
        )
      : [...savedGifts, gift];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    savedGifts = updated;
    editingGiftId = null;

    renderWishlist();
    giftForm.reset();

    giftFeedback.textContent = existing
      ? "Updated locally. Cloud sync is coming next."
      : "Wish saved successfully! ✨";

    setTimeout(() => {
      closeGiftScreen();
    }, 1200);

  } catch (error) {
    console.error("Gift save error:", error);

    giftFeedback.textContent =
      "Couldn't complete the save. Please try again.";

  } finally {
    submitButton.disabled = false;
  }
});


/* ========================================
   DELETE A GIFT
======================================== */

function deleteGift(id) {
  const gift = savedGifts.find((item) => item.id === id);

  if (!gift) return;

  const confirmed = window.confirm(
    `Remove "${gift.name}" from your wishlist?`
  );

  if (!confirmed) return;

  const updated = savedGifts.filter(
    (item) => item.id !== id
  );

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    savedGifts = updated;
    renderWishlist();
  } catch {
    alert("Couldn't remove the gift. Please try again.");
  }
}


/* ========================================
   ASTRONAUT COMPANION
======================================== */
const companionMessages = [
  "Houston, we have a wishlist.",
  "Please stop exploding the moons.",
  "I was promised snacks.",
  "Bob, your mission awaits.",
  "I've been lost for 3 business days.",
  "Does anyone know where Earth is?",
  "This was NOT in my job description.",
  "Just floating by. Don't mind me."
];

const companionReplies = [
  "HEY! Personal space!",
  "Oh, hello there!",
  "Do you have any snacks?",
  "I'm technically on a coffee break.",
  "Please don't launch me into the screen again."
];

const companion = document.createElement("div");
companion.className = "astronaut-companion";
companion.setAttribute("aria-label", "Floating astronaut companion");
companion.setAttribute("role", "button");
companion.setAttribute("tabindex", "0");

const companionSvg = document.querySelector("#astronaut svg").cloneNode(true);
const companionMessage = document.createElement("div");
companionMessage.className = "astronaut-message";

companion.append(companionSvg, companionMessage);
document.body.appendChild(companion);

let companionAnimation = null;
let companionBusy = false;
let companionReplyTimer = null;

function randomCompanionMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}




/* ========================================
   ASTRONAUT ADVENTURES
======================================== */
const astronautCargo = [
  { symbol: "🍕", message: "Emergency pizza delivery!" },
  { symbol: "🎁", message: "Special delivery for Bob!" },
  { symbol: "🚩", message: "I claim this galaxy!" },
  { symbol: "HELP", message: "I'M FINE. EVERYTHING IS FINE." },
  { symbol: "🍪", message: "These are my emergency supplies." },
  { symbol: "🧸", message: "Found this floating near Jupiter." }
];

const companionCargo = document.createElement("span");
companionCargo.className = "astronaut-cargo";
companion.appendChild(companionCargo);

function setCompanionCargo() {
  const hasCargo = Math.random() < 0.65;
  companionCargo.classList.remove("help-sign");

  if (!hasCargo) {
    companionCargo.textContent = "";
    companionMessage.textContent = randomCompanionMessage(companionMessages);
    return;
  }

  const item = astronautCargo[Math.floor(Math.random() * astronautCargo.length)];
  companionCargo.textContent = item.symbol;
  companionMessage.textContent = item.message;

  if (item.symbol === "HELP") {
    companionCargo.classList.add("help-sign");
  }
}

function getCompanionRoute(startX, endX, startY, endY, mode) {
  const direction = Math.random() > 0.5 ? 1 : -1;
  const rotation = (Math.random() > 0.5 ? 720 : 360) * direction;
  const x = (progress) => startX + (endX - startX) * progress;

  // MODE 1: Normal tumbling flight.
  if (mode === 0) {
    return [
      { transform: `translate(${startX}px, ${startY}px) rotate(0deg)`, offset: 0 },
      { transform: `translate(${x(0.3)}px, ${startY - 50}px) rotate(${rotation * 0.3}deg)`, offset: 0.3 },
      { transform: `translate(${x(0.65)}px, ${startY + 45}px) rotate(${rotation * 0.65}deg)`, offset: 0.65 },
      { transform: `translate(${endX}px, ${endY}px) rotate(${rotation}deg)`, offset: 1 }
    ];
  }

  // MODE 2: Jetpack malfunction.
  if (mode === 1) {
    return [
      { transform: `translate(${startX}px, ${startY}px) rotate(0deg)`, offset: 0 },
      { transform: `translate(${x(0.45)}px, ${startY - 30}px) rotate(90deg)`, offset: 0.35 },
      { transform: `translate(${x(0.2)}px, ${startY + 90}px) rotate(450deg)`, offset: 0.55 },
      { transform: `translate(${x(0.7)}px, ${endY - 65}px) rotate(620deg)`, offset: 0.8 },
      { transform: `translate(${endX}px, ${endY}px) rotate(720deg)`, offset: 1 }
    ];
  }

  // MODE 3: Get caught in the blue planet's gravity.
  const planetRect = document.querySelector("#planetSystem .planet").getBoundingClientRect();
  const planetX = planetRect.left + planetRect.width / 2;
  const planetY = planetRect.top + planetRect.height / 2;
  const radius = planetRect.width * 0.75;
  const width = companion.offsetWidth;
  const height = companion.offsetHeight;

  const orbitPoint = (angle) => ({
    x: planetX + Math.cos(angle) * radius - width / 2,
    y: planetY + Math.sin(angle) * radius - height / 2
  });

  const angles = [-2.6, -1.6, -0.5, 0.6, 1.7, 2.8, 3.9];
  const points = angles.map(orbitPoint);

  return [
    { transform: `translate(${startX}px, ${startY}px) rotate(0deg)`, offset: 0 },
    ...points.map((point, index) => ({
      transform: `translate(${point.x}px, ${point.y}px) rotate(${(index + 1) * 65}deg)`,
      offset: 0.22 + index * 0.095
    })),
    { transform: `translate(${endX}px, ${endY}px) rotate(540deg)`, offset: 1 }
  ];
}

function showCompanion() {
  if (currentScreen !== "intro" || companionBusy) return;

  companionBusy = true;
  companion.classList.remove("jetpack-active", "jetpack-malfunction", "reacting");
  setCompanionCargo();

  const fromLeft = Math.random() > 0.5;
  const startX = fromLeft ? -150 : window.innerWidth + 150;
  const endX = fromLeft ? window.innerWidth + 150 : -150;
  const startY = Math.max(110, window.innerHeight * (0.12 + Math.random() * 0.12));
  const endY = Math.max(110, startY + (Math.random() - 0.5) * 200);

  // Three possible adventures.
  let mode = Math.floor(Math.random() * 3);

  // Avoid planet encounters when the planet is mostly off-screen.
  const planetRect = document.querySelector("#planetSystem .planet").getBoundingClientRect();
  const planetVisible =
    planetRect.right > 100 &&
    planetRect.left < window.innerWidth - 100;

  if (mode === 2 && !planetVisible) mode = 0;

  const flightMessages = [
    null,
    "Everything is under contro— OH NO!",
    "Why am I getting closer to that planet?!"
  ];

  if (mode !== 0) {
    companionMessage.textContent = flightMessages[mode];
  }

  const route = getCompanionRoute(startX, endX, startY, endY, mode);
  const duration = mode === 2 ? 22000 : 15000 + Math.random() * 5000;

  companion.classList.add("active");
  companionAnimation = companion.animate(route, {
    duration,
    easing: "linear",
    fill: "forwards"
  });

  const jetpackInterval = setInterval(() => {
    if (!companionAnimation || currentScreen !== "intro") {
      clearInterval(jetpackInterval);
      companion.classList.remove("jetpack-active", "jetpack-malfunction");
      return;
    }

    if (companionAnimation.playState !== "running") return;

    const malfunction = mode === 1 &&
      companionAnimation.currentTime > duration * 0.35 &&
      companionAnimation.currentTime < duration * 0.75;

    companion.classList.toggle("jetpack-malfunction", malfunction);
    companion.classList.add("jetpack-active");

    setTimeout(() => {
      companion.classList.remove("jetpack-active");
    }, 450 + Math.random() * 450);
  }, 1800);

  companionAnimation.onfinish = () => {
    clearInterval(jetpackInterval);
    companion.classList.remove(
      "active",
      "jetpack-active",
      "jetpack-malfunction",
      "reacting"
    );
    companionAnimation = null;
    companionBusy = false;
  };
}

function interactWithCompanion() {
  if (!companionAnimation || currentScreen !== "intro") return;

  companionAnimation.pause();
  clearTimeout(companionReplyTimer);

  companion.classList.remove("jetpack-active");
  companion.classList.remove("reacting");

  // Restart the wobble animation.
  void companion.offsetWidth;
  companion.classList.add("reacting");

  companionMessage.textContent = randomCompanionMessage(companionReplies);

  companionReplyTimer = setTimeout(() => {
    if (!companionAnimation) return;

    companion.classList.remove("reacting");
    companionMessage.textContent = randomCompanionMessage(companionMessages);
    companionAnimation.play();
  }, 2400);
}


companion.addEventListener("click", interactWithCompanion);

companion.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    interactWithCompanion();
  }
});

// First appearance after 7 seconds.
setTimeout(showCompanion, 7000);

// Occasional return visits.
setInterval(() => {
  if (currentScreen === "intro" && !companionBusy) {
    showCompanion();
  }
}, 28000);


/* ========================================
   SUN & INTERACTIVE PLANETS
======================================== */
const distantSun = document.createElement("div");
distantSun.className = "distant-sun";
distantSun.setAttribute("aria-hidden", "true");
document.body.prepend(distantSun);

const saturnPlanet = document.getElementById("saturnWorld");
const volcanicPlanet = document.getElementById("volcanicWorld");

saturnPlanet.querySelector(".saturn-core").addEventListener("click", () => {
  if (currentScreen !== "intro") return;

  saturnPlanet.classList.remove("ring-pulse");
  void saturnPlanet.offsetWidth;
  saturnPlanet.classList.add("ring-pulse");

  setTimeout(() => {
    saturnPlanet.classList.remove("ring-pulse");
  }, 1200);
});

volcanicPlanet.querySelector(".volcanic-core").addEventListener("click", () => {
  if (currentScreen !== "intro") return;

  volcanicPlanet.classList.remove("erupting");
  void volcanicPlanet.offsetWidth;
  volcanicPlanet.classList.add("erupting");

  const size = volcanicPlanet.offsetWidth;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("span");
    particle.className = "volcanic-debris";
    particle.style.left = `${size / 2}px`;
    particle.style.top = `${size / 2}px`;

    volcanicPlanet.appendChild(particle);

    const angle = Math.random() * Math.PI * 2;
    const distance = 70 + Math.random() * 150;

    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    const animation = particle.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate(${x}px, ${y}px) scale(0.2)`,
          opacity: 0
        }
      ],
      {
        duration: 900 + Math.random() * 800,
        easing: "ease-out",
        fill: "forwards"
      }
    );

    animation.onfinish = () => particle.remove();
  }

  setTimeout(() => {
    volcanicPlanet.classList.remove("erupting");
  }, 1000);
});


/* ========================================
   ALIEN UFO VISITOR
======================================== */
const ufoMessages = [
  "We've traveled 4.2 billion light-years to inform you that you deserve presents.",
  "TAKE US TO YOUR WISHLIST.",
  "Earth is weird. We like it.",
  "Your gift requests have been approved by the Galactic Council.",
  "We came for the snacks.",
  "Please stop destroying the local moons.",
  "Human detected. Initiating friendship protocol.",
  "Our scanners indicate you need more gifts.",
  "Greetings, Bob. Your planet is very confusing."
];

const alienUfo = document.createElement("div");
alienUfo.className = "alien-ufo";
alienUfo.setAttribute("role", "button");
alienUfo.setAttribute("tabindex", "0");
alienUfo.setAttribute("aria-label", "Alien spaceship");

alienUfo.innerHTML = `
  <div class="ufo-beam"></div>
  <div class="ufo-message"></div>
  <svg viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="alienHull" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b4ccd1"/>
        <stop offset="55%" stop-color="#637b90"/>
        <stop offset="100%" stop-color="#263c51"/>
      </linearGradient>
      <radialGradient id="alienDome">
        <stop offset="0%" stop-color="#9bfff0"/>
        <stop offset="65%" stop-color="#40b8bb"/>
        <stop offset="100%" stop-color="#173e5c"/>
      </radialGradient>
    </defs>

    <ellipse cx="90" cy="72" rx="67" ry="22"
      fill="#111d2c" opacity="0.7"/>

    <path d="M49 62 Q48 20 90 18 Q132 20 131 62 Z"
      fill="url(#alienDome)"
      stroke="#a7fff0"
      stroke-width="2"/>

    <ellipse cx="90" cy="69" rx="81" ry="25"
      fill="url(#alienHull)"
      stroke="#c5e2e7"
      stroke-width="3"/>

    <ellipse cx="90" cy="79" rx="65" ry="12"
      fill="#233b49"/>

    <g fill="#72ffca">
      <circle cx="35" cy="76" r="5"/>
      <circle cx="59" cy="84" r="5"/>
      <circle cx="90" cy="88" r="5"/>
      <circle cx="121" cy="84" r="5"/>
      <circle cx="145" cy="76" r="5"/>
    </g>
  </svg>
`;

document.body.appendChild(alienUfo);

const ufoMessage = alienUfo.querySelector(".ufo-message");
let ufoAnimation = null;
let ufoBusy = false;
let ufoMessageTimer = null;

function showAlienUfo() {
  if (currentScreen !== "intro" || ufoBusy) return;

  ufoBusy = true;

  const fromLeft = Math.random() > 0.5;
  const startX = fromLeft ? -180 : window.innerWidth + 180;
  const endX = fromLeft ? window.innerWidth + 180 : -180;
  const startY = Math.max(150, window.innerHeight * (0.18 + Math.random() * 0.1));
  const endY = Math.max(150, startY + (Math.random() - 0.5) * 150);

  alienUfo.classList.add("active");

  ufoAnimation = alienUfo.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) rotate(-5deg)`, offset: 0 },
      { transform: `translate(${(startX + endX) * 0.35}px, ${startY - 25}px) rotate(6deg)`, offset: 0.35 },
      { transform: `translate(${(startX + endX) * 0.7}px, ${endY + 20}px) rotate(-4deg)`, offset: 0.7 },
      { transform: `translate(${endX}px, ${endY}px) rotate(3deg)`, offset: 1 }
    ],
    {
      duration: 14000,
      easing: "linear",
      fill: "forwards"
    }
  );

  ufoAnimation.onfinish = () => {
    alienUfo.classList.remove("active", "communicating");
    ufoAnimation = null;
    ufoBusy = false;
  };
}

function communicateWithUfo() {
  if (!ufoAnimation || currentScreen !== "intro") return;

  ufoAnimation.pause();
  clearTimeout(ufoMessageTimer);

  ufoMessage.textContent =
    ufoMessages[Math.floor(Math.random() * ufoMessages.length)];

  alienUfo.classList.add("communicating");

  ufoMessageTimer = setTimeout(() => {
    alienUfo.classList.remove("communicating");
    ufoAnimation?.play();
  }, 3500);
}

alienUfo.addEventListener("click", communicateWithUfo);

alienUfo.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    communicateWithUfo();
  }
});

setTimeout(showAlienUfo, 12000);

setInterval(() => {
  if (currentScreen === "intro" && !ufoBusy) {
    showAlienUfo();
  }
}, 35000);

/* ========================================
   SECRET HEART CONSTELLATION
======================================== */
const constellation = document.createElement("div");
const constellationSvg = document.createElementNS(
  "http://www.w3.org/2000/svg", "svg"
);

// Aries — The Ram
// Simplified arrangement of four recognizable stars.
const constellationPoints = [
  [42, 150],  // Mesarthim
  [72, 139],  // Sheratan
  [125, 95],  // Hamal
  [186, 58]   // Botein
];

const constellationConnections = [
  [0, 1],
  [1, 2],
  [2, 3]
];

const discoveredStars = new Set();
const constellationLines = [];

constellation.className = "secret-constellation";
constellationSvg.classList.add("constellation-lines");
constellationSvg.setAttribute("viewBox", "0 0 220 210");

constellationConnections.forEach(([start, end]) => {
  const line = document.createElementNS(
    "http://www.w3.org/2000/svg", "line"
  );

  line.setAttribute("x1", constellationPoints[start][0]);
  line.setAttribute("y1", constellationPoints[start][1]);
  line.setAttribute("x2", constellationPoints[end][0]);
  line.setAttribute("y2", constellationPoints[end][1]);

  constellationSvg.appendChild(line);
  constellationLines.push({ line, start, end });
});

constellation.appendChild(constellationSvg);

function discoverStar(index, button) {
  if (currentScreen !== "intro" || discoveredStars.has(index)) return;

  discoveredStars.add(index);
  button.classList.add("discovered");
  button.setAttribute("aria-pressed", "true");

  constellationLines.forEach(({ line, start, end }) => {
    if (discoveredStars.has(start) && discoveredStars.has(end)) {
      line.classList.add("revealed");
    }
  });

  if (discoveredStars.size === constellationPoints.length) {
    const message = document.createElement("div");
    message.className = "constellation-complete";
    message.textContent = "♈ Aries — April 6. Written in the stars, just for you. ✦";
    constellation.appendChild(message);
  }
}

constellationPoints.forEach(([x, y], index) => {
  const star = document.createElement("button");
  star.type = "button";
  star.className = "constellation-star";
  star.style.left = `${(x / 220) * 100}%`;
  star.style.top = `${(y / 210) * 100}%`;
  star.setAttribute("aria-label", `Discover secret star ${index + 1}`);
  star.setAttribute("aria-pressed", "false");

  star.addEventListener("mouseenter", () => discoverStar(index, star));
  star.addEventListener("focus", () => discoverStar(index, star));
  star.addEventListener("click", () => discoverStar(index, star));

  constellation.appendChild(star);
});

document.body.appendChild(constellation);