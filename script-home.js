// Version: 2026-0202-0300
import * as THREE from "https://esm.sh/three";
import { Pane } from "https://cdn.skypack.dev/tweakpane@4.0.4";

const createPreloader = () => {
  const container = document.querySelector(".circle-container");
  const progressBar = document.querySelector(".initializing-progress");
  const rings = 5;
  const allDots = [];
  // Create center dot first
  const centerDot = document.createElement("div");
  centerDot.className = "dot";
  centerDot.style.width = "8px";
  centerDot.style.height = "8px";
  centerDot.style.left = "calc(50% - 4px)";
  centerDot.style.top = "calc(50% - 4px)";
  centerDot.style.backgroundColor = "#10eab4";
  centerDot.style.animation = "pulse 1.5s infinite ease-in-out";
  centerDot.style.opacity = "1";
  container.appendChild(centerDot);
  // Create all dots for each ring
  for (let r = 0; r < rings; r++) {
    const radius = 15 + r * 20;
    const numDots = 6 + r * 6;
    // Calculate color based on ring (cyan inner to white outer)
    const cyanAmount = Math.max(0, 1 - r / (rings - 1));
    const colorR = Math.floor(16 + 239 * (1 - cyanAmount));
    const colorG = Math.floor(234 + 21 * (1 - cyanAmount));
    const colorB = Math.floor(180 + 75 * (1 - cyanAmount));
    const color = `rgb(${colorR}, ${colorG}, ${colorB})`;
    // Create dots in this ring
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      // Calculate position in a circle
      const angle = (i / numDots) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      // Set dot position and size (larger dots in outer rings)
      const size = 3 + r * 0.8;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `calc(50% + ${x}px - ${size / 2}px)`;
      dot.style.top = `calc(50% + ${y}px - ${size / 2}px)`;
      dot.style.backgroundColor = color;
      // All dots start invisible
      dot.style.opacity = "0";
      container.appendChild(dot);
      allDots.push({
        element: dot,
        ring: r,
        index: i,
        totalInRing: numDots
      });
    }
  }
  // Animation sequence
  const totalAnimationTime = 5000; // 5 seconds total animation
  const progressUpdateInterval = 50; // Update progress every 50ms
  let startTime = Date.now();
  // Start progress bar animation
  const updateProgress = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(100, (elapsed / totalAnimationTime) * 100);
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', Math.floor(progress));
    if (progress < 100) {
      setTimeout(updateProgress, progressUpdateInterval);
    }
  };
  // Start updating progress
  updateProgress();
  setTimeout(() => {
    // First phase: animate dots appearing from center outward
    let delay = 0;
    const delayIncrement = 20; // ms between dots
    // Sort dots by ring and then by index within ring
    allDots.sort((a, b) => {
      if (a.ring !== b.ring) return a.ring - b.ring;
      return a.index - b.index;
    });
    // Animate each dot with increasing delay
    allDots.forEach((dot, i) => {
      setTimeout(() => {
        dot.element.style.animation = "fadeIn 0.4s forwards ease-out";
      }, delay);
      delay += delayIncrement;
    });
    // Second phase: wait, then reverse the animation
    setTimeout(() => {
      // Hide center dot first
      centerDot.style.animation = "fadeOut 0.4s forwards ease-in";
      // Sort dots in reverse order (outside in)
      allDots.sort((a, b) => {
        if (a.ring !== b.ring) return b.ring - a.ring;
        return a.index - b.index;
      });
      // Animate dots disappearing
      let reverseDelay = 200; // Start after a small pause
      allDots.forEach((dot, i) => {
        setTimeout(() => {
          dot.element.style.animation = "fadeOut 0.4s forwards ease-in";
        }, reverseDelay);
        reverseDelay += delayIncrement;
      });
      // Final phase: complete preloader and show main content
      setTimeout(() => {
        const preloader = document.querySelector(".preloader");
        const mainElements = document.querySelectorAll(
          "#canvas, .particles, #titles-container, footer"
        );
        // Fade in main content
        mainElements.forEach((el) => {
          el.style.opacity = "1";
        });
        // Fade out preloader
        preloader.style.opacity = "0";
        preloader.style.transition =
          "opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1)";
        setTimeout(() => {
          preloader.style.display = "none";
          preloader.setAttribute('aria-hidden', 'true');
        }, 800);
      }, reverseDelay + 250); // Wait for reverse animation to complete
    }, delay + 750); // Wait for all dots to appear
  }, 750); // Initial delay before starting the sequence
  return allDots;
};
// Run preloader creation immediately
createPreloader();
// Create ambient particles.
const particlesContainer = document.getElementById("particles");
const particleCount = 80;
for (let i = 0; i < particleCount; i++) {
  const particle = document.createElement("div");
  particle.className = "particle";
  const size = Math.random() * 5 + 2;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  particle.style.left = `${x}%`;
  particle.style.top = `${y}%`;
  particle.style.opacity = Math.random() * 0.5 + 0.1;
  particlesContainer.appendChild(particle);
}
const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000);
scene.fog = new THREE.FogExp2(0x000, 0.08);
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5;
// Lights.
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);
// --- Slides and Global Settings ---
const slideWidth = 3.2;
const slideHeight = 1.8;
const gap = 0.25;
const slideCount = 4; // Changed from 10 to 4
const imagesCount = 4; // Changed from 5 to 4
const totalWidth = slideCount * (slideWidth + gap);
const slideUnit = slideWidth + gap;

const settings = {
  wheelSensitivity: 0.01,
  touchSensitivity: 0.01,
  momentumMultiplier: 2.5,
  smoothing: 0.1,
  slideLerp: 0.075,
  distortionDecay: 0.93,
  maxDistortion: 4.0,
  distortionSensitivity: 0.25,
  distortionSmoothing: 0.075,
  rotationFactor: 0.2,
  animationSpeed: 0.5,
  textFadeStart: slideWidth / 2,
  textFadeEnd: slideWidth / 2 + 0.5,
  textMaxBlur: 5,
  distortionIntensity: 0.3,
  horizontalDistortionDamping: 0.3,
  momentumDistortionBoost: 0.3,
  directionInfluence: 0.4,
  waveAmplitudeBoost: 0.2,
  directionChangeThreshold: 0.02,
  directionSmoothing: 0.03
};

// Slide data with updated titles and descriptions
const slideData = [
  {
    title: "IN BETWEEN",
    number: "01",
    description: "where things are still forming",
    link: "#"
  },
  {
    title: "BEAUTIFUL WORLD",
    number: "02",
    description: "in the uneven<br>the broken<br>the overlooked",
    link: "#"
  },
  {
    title: "FILMS",
    number: "03",
    description: "shaping me<br>slowly and quietly",
    link: "#"
  },
  {
    title: "THE MUZIK",
    number: "04",
    description: "to silence<br>to space<br>to what's unsaid",
    link: "#"
  }
];

// Create title elements
const titlesContainer = document.getElementById("titles-container");
const titleElements = [];
slideData.forEach((data, i) => {
  const titleDiv = document.createElement("div");
  titleDiv.className = "slide-title";
  titleDiv.setAttribute('role', 'heading');
  titleDiv.setAttribute('aria-level', '2');
  
  const titleText = document.createElement("h2");
  titleText.className = "title-text";
  titleText.textContent = data.title;
  
  const titleNumber = document.createElement("p");
  titleNumber.className = "title-number";
  titleNumber.textContent = data.number;
  
  const descriptionText = document.createElement("p");
  descriptionText.className = "description-text";
  const descriptionLink = document.createElement("a");
  descriptionLink.href = data.link;
  descriptionLink.innerHTML = data.description;
  descriptionLink.setAttribute('aria-label', `${data.title} - ${data.description.replace(/<br>/g, ' ')}`);
  descriptionText.appendChild(descriptionLink);
  
  titleDiv.appendChild(titleText);
  titleDiv.appendChild(titleNumber);
  titleDiv.appendChild(descriptionText);
  titlesContainer.appendChild(titleDiv);
  
  titleElements.push({
    element: titleDiv,
    textElement: titleText,
    numberElement: titleNumber,
    descriptionElement: descriptionText
  });
});

const textureLoader = new THREE.TextureLoader();
const slides = [];
const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
pointLight.position.set(0, 0, 3);
scene.add(pointLight);

// Distortion vertex shader
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uDistortion;
  uniform float uTime;
  uniform vec2 uDistortionDirection;
  uniform float uDirectionalInfluence;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    
    float wave = sin(position.x * 3.0 + uTime * 2.0) * 0.5 + 0.5;
    float distortAmount = uDistortion * wave * 0.15;
    
    float directionX = uDistortionDirection.x * uDirectionalInfluence;
    float directionY = uDistortionDirection.y * uDirectionalInfluence * 0.5;
    
    pos.x += sin(position.y * 4.0 + uTime * 3.0) * distortAmount * (1.0 + directionX);
    pos.y += cos(position.x * 4.0 + uTime * 2.5) * distortAmount * (1.0 + directionY);
    pos.z += sin(position.x * 2.0 + position.y * 2.0 + uTime) * distortAmount * 0.5;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment shader
const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uDistortion;
  
  void main() {
    vec2 uv = vUv;
    
    float distortionEffect = uDistortion * 0.02;
    uv.x += sin(vUv.y * 10.0) * distortionEffect;
    uv.y += cos(vUv.x * 10.0) * distortionEffect;
    
    vec4 color = texture2D(uTexture, uv);
    
    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x) *
                     smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    color.a *= edgeFade;
    
    gl_FragColor = color;
  }
`;

// Load images and create slides (only 4 images now)
for (let i = 0; i < slideCount; i++) {
  const imageIndex = (i % imagesCount) + 1;
  const imagePath = `image-0/0${imageIndex}.webp`;
  
  const texture = textureLoader.load(
    imagePath,
    (loadedTexture) => {
      loadedTexture.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.error(`Error loading texture: ${imagePath}`, error);
    }
  );
  
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  const geometry = new THREE.PlaneGeometry(slideWidth, slideHeight, 32, 32);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTexture: { value: texture },
      uDistortion: { value: 0.0 },
      uTime: { value: 0.0 },
      uDistortionDirection: { value: new THREE.Vector2(0, 0) },
      uDirectionalInfluence: { value: 0.0 }
    },
    transparent: true,
    side: THREE.DoubleSide
  });
  
  const slide = new THREE.Mesh(geometry, material);
  slide.userData = {
    targetX: 0,
    currentX: 0,
    currentRotation: 0,
    targetRotation: 0,
    index: i,
    currentDistortion: 0
  };
  
  slides.push(slide);
  scene.add(slide);
}

let currentPosition = 0;
let targetPosition = 0;
let isScrolling = false;
let autoScrollSpeed = 0;
let touchStartX = 0;
let touchLastX = 0;
let currentDistortionFactor = 0;
let targetDistortionFactor = 0;
let globalTime = 0;
let lastTime = 0;
let velocityHistory = [0, 0, 0, 0, 0];
let peakVelocity = 0;
let lastDeltaX = 0;
let movementDirection = { x: 0, y: 0 };
let smoothedDirection = { x: 0, y: 0 };
let accumulatedMovement = 0;
let lastMovementInput = 0;

const updateDistortion = (slide, factor, deltaTime) => {
  const distortionTarget = factor * settings.distortionIntensity;
  slide.userData.currentDistortion +=
    (distortionTarget - slide.userData.currentDistortion) *
    settings.distortionSmoothing;
  slide.material.uniforms.uDistortion.value = slide.userData.currentDistortion;
  slide.material.uniforms.uTime.value = globalTime * settings.animationSpeed;
  const horizontalDir =
    smoothedDirection.x * settings.horizontalDistortionDamping;
  const verticalDir = smoothedDirection.y;
  slide.material.uniforms.uDistortionDirection.value.set(
    horizontalDir,
    verticalDir
  );
  const directionalStrength = Math.min(
    1.0,
    Math.sqrt(horizontalDir * horizontalDir + verticalDir * verticalDir)
  );
  slide.material.uniforms.uDirectionalInfluence.value = directionalStrength;
  const rotationAmount =
    slide.userData.currentDistortion * settings.rotationFactor * 0.05;
  slide.userData.targetRotation = rotationAmount * smoothedDirection.x;
  slide.userData.currentRotation +=
    (slide.userData.targetRotation - slide.userData.currentRotation) * 0.1;
  slide.rotation.z = slide.userData.currentRotation;
  slide.rotation.y = slide.userData.currentRotation * 0.3;
};

const updateTitlePositions = () => {
  slides.forEach((slide, i) => {
    const slideScreenPos = new THREE.Vector3(
      slide.position.x,
      slide.position.y,
      slide.position.z
    );
    slideScreenPos.project(camera);
    const x = (slideScreenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(slideScreenPos.y * 0.5) + 0.5) * window.innerHeight;
    const titleData = titleElements[i % titleElements.length];
    titleData.element.style.left = `${x}px`;
    titleData.element.style.top = `${y}px`;
    titleData.element.style.transform = `translate(-50%, -50%)`;
    const distanceFromCenter = Math.abs(slide.position.x);
    const fadeStart = settings.textFadeStart;
    const fadeEnd = settings.textFadeEnd;
    let opacity = 1;
    let blur = 0;
    if (distanceFromCenter > fadeStart) {
      const fadeProgress = Math.min(
        1,
        (distanceFromCenter - fadeStart) / (fadeEnd - fadeStart)
      );
      opacity = 1 - fadeProgress;
      blur = fadeProgress * settings.textMaxBlur;
    }
    titleData.element.style.opacity = opacity;
    titleData.element.style.filter = `blur(${blur}px)`;
  });
};

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    targetPosition += slideUnit;
    targetDistortionFactor = Math.min(1.0, targetDistortionFactor + 0.4);
    movementDirection.x = 1;
  } else if (e.key === "ArrowRight") {
    targetPosition -= slideUnit;
    targetDistortionFactor = Math.min(1.0, targetDistortionFactor + 0.4);
    movementDirection.x = -1;
  }
});

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const wheelStrength = Math.abs(e.deltaY) * 0.001;
    targetDistortionFactor = Math.min(
      1.0,
      targetDistortionFactor + wheelStrength
    );
    targetPosition -= e.deltaY * settings.wheelSensitivity;
    isScrolling = true;
    autoScrollSpeed =
      Math.min(Math.abs(e.deltaY) * 0.0005, 0.05) * Math.sign(e.deltaY);
    movementDirection.x = Math.sign(e.deltaY) * -1;
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  },
  {
    passive: false
  }
);

window.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchLastX = touchStartX;
    isScrolling = false;
  },
  {
    passive: false
  }
);

window.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchLastX;
    lastDeltaX = deltaX;
    accumulatedMovement += deltaX;
    const now = performance.now();
    const timeDelta = now - lastMovementInput;
    if (Math.abs(accumulatedMovement) > 1 || timeDelta > 50) {
      touchLastX = touchX;
      const touchStrength = Math.abs(accumulatedMovement) * 0.02;
      targetDistortionFactor = Math.min(
        1.0,
        targetDistortionFactor + touchStrength
      );
      targetPosition -= accumulatedMovement * settings.touchSensitivity;
      accumulatedMovement = 0;
      lastMovementInput = now;
      isScrolling = true;
    }
  },
  {
    passive: false
  }
);

window.addEventListener("touchend", () => {
  const velocity = (touchLastX - touchStartX) * 0.005;
  if (Math.abs(velocity) > 0.5) {
    autoScrollSpeed = -velocity * settings.momentumMultiplier * 0.05;
    targetDistortionFactor = Math.min(
      1.0,
      Math.abs(velocity) * 3 * settings.distortionSensitivity
    );
    movementDirection.x = Math.sign(velocity) * -1;
    isScrolling = true;
    setTimeout(() => {
      isScrolling = false;
    }, 800);
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateTitlePositions();
});

const updateCamera = (time) => {
  const amplitude = 0;
  const frequency = 0.2;
  camera.position.y = Math.sin(time * frequency) * amplitude;
  camera.position.x = Math.cos(time * frequency * 0.7) * amplitude * 0.5;
  camera.lookAt(0, 0, 0);
};

const animate = (time) => {
  requestAnimationFrame(animate);
  const deltaTime = lastTime ? (time - lastTime) / 1000 : 0.016;
  lastTime = time;
  globalTime += deltaTime;
  pointLight.color.set(0xffffff);
  const prevPos = currentPosition;
  if (isScrolling) {
    targetPosition += autoScrollSpeed;
    const speedBasedDecay = 0.97 - Math.abs(autoScrollSpeed) * 0.5;
    autoScrollSpeed *= Math.max(0.92, speedBasedDecay);
    if (Math.abs(autoScrollSpeed) < 0.001) {
      autoScrollSpeed = 0;
    }
  }
  const positionDelta = Math.abs(targetPosition - currentPosition);
  const adaptiveSmoothing =
    settings.smoothing * (positionDelta < 0.1 ? 0.5 : 1.0);
  currentPosition += (targetPosition - currentPosition) * adaptiveSmoothing;
  const currentVelocity = Math.abs(currentPosition - prevPos) / deltaTime;
  const significantVelocity = currentVelocity > 0.01 ? currentVelocity : 0;
  velocityHistory.push(significantVelocity);
  velocityHistory.shift();
  const weights = [0.1, 0.15, 0.2, 0.25, 0.3];
  let weightSum = 0;
  let weightedVelocity = 0;
  for (let i = 0; i < velocityHistory.length; i++) {
    weightedVelocity += velocityHistory[i] * weights[i];
    weightSum += weights[i];
  }
  const avgVelocity = weightSum > 0 ? weightedVelocity / weightSum : 0;
  if (avgVelocity > peakVelocity) {
    peakVelocity += (avgVelocity - peakVelocity) * 0.3;
    const accelerationBoost = Math.min(0.1, avgVelocity * 0.03);
    targetDistortionFactor = Math.min(
      settings.maxDistortion,
      targetDistortionFactor + accelerationBoost
    );
  }
  const velocityRatio = avgVelocity / (peakVelocity + 0.001);
  const isDecelerating = velocityRatio < 0.7 && peakVelocity > 0.3;
  peakVelocity *= 0.98;
  const movementDistortion = Math.min(
    1.0,
    currentVelocity * currentVelocity * 2
  );
  if (currentVelocity > 0.03) {
    const blendFactor = Math.min(0.2, currentVelocity);
    targetDistortionFactor +=
      (movementDistortion - targetDistortionFactor) * blendFactor;
  }
  if (isDecelerating) {
    targetDistortionFactor *= settings.distortionDecay * 1.01;
  } else if (avgVelocity < 0.1) {
    targetDistortionFactor *= settings.distortionDecay * 0.9;
  }
  const distortionDelta = Math.abs(
    targetDistortionFactor - currentDistortionFactor
  );
  const adaptiveDistortionSmoothing =
    settings.distortionSmoothing * (distortionDelta < 0.05 ? 0.5 : 1.0);
  currentDistortionFactor +=
    (targetDistortionFactor - currentDistortionFactor) *
    adaptiveDistortionSmoothing;
  updateCamera(globalTime);
  slides.forEach((slide, i) => {
    let baseX = i * slideUnit - currentPosition;
    baseX = ((baseX % totalWidth) + totalWidth) % totalWidth;
    if (baseX > totalWidth / 2) {
      baseX -= totalWidth;
    }
    if (Math.abs(baseX - slide.userData.targetX) > slideWidth * 2) {
      slide.userData.currentX = baseX;
    }
    slide.userData.targetX = baseX;
    slide.userData.currentX +=
      (slide.userData.targetX - slide.userData.currentX) * settings.slideLerp;
    if (Math.abs(slide.userData.currentX) < totalWidth / 2 + slideWidth * 1.5) {
      slide.position.x = slide.userData.currentX;
      const distanceFromCenter = Math.abs(slide.position.x);
      slide.position.z = distanceFromCenter * -0.05;
      updateDistortion(slide, currentDistortionFactor, deltaTime);
    }
  });
  updateTitlePositions();
  renderer.render(scene, camera);
};
animate();