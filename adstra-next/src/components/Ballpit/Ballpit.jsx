"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Clock,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  ShaderChunk,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

class ThreeWorld {
  #options;
  #postprocessing;
  #isVisible = false;
  #isRunning = false;
  #resizeObserver;
  #intersectionObserver;
  #resizeTimeout;
  #clock = new Clock();
  #elapsed = { elapsed: 0, delta: 0 };
  #animationFrame;

  canvas;
  camera;
  cameraMinAspect;
  cameraMaxAspect;
  cameraFov;
  maxPixelRatio;
  minPixelRatio;
  scene;
  renderer;
  size = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };
  onBeforeRender = () => {};
  onAfterRender = () => {};
  onAfterResize = () => {};
  isDisposed = false;

  constructor(options) {
    this.#options = { ...options };
    this.render = this.#renderScene;
    this.#createCamera();
    this.#createScene();
    this.#createRenderer();
    this.resize();
    this.#bindObservers();
    if (!document.hidden) {
      this.#start();
    }
  }

  #createCamera() {
    this.camera = new PerspectiveCamera();
    this.cameraFov = this.camera.fov;
  }

  #createScene() {
    this.scene = new Scene();
  }

  #createRenderer() {
    if (this.#options.canvas) {
      this.canvas = this.#options.canvas;
    } else if (this.#options.id) {
      this.canvas = document.getElementById(this.#options.id);
    } else {
      throw new Error("ThreeWorld: Missing canvas or id parameter");
    }

    this.canvas.style.display = "block";

    const rendererOptions = {
      powerPreference: "high-performance",
      ...(this.#options.rendererOptions ?? {}),
    };

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      ...rendererOptions,
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
  }

  #bindObservers() {
    if (!(this.#options.size instanceof Object)) {
      window.addEventListener("resize", this.#onResizeDebounced);

      if (this.#options.size === "parent" && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResizeDebounced);
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }

    this.#intersectionObserver = new IntersectionObserver(this.#handleIntersection, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });
    this.#intersectionObserver.observe(this.canvas);

    document.addEventListener("visibilitychange", this.#handleVisibility);
  }

  #removeObservers() {
    window.removeEventListener("resize", this.#onResizeDebounced);
    this.#resizeObserver?.disconnect();
    this.#intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.#handleVisibility);
  }

  #handleIntersection = (entries) => {
    this.#isVisible = entries[0].isIntersecting;
    this.#isVisible ? this.#start() : this.#stop();
  };

  #handleVisibility = () => {
    if (!this.#isVisible) return;
    document.hidden ? this.#stop() : this.#start();
  };

  #onResizeDebounced = () => {
    if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout);
    this.#resizeTimeout = setTimeout(() => this.resize(), 100);
  };

  resize() {
    let width;
    let height;

    if (this.#options.size instanceof Object) {
      width = this.#options.size.width;
      height = this.#options.size.height;
    } else if (this.#options.size === "parent" && this.canvas.parentNode) {
      width = this.canvas.parentNode.offsetWidth;
      height = this.canvas.parentNode.offsetHeight;
    } else {
      width = window.innerWidth;
      height = window.innerHeight;
    }

    this.size.width = width;
    this.size.height = height;
    this.size.ratio = width / height;

    this.#updateCamera();
    this.#updateRendererSize();
    this.onAfterResize(this.size);
  }

  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;

    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#fitCameraFov(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#fitCameraFov(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }

    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }

  #fitCameraFov(targetAspect) {
    const tangent =
      Math.tan(MathUtils.degToRad(this.cameraFov / 2)) /
      (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(tangent));
  }

  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovInRadians = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovInRadians / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    }
  }

  #updateRendererSize() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#postprocessing?.setSize(this.size.width, this.size.height);

    let pixelRatio = window.devicePixelRatio;
    if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
      pixelRatio = this.maxPixelRatio;
    } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
      pixelRatio = this.minPixelRatio;
    }

    this.renderer.setPixelRatio(pixelRatio);
    this.size.pixelRatio = pixelRatio;
  }

  get postprocessing() {
    return this.#postprocessing;
  }

  set postprocessing(postprocessing) {
    this.#postprocessing = postprocessing;
    this.render = postprocessing.render.bind(postprocessing);
  }

  #start() {
    if (this.#isRunning) return;

    const animate = () => {
      this.#animationFrame = requestAnimationFrame(animate);
      this.#elapsed.delta = this.#clock.getDelta();
      this.#elapsed.elapsed += this.#elapsed.delta;
      this.onBeforeRender(this.#elapsed);
      this.render();
      this.onAfterRender(this.#elapsed);
    };

    this.#isRunning = true;
    this.#clock.start();
    animate();
  }

  #stop() {
    if (!this.#isRunning) return;

    cancelAnimationFrame(this.#animationFrame);
    this.#isRunning = false;
    this.#clock.stop();
  }

  #renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  clear() {
    this.scene.traverse((node) => {
      if (!node.isMesh || typeof node.material !== "object" || node.material === null) {
        return;
      }

      Object.keys(node.material).forEach((key) => {
        const value = node.material[key];
        if (value && typeof value.dispose === "function") {
          value.dispose();
        }
      });

      node.material.dispose();
      node.geometry.dispose();
    });

    this.scene.clear();
  }

  dispose() {
    this.#removeObservers();
    this.#stop();
    this.clear();
    this.#postprocessing?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.isDisposed = true;
  }
}

const pointerRegistry = new Map();
const pointerPosition = new Vector2();
let pointerListenersMounted = false;

function createPointerTracker(options) {
  const tracker = {
    position: new Vector2(),
    nPosition: new Vector2(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...options,
  };

  const { domElement } = options;

  if (!pointerRegistry.has(domElement)) {
    pointerRegistry.set(domElement, tracker);

    if (!pointerListenersMounted) {
      document.body.addEventListener("pointermove", handlePointerMove);
      document.body.addEventListener("pointerleave", handlePointerLeave);
      document.body.addEventListener("click", handlePointerClick);
      document.body.addEventListener("touchstart", handleTouchStart, { passive: false });
      document.body.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.body.addEventListener("touchend", handleTouchEnd, { passive: false });
      document.body.addEventListener("touchcancel", handleTouchEnd, { passive: false });
      pointerListenersMounted = true;
    }
  }

  tracker.dispose = () => {
    pointerRegistry.delete(domElement);

    if (pointerRegistry.size === 0) {
      document.body.removeEventListener("pointermove", handlePointerMove);
      document.body.removeEventListener("pointerleave", handlePointerLeave);
      document.body.removeEventListener("click", handlePointerClick);
      document.body.removeEventListener("touchstart", handleTouchStart);
      document.body.removeEventListener("touchmove", handleTouchMove);
      document.body.removeEventListener("touchend", handleTouchEnd);
      document.body.removeEventListener("touchcancel", handleTouchEnd);
      pointerListenersMounted = false;
    }
  };

  return tracker;
}

function handlePointerMove(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;
  processPointerInteractions();
}

function processPointerInteractions() {
  for (const [element, tracker] of pointerRegistry) {
    const rect = element.getBoundingClientRect();

    if (isInsideRect(rect)) {
      updatePointerPosition(tracker, rect);
      if (!tracker.hover) {
        tracker.hover = true;
        tracker.onEnter(tracker);
      }
      tracker.onMove(tracker);
    } else if (tracker.hover && !tracker.touching) {
      tracker.hover = false;
      tracker.onLeave(tracker);
    }
  }
}

function handlePointerClick(event) {
  pointerPosition.x = event.clientX;
  pointerPosition.y = event.clientY;

  for (const [element, tracker] of pointerRegistry) {
    const rect = element.getBoundingClientRect();
    updatePointerPosition(tracker, rect);
    if (isInsideRect(rect)) tracker.onClick(tracker);
  }
}

function handlePointerLeave() {
  for (const tracker of pointerRegistry.values()) {
    if (!tracker.hover) continue;
    tracker.hover = false;
    tracker.onLeave(tracker);
  }
}

function handleTouchStart(event) {
  if (event.touches.length === 0) return;

  event.preventDefault();
  pointerPosition.x = event.touches[0].clientX;
  pointerPosition.y = event.touches[0].clientY;

  for (const [element, tracker] of pointerRegistry) {
    const rect = element.getBoundingClientRect();
    if (!isInsideRect(rect)) continue;

    tracker.touching = true;
    updatePointerPosition(tracker, rect);
    if (!tracker.hover) {
      tracker.hover = true;
      tracker.onEnter(tracker);
    }
    tracker.onMove(tracker);
  }
}

function handleTouchMove(event) {
  if (event.touches.length === 0) return;

  event.preventDefault();
  pointerPosition.x = event.touches[0].clientX;
  pointerPosition.y = event.touches[0].clientY;

  for (const [element, tracker] of pointerRegistry) {
    const rect = element.getBoundingClientRect();
    updatePointerPosition(tracker, rect);

    if (isInsideRect(rect)) {
      if (!tracker.hover) {
        tracker.hover = true;
        tracker.touching = true;
        tracker.onEnter(tracker);
      }
      tracker.onMove(tracker);
    } else if (tracker.hover && tracker.touching) {
      tracker.onMove(tracker);
    }
  }
}

function handleTouchEnd() {
  for (const tracker of pointerRegistry.values()) {
    if (!tracker.touching) continue;

    tracker.touching = false;
    if (tracker.hover) {
      tracker.hover = false;
      tracker.onLeave(tracker);
    }
  }
}

function updatePointerPosition(tracker, rect) {
  tracker.position.x = pointerPosition.x - rect.left;
  tracker.position.y = pointerPosition.y - rect.top;
  tracker.nPosition.x = (tracker.position.x / rect.width) * 2 - 1;
  tracker.nPosition.y = (-tracker.position.y / rect.height) * 2 + 1;
}

function isInsideRect(rect) {
  return (
    pointerPosition.x >= rect.left &&
    pointerPosition.x <= rect.left + rect.width &&
    pointerPosition.y >= rect.top &&
    pointerPosition.y <= rect.top + rect.height
  );
}

const tempPosition = new Vector3();
const tempOtherPosition = new Vector3();
const tempVelocity = new Vector3();
const tempOtherVelocity = new Vector3();
const collisionVector = new Vector3();
const collisionAdjustment = new Vector3();
const collisionVelocity = new Vector3();
const collisionOtherVelocity = new Vector3();
const cursorPosition = new Vector3();

class BallPhysics {
  constructor(config) {
    this.config = config;
    this.positionData = new Float32Array(config.count * 3).fill(0);
    this.velocityData = new Float32Array(config.count * 3).fill(0);
    this.sizeData = new Float32Array(config.count).fill(1);
    this.center = new Vector3();

    this.#seedPositions();
    this.setSizes();
  }

  #seedPositions() {
    const { config, positionData } = this;
    this.center.toArray(positionData, 0);

    for (let index = 1; index < config.count; index += 1) {
      const base = index * 3;
      positionData[base] = MathUtils.randFloatSpread(config.maxX * 2);
      positionData[base + 1] = MathUtils.randFloatSpread(config.maxY * 2);
      positionData[base + 2] = MathUtils.randFloatSpread(config.maxZ * 2);
    }
  }

  setSizes() {
    const { config, sizeData } = this;
    sizeData[0] = config.size0;

    for (let index = 1; index < config.count; index += 1) {
      sizeData[index] = MathUtils.randFloat(config.minSize, config.maxSize);
    }
  }

  update(frame) {
    const { config, positionData, velocityData, sizeData } = this;
    let startIndex = 0;

    if (config.controlSphere0) {
      startIndex = 1;
      tempPosition.fromArray(positionData, 0);
      tempPosition.lerp(this.center, 0.1).toArray(positionData, 0);
      tempVelocity.set(0, 0, 0).toArray(velocityData, 0);
    }

    for (let index = startIndex; index < config.count; index += 1) {
      const base = index * 3;
      tempPosition.fromArray(positionData, base);
      tempVelocity.fromArray(velocityData, base);
      tempVelocity.y -= frame.delta * config.gravity * sizeData[index];
      tempVelocity.multiplyScalar(config.friction);
      tempVelocity.clampLength(0, config.maxVelocity);
      tempPosition.add(tempVelocity);
      tempPosition.toArray(positionData, base);
      tempVelocity.toArray(velocityData, base);
    }

    for (let index = startIndex; index < config.count; index += 1) {
      const base = index * 3;
      tempPosition.fromArray(positionData, base);
      tempVelocity.fromArray(velocityData, base);
      const radius = sizeData[index];

      for (let otherIndex = index + 1; otherIndex < config.count; otherIndex += 1) {
        const otherBase = otherIndex * 3;
        tempOtherPosition.fromArray(positionData, otherBase);
        tempOtherVelocity.fromArray(velocityData, otherBase);
        const otherRadius = sizeData[otherIndex];

        collisionVector.copy(tempOtherPosition).sub(tempPosition);
        const distance = collisionVector.length();
        const minDistance = radius + otherRadius;

        if (distance >= minDistance) continue;

        const overlap = minDistance - distance;
        collisionAdjustment
          .copy(collisionVector)
          .normalize()
          .multiplyScalar(overlap * 0.5);

        collisionVelocity
          .copy(collisionAdjustment)
          .multiplyScalar(Math.max(tempVelocity.length(), 1));
        collisionOtherVelocity
          .copy(collisionAdjustment)
          .multiplyScalar(Math.max(tempOtherVelocity.length(), 1));

        tempPosition.sub(collisionAdjustment);
        tempVelocity.sub(collisionVelocity);
        tempPosition.toArray(positionData, base);
        tempVelocity.toArray(velocityData, base);

        tempOtherPosition.add(collisionAdjustment);
        tempOtherVelocity.add(collisionOtherVelocity);
        tempOtherPosition.toArray(positionData, otherBase);
        tempOtherVelocity.toArray(velocityData, otherBase);
      }

      if (config.controlSphere0) {
        collisionVector.copy(cursorPosition).sub(tempPosition);
        const distance = collisionVector.length();
        const minDistance = radius + sizeData[0];

        if (distance < minDistance) {
          const overlap = minDistance - distance;
          collisionAdjustment.copy(collisionVector.normalize()).multiplyScalar(overlap);
          collisionVelocity
            .copy(collisionAdjustment)
            .multiplyScalar(Math.max(tempVelocity.length(), 2));
          tempPosition.sub(collisionAdjustment);
          tempVelocity.sub(collisionVelocity);
        }
      }

      if (Math.abs(tempPosition.x) + radius > config.maxX) {
        tempPosition.x = Math.sign(tempPosition.x) * (config.maxX - radius);
        tempVelocity.x = -tempVelocity.x * config.wallBounce;
      }

      if (config.gravity === 0) {
        if (Math.abs(tempPosition.y) + radius > config.maxY) {
          tempPosition.y = Math.sign(tempPosition.y) * (config.maxY - radius);
          tempVelocity.y = -tempVelocity.y * config.wallBounce;
        }
      } else if (tempPosition.y - radius < -config.maxY) {
        tempPosition.y = -config.maxY + radius;
        tempVelocity.y = -tempVelocity.y * config.wallBounce;
      }

      const maxDepth = Math.max(config.maxZ, config.maxSize);
      if (Math.abs(tempPosition.z) + radius > maxDepth) {
        tempPosition.z = Math.sign(tempPosition.z) * (config.maxZ - radius);
        tempVelocity.z = -tempVelocity.z * config.wallBounce;
      }

      tempPosition.toArray(positionData, base);
      tempVelocity.toArray(velocityData, base);
    }
  }
}

class SoftBallMaterial extends MeshPhysicalMaterial {
  constructor(options) {
    super(options);

    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };

    this.defines.USE_UV = "";

    this.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      shader.fragmentShader =
        `
        uniform float thicknessPower;
        uniform float thicknessScale;
        uniform float thicknessDistortion;
        uniform float thicknessAmbient;
        uniform float thicknessAttenuation;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        void RE_Direct_Scattering(
          const in IncidentLight directLight,
          const in vec2 uv,
          const in vec3 geometryPosition,
          const in vec3 geometryNormal,
          const in vec3 geometryViewDir,
          const in vec3 geometryClearcoatNormal,
          inout ReflectedLight reflectedLight
        ) {
          vec3 scatteringHalf = normalize(
            directLight.direction + (geometryNormal * thicknessDistortion)
          );
          float scatteringDot =
            pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) *
            thicknessScale;

          #ifdef USE_COLOR
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
          #else
            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
          #endif

          reflectedLight.directDiffuse +=
            scatteringIllu * thicknessAttenuation * directLight.color;
        }

        void main() {
      `
      );

      const injectedLightsChunk = ShaderChunk.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        `
          RE_Direct(
            directLight,
            geometryPosition,
            geometryNormal,
            geometryViewDir,
            geometryClearcoatNormal,
            material,
            reflectedLight
          );
          RE_Direct_Scattering(
            directLight,
            vUv,
            geometryPosition,
            geometryNormal,
            geometryViewDir,
            geometryClearcoatNormal,
            reflectedLight
          );
        `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <lights_fragment_begin>",
        injectedLightsChunk
      );
    };
  }
}

const DEFAULT_CONFIG = {
  count: 200,
  colors: [0x000000, 0x000000, 0x000000],
  ambientColor: 0xffffff,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

const instanceHelper = new Object3D();

class BallpitMesh extends InstancedMesh {
  constructor(renderer, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    const environment = new RoomEnvironment();
    const envMap = new PMREMGenerator(renderer, 0.04).fromScene(environment).texture;
    const geometry = new SphereGeometry();
    const material = new SoftBallMaterial({
      envMap,
      vertexColors: true,
      color: 0xffffff,
      ...config.materialParams,
    });

    material.envMapRotation.x = -Math.PI / 2;

    super(geometry, material, config.count);

    this.config = config;
    this.physics = new BallPhysics(config);
    this.frustumCulled = false;
    this.#setupLights();
    this.setColors(config.colors);
    this.update({ delta: 0, elapsed: 0 });
  }

  #setupLights() {
    this.ambientLight = new AmbientLight(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
    this.add(this.ambientLight);

    this.light = new PointLight(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }

  setColors(colors) {
    if (!Array.isArray(colors) || colors.length <= 1) return;

    const palette = colors.map((value) => new Color(value));
    const gradientColor = new Color();

    const getColorAt = (ratio) => {
      const scaled = Math.max(0, Math.min(1, ratio)) * (palette.length - 1);
      const index = Math.floor(scaled);
      const start = palette[index];

      if (index >= palette.length - 1) {
        return start.clone();
      }

      const alpha = scaled - index;
      const end = palette[index + 1];

      gradientColor.r = start.r + alpha * (end.r - start.r);
      gradientColor.g = start.g + alpha * (end.g - start.g);
      gradientColor.b = start.b + alpha * (end.b - start.b);
      return gradientColor;
    };

    for (let index = 0; index < this.count; index += 1) {
      const color = getColorAt(index / this.count);
      this.setColorAt(index, color);

      if (index === 0) {
        this.light.color.copy(color);
      }
    }

    this.instanceColor.needsUpdate = true;
  }

  update(frame) {
    this.physics.update(frame);

    for (let index = 0; index < this.count; index += 1) {
      instanceHelper.position.fromArray(this.physics.positionData, index * 3);

      if (index === 0 && this.config.followCursor === false) {
        instanceHelper.scale.setScalar(0);
      } else {
        instanceHelper.scale.setScalar(this.physics.sizeData[index]);
      }

      instanceHelper.updateMatrix();
      this.setMatrixAt(index, instanceHelper.matrix);

      if (index === 0) {
        this.light.position.copy(instanceHelper.position);
      }
    }

    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas, options = {}) {
  const world = new ThreeWorld({
    canvas,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });

  world.renderer.toneMapping = ACESFilmicToneMapping;
  world.camera.position.set(0, 0, 20);
  world.camera.lookAt(0, 0, 0);
  world.cameraMaxAspect = 1.5;
  world.resize();

  let isPaused = false;
  let spheres;
  const raycaster = new Raycaster();
  const cursorPlane = new Plane(new Vector3(0, 0, 1), 0);
  const intersection = new Vector3();

  const initialize = (config) => {
    if (spheres) {
      world.clear();
      world.scene.remove(spheres);
    }

    spheres = new BallpitMesh(world.renderer, config);
    world.scene.add(spheres);
  };

  initialize(options);
  spheres.update({ delta: 0, elapsed: 0 });

  canvas.style.touchAction = "none";
  canvas.style.userSelect = "none";
  canvas.style.webkitUserSelect = "none";

  const pointer = createPointerTracker({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, world.camera);
      world.camera.getWorldDirection(cursorPlane.normal);
      raycaster.ray.intersectPlane(cursorPlane, intersection);
      spheres.physics.center.copy(intersection);
      cursorPosition.copy(intersection);
      spheres.config.controlSphere0 = true;
    },
    onLeave() {
      spheres.config.controlSphere0 = false;
    },
  });

  world.onBeforeRender = (frame) => {
    if (isPaused) return;
    spheres.update(frame);
  };

  world.onAfterResize = (size) => {
    spheres.config.maxX = size.wWidth / 2;
    spheres.config.maxY = size.wHeight / 2;
  };

  return {
    three: world,
    get spheres() {
      return spheres;
    },
    setCount(count) {
      initialize({ ...spheres.config, count });
    },
    togglePause() {
      isPaused = !isPaused;
    },
    dispose() {
      pointer.dispose();
      world.dispose();
    },
  };
}

export default function Ballpit({ className = "", followCursor = true, ...props }) {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);
  const initialConfigRef = useRef({ followCursor, ...props });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    try {
      instanceRef.current = createBallpit(canvas, initialConfigRef.current);
    } catch (error) {
      canvas.style.display = "none";
      if (process.env.NODE_ENV !== "production") {
        console.warn("Ballpit disabled:", error);
      }
      instanceRef.current = null;
    }

    return () => {
      instanceRef.current?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
