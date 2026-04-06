"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";

const CAMERA_HEIGHT = 1.7;
const LOOK_DISTANCE = 1;
const MOVE_SPEED = 4.6;
const ACTIVE_DISTANCE = 3.6;
const SHOWROOM_BOUNDS = {
  minX: -11.5,
  maxX: 11.5,
  minZ: -22,
  maxZ: 8,
};
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const MOVE_FORWARD = new THREE.Vector3();
const MOVE_RIGHT = new THREE.Vector3();
const MOVE_DIRECTION = new THREE.Vector3();
const SCALE_VECTOR = new THREE.Vector3();
const COLOR_ACTIVE = new THREE.Color("#bfe7ff");
const COLOR_IDLE = new THREE.Color("#ffffff");

function createCardTexture(card) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable for service card textures.");
  }

  const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(6, 18, 33, 0.96)");
  gradient.addColorStop(1, "rgba(10, 28, 46, 0.92)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "rgba(137, 208, 255, 0.26)";
  context.lineWidth = 10;
  context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  context.fillStyle = "rgba(139, 215, 255, 0.95)";
  context.font = "700 38px Arial";
  context.fillText(card.id.replace("service-", "Card ").toUpperCase(), 64, 88);

  context.fillStyle = "#f6fbff";
  context.font = "700 72px Arial";
  wrapText(context, card.title, 64, 180, 880, 84);

  context.fillStyle = "rgba(228, 239, 249, 0.88)";
  context.font = "400 38px Arial";
  wrapText(context, card.description, 64, 360, 880, 54);

  context.fillStyle = "rgba(216, 157, 66, 0.96)";
  context.font = "700 30px Arial";
  context.fillText("Click To Explore", 64, 560);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    const metrics = context.measureText(testLine);
    const isLastWord = index === words.length - 1;

    if (metrics.width > maxWidth && line) {
      context.fillText(line.trim(), x, cursorY);
      line = `${word} `;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }

    if (isLastWord) {
      context.fillText(line.trim(), x, cursorY);
    }
  });
}

function createServiceCard(card, index, anisotropy) {
  const row = Math.floor(index / 5);
  const column = index % 5;
  const x = -8 + column * 4;
  const z = -6 - row * 8;
  const y = CAMERA_HEIGHT + (row % 2 === 0 ? 0.05 : -0.05);

  const texture = createCardTexture(card);
  texture.anisotropy = anisotropy;

  const group = new THREE.Group();
  group.position.set(x, y, z);

  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fd6ff,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.05, 2.1), haloMaterial);
  haloMesh.position.z = -0.03;
  group.add(haloMesh);

  const cardMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const cardMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 1.8), cardMaterial);
  cardMesh.userData.card = card;
  group.add(cardMesh);

  return {
    card,
    group,
    cardMesh,
    haloMesh,
    texture,
    materials: [cardMaterial, haloMaterial],
    targetScale: 1,
  };
}

function updateCardFacing(cardEntries, camera) {
  for (const entry of cardEntries) {
    entry.group.lookAt(camera.position.x, entry.group.position.y, camera.position.z);
  }
}

function updateCardProximity(cardEntries, camera) {
  let nearestEntry = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const entry of cardEntries) {
    const distance = camera.position.distanceTo(entry.group.position);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestEntry = entry;
    }
  }

  for (const entry of cardEntries) {
    const isActive = entry === nearestEntry && nearestDistance <= ACTIVE_DISTANCE;
    const scaleTarget = isActive ? 1.08 : 1;
    const haloTarget = isActive ? 0.42 : 0.08;

    SCALE_VECTOR.setScalar(scaleTarget);
    entry.group.scale.lerp(SCALE_VECTOR, 0.08);
    entry.haloMesh.material.opacity = THREE.MathUtils.lerp(
      entry.haloMesh.material.opacity,
      haloTarget,
      0.1
    );
    entry.cardMesh.material.color.lerp(isActive ? COLOR_ACTIVE : COLOR_IDLE, 0.08);
  }
}

function handleMovement(camera, controls, movementState, delta) {
  camera.getWorldDirection(MOVE_FORWARD);
  MOVE_FORWARD.y = 0;

  if (MOVE_FORWARD.lengthSq() === 0) {
    MOVE_FORWARD.set(0, 0, -1);
  } else {
    MOVE_FORWARD.normalize();
  }

  MOVE_RIGHT.crossVectors(MOVE_FORWARD, WORLD_UP).normalize();
  MOVE_DIRECTION.set(0, 0, 0);

  if (movementState.forward) MOVE_DIRECTION.add(MOVE_FORWARD);
  if (movementState.backward) MOVE_DIRECTION.sub(MOVE_FORWARD);
  if (movementState.left) MOVE_DIRECTION.sub(MOVE_RIGHT);
  if (movementState.right) MOVE_DIRECTION.add(MOVE_RIGHT);

  if (MOVE_DIRECTION.lengthSq() === 0) {
    return;
  }

  MOVE_DIRECTION.normalize().multiplyScalar(MOVE_SPEED * delta);

  const previousTargetOffset = controls.target.clone().sub(camera.position);
  camera.position.add(MOVE_DIRECTION);

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, SHOWROOM_BOUNDS.minX, SHOWROOM_BOUNDS.maxX);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, SHOWROOM_BOUNDS.minZ, SHOWROOM_BOUNDS.maxZ);
  camera.position.y = CAMERA_HEIGHT;

  controls.target.copy(camera.position).add(previousTargetOffset);
}

function handleCardInteraction(event, renderer, camera, raycaster, cardEntries, onCardSelect) {
  const bounds = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
    -((event.clientY - bounds.top) / bounds.height) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cardEntries.map((entry) => entry.cardMesh), false);
  const selected = intersects[0]?.object?.userData?.card;

  if (!selected) return;

  console.log(`Clicked ${selected.title} (${selected.id})`);
  onCardSelect?.(selected);
}

export default function ServiceSkybox({ imageUrl, cards, onCardSelect }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const resetViewRef = useRef(null);

  const setMovement = (key, active) => {
    movementRef.current[key] = active;
  };

  const resetView = () => {
    resetViewRef.current?.();
  };

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      68,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, CAMERA_HEIGHT, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountNode.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, CAMERA_HEIGHT, 5);
    controls.rotateSpeed = -0.35;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.minPolarAngle = Math.PI * 0.28;
    controlsRef.current = controls;

    resetViewRef.current = () => {
      camera.position.set(0, CAMERA_HEIGHT, 6);
      controls.target.set(0, CAMERA_HEIGHT, 5);
      controls.update();
    };

    const raycaster = new THREE.Raycaster();
    const cardEntries = cards.map((card, index) =>
      createServiceCard(card, index, renderer.capabilities.getMaxAnisotropy())
    );
    cardEntries.forEach((entry) => scene.add(entry.group));

    const grid = new THREE.GridHelper(34, 34, 0x8fd6ff, 0x365168);
    grid.position.y = 0.05;
    grid.material.transparent = true;
    grid.material.opacity = 0.18;
    scene.add(grid);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    let environmentTexture = null;
    let animationFrameId = 0;
    let disposed = false;
    let pointerDown = null;
    const clock = new THREE.Clock();

    const exrLoader = new EXRLoader();
    exrLoader.load(
      imageUrl,
      (texture) => {
        if (disposed) return;

        texture.mapping = THREE.EquirectangularReflectionMapping;
        environmentTexture = texture;
        scene.background = texture;
        scene.environment = texture;

        const animate = () => {
          animationFrameId = window.requestAnimationFrame(animate);
          const delta = Math.min(clock.getDelta(), 0.05);

          handleMovement(camera, controls, movementRef.current, delta);
          updateCardFacing(cardEntries, camera);
          updateCardProximity(cardEntries, camera);
          controls.update();
          renderer.render(scene, camera);
        };

        animate();
      },
      undefined,
      (error) => {
        console.error("Failed to load service EXR environment:", error);
      }
    );

    const handleResize = () => {
      const { clientWidth, clientHeight } = mountNode;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const handleKeyDown = (event) => {
      if (event.repeat) return;

      if (event.key === "w" || event.key === "ArrowUp") setMovement("forward", true);
      if (event.key === "s" || event.key === "ArrowDown") setMovement("backward", true);
      if (event.key === "a" || event.key === "ArrowLeft") setMovement("left", true);
      if (event.key === "d" || event.key === "ArrowRight") setMovement("right", true);
    };

    const handleKeyUp = (event) => {
      if (event.key === "w" || event.key === "ArrowUp") setMovement("forward", false);
      if (event.key === "s" || event.key === "ArrowDown") setMovement("backward", false);
      if (event.key === "a" || event.key === "ArrowLeft") setMovement("left", false);
      if (event.key === "d" || event.key === "ArrowRight") setMovement("right", false);
    };

    const handlePointerDown = (event) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
      if (!pointerDown) return;

      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      pointerDown = null;

      if (Math.hypot(dx, dy) > 8) return;
      handleCardInteraction(event, renderer, camera, raycaster, cardEntries, onCardSelect);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      controls.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
      resetViewRef.current = null;

      cardEntries.forEach((entry) => {
        entry.cardMesh.geometry.dispose();
        entry.haloMesh.geometry.dispose();
        entry.materials.forEach((material) => material.dispose());
        entry.texture.dispose();
        scene.remove(entry.group);
      });

      grid.geometry.dispose();
      if (Array.isArray(grid.material)) {
        grid.material.forEach((material) => material.dispose());
      } else {
        grid.material.dispose();
      }
      environmentTexture?.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [cards, imageUrl, onCardSelect]);

  return (
    <div className="services-skybox">
      <div className="services-skybox__canvas" ref={mountRef} />

      <div className="services-instructions">
        <span className="services-instructions__title">3D Walkthrough</span>
        <p>Use W / A / S / D or the controls to move. Go near a card and click to interact.</p>
      </div>

      <div className="services-controls">
        <button
          type="button"
          className="services-controls__reset"
          onClick={resetView}
          aria-label="Reset view"
        >
          <RotateCcw size={16} />
        </button>

        <div className="services-controls__pad">
          <button
            type="button"
            className="services-controls__button services-controls__button--up"
            onMouseDown={() => setMovement("forward", true)}
            onMouseUp={() => setMovement("forward", false)}
            onMouseLeave={() => setMovement("forward", false)}
            onTouchStart={() => setMovement("forward", true)}
            onTouchEnd={() => setMovement("forward", false)}
            aria-label="Move forward"
          >
            <ChevronUp size={18} />
          </button>

          <button
            type="button"
            className="services-controls__button services-controls__button--left"
            onMouseDown={() => setMovement("left", true)}
            onMouseUp={() => setMovement("left", false)}
            onMouseLeave={() => setMovement("left", false)}
            onTouchStart={() => setMovement("left", true)}
            onTouchEnd={() => setMovement("left", false)}
            aria-label="Move left"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className="services-controls__button services-controls__button--right"
            onMouseDown={() => setMovement("right", true)}
            onMouseUp={() => setMovement("right", false)}
            onMouseLeave={() => setMovement("right", false)}
            onTouchStart={() => setMovement("right", true)}
            onTouchEnd={() => setMovement("right", false)}
            aria-label="Move right"
          >
            <ChevronRight size={18} />
          </button>

          <button
            type="button"
            className="services-controls__button services-controls__button--down"
            onMouseDown={() => setMovement("backward", true)}
            onMouseUp={() => setMovement("backward", false)}
            onMouseLeave={() => setMovement("backward", false)}
            onTouchStart={() => setMovement("backward", true)}
            onTouchEnd={() => setMovement("backward", false)}
            aria-label="Move backward"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
