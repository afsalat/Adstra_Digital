"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function createBandTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 448;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const bandGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bandGradient.addColorStop(0, "#080a10");
  bandGradient.addColorStop(0.5, "#121724");
  bandGradient.addColorStop(1, "#07090f");
  ctx.fillStyle = bandGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(72, 0, 4, canvas.height);
  ctx.fillRect(canvas.width - 76, 0, 4, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 3;
  for (let y = -110; y < canvas.height + 160; y += 110) {
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(canvas.width - 48, y + 58);
    ctx.stroke();
  }

  const drawBandLogo = (centerY) => {
    ctx.save();
    ctx.translate(canvas.width / 2, centerY);
    ctx.rotate(-Math.PI / 2);

    ctx.fillStyle = "#f3f6fb";
    ctx.font = "700 38px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ADSTRA DIGITAL", 0, 0);

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(-148, -18);
    ctx.lineTo(-130, -36);
    ctx.lineTo(-112, -18);
    ctx.lineTo(-130, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#2b6fc8";
    ctx.beginPath();
    ctx.moveTo(-130, -36);
    ctx.lineTo(-112, -18);
    ctx.lineTo(-94, -36);
    ctx.lineTo(-112, -54);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#d77a28";
    ctx.beginPath();
    ctx.moveTo(-130, 0);
    ctx.lineTo(-112, 18);
    ctx.lineTo(-94, 0);
    ctx.lineTo(-112, -18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  for (let y = 128; y < canvas.height; y += 192) {
    drawBandLogo(y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

function createBandGeometry(segmentCount = 26, width = 0.28) {
  const geometry = new THREE.BufferGeometry();
  const vertexCount = (segmentCount + 1) * 2;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    const row = index * 2;
    const v = index / segmentCount;

    normals[row * 3 + 2] = 1;
    normals[(row + 1) * 3 + 2] = 1;

    uvs[row * 2] = 0;
    uvs[row * 2 + 1] = v;
    uvs[(row + 1) * 2] = 1;
    uvs[(row + 1) * 2 + 1] = v;

    if (index < segmentCount) {
      indices.push(row, row + 2, row + 1);
      indices.push(row + 1, row + 2, row + 3);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

  return geometry;
}

function createShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.filter = "blur(34px)";
  ctx.fillStyle = "rgba(9, 14, 24, 0.28)";
  roundedRect(ctx, 82, 94, canvas.width - 164, canvas.height - 188, 54);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(14px)";
  ctx.fillStyle = "rgba(9, 14, 24, 0.18)";
  roundedRect(ctx, 110, 118, canvas.width - 220, canvas.height - 236, 46);
  ctx.fill();
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

function createCardTexture(member) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const shellGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  shellGradient.addColorStop(0, "#eef2f7");
  shellGradient.addColorStop(1, "#dde5ef");
  ctx.fillStyle = shellGradient;
  roundedRect(ctx, 68, 68, canvas.width - 136, canvas.height - 136, 52);
  ctx.fill();

  ctx.strokeStyle = "rgba(12,18,28,0.08)";
  ctx.lineWidth = 5;
  roundedRect(ctx, 68, 68, canvas.width - 136, canvas.height - 136, 52);
  ctx.stroke();

  const accentGradient = ctx.createLinearGradient(110, 110, canvas.width - 110, 260);
  accentGradient.addColorStop(0, member.accent);
  accentGradient.addColorStop(0.55, "#f0b4a0");
  accentGradient.addColorStop(1, "#111827");
  ctx.fillStyle = accentGradient;
  roundedRect(ctx, 116, 116, canvas.width - 232, 120, 30);
  ctx.fill();

  ctx.fillStyle = "rgba(17,24,39,0.035)";
  ctx.beginPath();
  ctx.arc(canvas.width - 168, canvas.height - 206, 176, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 56px Arial";
  ctx.textAlign = "left";
  ctx.fillText("ADSTRA DIGITAL", 152, 192);

  ctx.fillStyle = "rgba(17,24,39,0.08)";
  ctx.font = "800 250px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    member.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2),
    canvas.width / 2,
    1028
  );

  ctx.fillStyle = "#94a3b8";
  ctx.font = "700 34px Arial";
  ctx.textAlign = "left";
  ctx.fillText(member.role.toUpperCase(), 148, 332);

  ctx.fillStyle = "#111827";
  ctx.font = "800 82px Arial";
  ctx.fillText(member.name, 148, 442);

  ctx.fillStyle = "#475569";
  ctx.font = "500 38px Arial";
  const words = member.copy.split(" ");
  let line = "";
  let lineIndex = 0;
  words.forEach((word, index) => {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > 700 && index !== 0) {
      ctx.fillText(line, 148, 570 + lineIndex * 58);
      line = word;
      lineIndex += 1;
    } else {
      line = testLine;
    }
  });
  if (line) {
    ctx.fillText(line, 148, 570 + lineIndex * 58);
  }

  ctx.strokeStyle = "rgba(17,24,39,0.07)";
  ctx.lineWidth = 3;
  roundedRect(ctx, 124, 268, canvas.width - 248, canvas.height - 388, 36);
  ctx.stroke();

  ctx.fillStyle = "rgba(17,24,39,0.05)";
  roundedRect(ctx, canvas.width - 340, 1268, 170, 46, 14);
  ctx.fill();
  roundedRect(ctx, canvas.width - 340, 1328, 170, 18, 9);
  ctx.fill();

  ctx.fillStyle = member.accent;
  roundedRect(ctx, 148, 1268, 236, 74, 22);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 30px Arial";
  ctx.fillText("TEAM PASS", 186, 1316);

  ctx.fillStyle = "#0f172a";
  for (let index = 0; index < 16; index += 1) {
    ctx.fillRect(148 + index * 22, 1388, index % 3 === 0 ? 10 : 6, 72);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

function createCardBackTexture(member) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1536;
  const ctx = canvas.getContext("2d");

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#e9eef5");
  base.addColorStop(1, "#dde4ee");
  ctx.fillStyle = base;
  roundedRect(ctx, 68, 68, canvas.width - 136, canvas.height - 136, 52);
  ctx.fill();

  ctx.fillStyle = member.accent;
  roundedRect(ctx, 116, 116, canvas.width - 232, 110, 28);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "800 52px Arial";
  ctx.textAlign = "center";
  ctx.fillText("ADSTRA DIGITAL", canvas.width / 2, 188);

  ctx.fillStyle = "#334155";
  ctx.font = "700 34px Arial";
  ctx.fillText("TEAM IDENTIFICATION PASS", canvas.width / 2, 330);

  ctx.fillStyle = "rgba(17,24,39,0.06)";
  roundedRect(ctx, 148, 400, canvas.width - 296, 470, 28);
  ctx.fill();

  ctx.fillStyle = "#64748b";
  ctx.font = "600 34px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Authorized access for internal operations only.", 172, 478);
  ctx.fillText("Return to Adstra Digital if found.", 172, 536);
  ctx.fillText(`Card Holder: ${member.name}`, 172, 660);
  ctx.fillText(`Division: ${member.role}`, 172, 720);

  ctx.fillStyle = "#0f172a";
  for (let row = 0; row < 12; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      if ((row + col) % 3 === 0) {
        ctx.fillRect(176 + col * 24, 968 + row * 24, 18, 18);
      }
    }
  }

  ctx.fillStyle = "rgba(17,24,39,0.08)";
  roundedRect(ctx, 540, 960, 300, 300, 28);
  ctx.fill();

  ctx.fillStyle = "#475569";
  ctx.font = "700 28px Arial";
  ctx.fillText("Scan / Verify", 618, 1130);

  ctx.fillStyle = "#0f172a";
  for (let index = 0; index < 20; index += 1) {
    ctx.fillRect(150 + index * 18, 1354, index % 4 === 0 ? 10 : 5, 84);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  return texture;
}

function LanyardItem({
  member,
  anchor,
  lanyardLength,
  gravity,
  bandTexture,
  phase,
}) {
  const cardWidth = 2.42;
  const cardHeight = 3.56;
  const cardHalfHeight = cardHeight / 2;
  const bandWidth = 0.28;
  const bandSegments = 18;
  const bandAttachOffset = useMemo(
    () => new THREE.Vector3(0, cardHalfHeight + 0.31, 0.02),
    [cardHalfHeight]
  );
  const bandRef = useRef(null);
  const cardRef = useRef(null);
  const pointerOffset = useRef(new THREE.Vector3());
  const dragPoint = useRef(new THREE.Vector3());
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const position = useRef(new THREE.Vector3(anchor[0], anchor[1] - lanyardLength, anchor[2]));
  const velocity = useRef(new THREE.Vector3());
  const faceRotation = useRef(0);
  const recoilTilt = useRef(0);
  const stretchEnergy = useRef(0);
  const bounceBoost = useRef(0);
  const wasDragged = useRef(false);
  const anchorVector = useMemo(() => new THREE.Vector3(...anchor), [anchor]);
  const [dragged, setDragged] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardTexture = useMemo(() => {
    if (member.frontImage) {
      const texture = new THREE.TextureLoader().load(member.frontImage);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      return texture;
    }
    return createCardTexture(member);
  }, [member]);
  const backTexture = useMemo(() => {
    if (member.backImage) {
      const texture = new THREE.TextureLoader().load(member.backImage);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      return texture;
    }
    return createCardBackTexture(member);
  }, [member]);
  const shadowTexture = useMemo(() => createShadowTexture(), []);
  const pull = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const cardTop = useMemo(() => new THREE.Vector3(), []);
  const bandTangent = useMemo(() => new THREE.Vector3(), []);
  const bandNormal = useMemo(() => new THREE.Vector3(), []);
  const bandAttachPoint = useMemo(() => new THREE.Vector3(), []);
  const cardUp = useMemo(() => new THREE.Vector3(), []);
  const cardEuler = useMemo(() => new THREE.Euler(), []);
  const ropeAdjustment = useMemo(() => new THREE.Vector3(), []);
  const ropeGravityStep = useMemo(() => new THREE.Vector3(), []);
  const ropePoints = useRef(
    Array.from({ length: bandSegments + 1 }, () => new THREE.Vector3())
  );
  const ropePreviousPoints = useRef(
    Array.from({ length: bandSegments + 1 }, () => new THREE.Vector3())
  );
  const bandGeometry = useMemo(
    () => createBandGeometry(bandSegments, bandWidth),
    [bandSegments, bandWidth]
  );

  useEffect(() => {
    const initialAttach = new THREE.Vector3(
      anchor[0],
      anchor[1] - Math.max(lanyardLength - cardHalfHeight - 0.1, 1.25),
      anchor[2]
    );
    for (let index = 0; index <= bandSegments; index += 1) {
      const t = index / bandSegments;
      ropePoints.current[index].lerpVectors(anchorVector, initialAttach, t);
      ropePreviousPoints.current[index].copy(ropePoints.current[index]);
    }
  }, [anchor, anchorVector, bandSegments, cardHalfHeight, lanyardLength]);

  useEffect(() => {
    if (!hovered && !dragged) return undefined;
    const previous = document.body.style.cursor;
    document.body.style.cursor = dragged ? "grabbing" : "grab";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [dragged, hovered]);

  useEffect(() => {
    return () => {
      cardTexture.dispose();
      backTexture.dispose();
      shadowTexture.dispose();
      bandGeometry.dispose();
    };
  }, [backTexture, bandGeometry, cardTexture, shadowTexture]);

  useFrame((state, delta) => {
    const step = Math.min(delta, 0.033);
    const restTarget = new THREE.Vector3(
      anchorVector.x + Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.22,
      anchorVector.y - lanyardLength,
      anchorVector.z
    );
    const verticalStretch = Math.max(restTarget.y - position.current.y, 0);
    const stretchAmount = Math.max(anchorVector.distanceTo(position.current) - lanyardLength, 0);

    if (wasDragged.current && !dragged) {
      bounceBoost.current = THREE.MathUtils.clamp(
        stretchEnergy.current * 24 + velocity.current.length() * 0.4,
        1.4,
        4.8
      );
      pull.copy(restTarget).sub(position.current);
      if (pull.lengthSq() > 0.0001) {
        pull.normalize().multiplyScalar(bounceBoost.current);
        velocity.current.add(pull);
      }
      recoilTilt.current = THREE.MathUtils.clamp(
        recoilTilt.current + bounceBoost.current * 0.12 + verticalStretch * 0.16,
        -0.28,
        0.28
      );
      stretchEnergy.current = 0;
    }
    wasDragged.current = dragged;

    if (dragged) {
      stretchEnergy.current = Math.max(
        stretchEnergy.current,
        stretchAmount + verticalStretch * 0.45
      );
      state.raycaster.ray.intersectPlane(dragPlane, dragPoint.current);
      pull
        .copy(dragPoint.current)
        .add(pointerOffset.current)
        .sub(position.current)
        .multiplyScalar(10 * step);
      velocity.current.add(pull);
    } else {
      bounceBoost.current = THREE.MathUtils.damp(bounceBoost.current, 0, 3.4, step);
      stretchEnergy.current = THREE.MathUtils.damp(stretchEnergy.current, 0, 6, step);
      const springStrength = 7.5 + verticalStretch * 13 + bounceBoost.current * 11;
      pull.copy(restTarget).sub(position.current).multiplyScalar(springStrength * step);
      velocity.current.add(pull);
      velocity.current.addScaledVector(
        new THREE.Vector3(gravity[0], gravity[1], gravity[2]),
        0.018 * step
      );
    }

    const motionDamping = dragged
      ? 0.9
      : THREE.MathUtils.lerp(0.935, 0.982, Math.min(bounceBoost.current / 4.8, 1));
    velocity.current.multiplyScalar(Math.pow(motionDamping, step * 60));
    position.current.addScaledVector(velocity.current, step * 2.15);

    direction.copy(position.current).sub(anchorVector);
    const maxLength = lanyardLength + 0.6;
    const distance = direction.length();
    if (distance > maxLength) {
      direction.setLength(maxLength);
      position.current.copy(anchorVector).add(direction);
      const normal = direction.clone().normalize();
      const projection = normal.multiplyScalar(velocity.current.dot(normal));
      velocity.current.sub(projection.multiplyScalar(0.85));
    }

    if (cardRef.current) {
      cardRef.current.position.copy(position.current);
    }

    cardTop.copy(position.current).add(new THREE.Vector3(0, cardHalfHeight + 0.02, 0));
    direction.copy(cardTop).sub(anchorVector);
    const cardLeanAngle = THREE.MathUtils.clamp(
      -Math.atan2(direction.x, -direction.y || 0.0001),
      -0.32,
      0.32
    );
    recoilTilt.current = THREE.MathUtils.damp(recoilTilt.current, 0, 4.5, step);
    const swingTilt = THREE.MathUtils.clamp(
      velocity.current.x * 0.05 - velocity.current.y * 0.02 + recoilTilt.current,
      -0.24,
      0.24
    );

    if (cardRef.current) {
      cardRef.current.rotation.x = THREE.MathUtils.damp(
        cardRef.current.rotation.x,
        swingTilt,
        8,
        step
      );
      cardRef.current.rotation.y = THREE.MathUtils.damp(
        cardRef.current.rotation.y,
        faceRotation.current,
        10,
        step
      );
      cardRef.current.rotation.z = THREE.MathUtils.damp(
        cardRef.current.rotation.z,
        cardLeanAngle,
        12,
        step
      );
    }

    if (bandRef.current && cardRef.current) {
      cardEuler.set(cardRef.current.rotation.x, 0, cardRef.current.rotation.z);
      cardUp.set(0, 1, 0).applyEuler(cardEuler).normalize();
      bandAttachPoint
        .copy(bandAttachOffset)
        .applyEuler(cardEuler)
        .add(position.current);

      const ropeLength =
        anchorVector.distanceTo(bandAttachPoint) +
        THREE.MathUtils.clamp(
          0.035 + Math.abs(direction.x) * 0.012 + velocity.current.length() * 0.001,
          0.035,
          0.09
        );
      const segmentLength = ropeLength / bandSegments;
      const lastIndex = bandSegments;
      const gravityScale = dragged ? 0.01 : 0.016;
      ropeGravityStep
        .set(gravity[0], gravity[1], gravity[2])
        .multiplyScalar(step * step * gravityScale);

      for (let index = 1; index < lastIndex; index += 1) {
        const current = ropePoints.current[index];
        const previous = ropePreviousPoints.current[index];
        ropeAdjustment.copy(current).sub(previous).multiplyScalar(0.985);
        previous.copy(current);
        current.add(ropeAdjustment);
        current.add(ropeGravityStep);
      }

      for (let iteration = 0; iteration < 7; iteration += 1) {
        ropePoints.current[0].copy(anchorVector);
        ropePoints.current[lastIndex].copy(bandAttachPoint);

        for (let index = 0; index < lastIndex; index += 1) {
          const current = ropePoints.current[index];
          const next = ropePoints.current[index + 1];
          ropeAdjustment.copy(next).sub(current);
          const distanceBetween = Math.max(ropeAdjustment.length(), 0.0001);
          const correction = (distanceBetween - segmentLength) / distanceBetween;

          if (index === 0) {
            next.addScaledVector(ropeAdjustment, -correction);
          } else if (index + 1 === lastIndex) {
            current.addScaledVector(ropeAdjustment, correction);
          } else {
            current.addScaledVector(ropeAdjustment, correction * 0.5);
            next.addScaledVector(ropeAdjustment, -correction * 0.5);
          }
        }
      }

      const bandPositions = bandGeometry.attributes.position.array;
      for (let index = 0; index <= bandSegments; index += 1) {
        const row = index * 2;
        const vertexOffset = row * 3;
        const point = ropePoints.current[index];
        const previousPoint = ropePoints.current[Math.max(index - 1, 0)];
        const nextPoint = ropePoints.current[Math.min(index + 1, lastIndex)];
        bandTangent.copy(nextPoint).sub(previousPoint).normalize();
        bandNormal
          .set(-bandTangent.y, bandTangent.x, 0)
          .normalize()
          .multiplyScalar(bandWidth / 2);

        bandPositions[vertexOffset] = point.x - bandNormal.x;
        bandPositions[vertexOffset + 1] = point.y - bandNormal.y;
        bandPositions[vertexOffset + 2] = 0;

        bandPositions[vertexOffset + 3] = point.x + bandNormal.x;
        bandPositions[vertexOffset + 4] = point.y + bandNormal.y;
        bandPositions[vertexOffset + 5] = 0;
      }

      bandGeometry.attributes.position.needsUpdate = true;
      bandGeometry.computeBoundingSphere();

      bandRef.current.position.set(0, 0, 0);
      bandRef.current.rotation.x = THREE.MathUtils.damp(
        bandRef.current.rotation.x,
        0,
        10,
        step
      );
      bandRef.current.rotation.y = THREE.MathUtils.damp(
        bandRef.current.rotation.y,
        0,
        10,
        step
      );
      bandRef.current.rotation.z = THREE.MathUtils.damp(
        bandRef.current.rotation.z,
        0,
        12,
        step
      );
    }

  });

  return (
    <group>
      <mesh position={anchor}>
        <sphereGeometry args={[0.15, 28, 28]} />
        <meshStandardMaterial color={member.accent} emissive={member.accent} emissiveIntensity={0.22} />
      </mesh>

      <mesh ref={bandRef}>
        <primitive object={bandGeometry} attach="geometry" />
        <meshStandardMaterial
          map={bandTexture}
          transparent
          side={THREE.DoubleSide}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      <group
        ref={cardRef}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.target.setPointerCapture(event.pointerId);
          pointerOffset.current.copy(position.current).sub(event.point);
          setDragged(true);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          event.target.releasePointerCapture(event.pointerId);
          setDragged(false);
        }}
      >
        <mesh position={[0.16, -0.18, -0.1]} rotation={[0, 0, 0.018]}>
          <planeGeometry args={[cardWidth * 1.12, cardHeight * 1.12]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={0.32}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[0.08, -0.08, -0.08]} rotation={[0, 0, 0.012]}>
          <planeGeometry args={[cardWidth * 1.02, cardHeight * 1.02]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={0.14}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[0, cardHalfHeight + 0.42, 0.03]}>
          <cylinderGeometry args={[0.05, 0.055, 0.44, 24]} />
          <meshStandardMaterial color="#05070c" metalness={0.75} roughness={0.28} />
        </mesh>

        <mesh position={[0, cardHalfHeight + 0.205, 0.04]}>
          <torusGeometry args={[0.085, 0.014, 16, 32]} />
          <meshStandardMaterial color="#c7ced8" metalness={1} roughness={0.18} />
        </mesh>

        <mesh position={[0, cardHalfHeight + 0.075, 0.02]}>
          <boxGeometry args={[0.18, 0.085, 0.09]} />
          <meshStandardMaterial color="#07090e" metalness={0.82} roughness={0.22} />
        </mesh>

        <mesh position={[0, cardHalfHeight + 0.14, 0.032]}>
          <boxGeometry args={[0.095, 0.16, 0.05]} />
          <meshStandardMaterial color="#131a25" metalness={0.96} roughness={0.16} />
        </mesh>

        <mesh position={[0, cardHalfHeight - 0.01, 0.073]}>
          <torusGeometry args={[0.055, 0.012, 16, 28]} />
          <meshStandardMaterial color="#0b0f17" metalness={0.35} roughness={0.62} />
        </mesh>

        <mesh position={[0, cardHalfHeight - 0.01, 0.073]}>
          <cylinderGeometry args={[0.018, 0.018, 0.014, 16]} />
          <meshStandardMaterial color="#05070c" metalness={0.22} roughness={0.68} />
        </mesh>

        <mesh position={[0, 0, 0.071]}>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshBasicMaterial map={cardTexture} transparent toneMapped={false} />
        </mesh>

        <mesh position={[0, 0, -0.071]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[cardWidth, cardHeight]} />
          <meshBasicMaterial map={backTexture} transparent toneMapped={false} />
        </mesh>

      </group>
    </group>
  );
}

function Scene({ members, gravity }) {
  const bandTexture = useMemo(() => createBandTexture(), []);
  const hangerY = 6.1;
  const floorY = -7.4;
  const spacing = 3.25;
  const startX = -((members.length - 1) * spacing) / 2;
  const lanyardLengths = [4.2, 5.9, 4.8, 6.45, 5.15, 6];

  useEffect(() => {
    return () => {
      bandTexture.dispose();
    };
  }, [bandTexture]);

  return (
    <>
      <ambientLight intensity={1.25} />
      <directionalLight position={[0, 6, 10]} intensity={1.7} color="#ffffff" />
      <directionalLight position={[-8, 2, 6]} intensity={0.8} color="#7aa8ff" />
      <directionalLight position={[8, -1, 4]} intensity={0.6} color="#ffdfab" />

      <Environment blur={0.65}>
        <Lightformer
          intensity={2}
          color="white"
          position={[0, 6, 6]}
          rotation={[0, 0, Math.PI / 3]}
          scale={[12, 1.8, 1]}
        />
        <Lightformer
          intensity={1.8}
          color="#9ad0ff"
          position={[-8, 1, 4]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[12, 8, 1]}
        />
        <Lightformer
          intensity={1.5}
          color="#ffd39a"
          position={[8, 0, 5]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[12, 8, 1]}
        />
      </Environment>

      <mesh position={[0, hangerY + 0.15, -1]}>
        <boxGeometry args={[16, 0.18, 0.55]} />
        <meshStandardMaterial color="#0b1018" metalness={0.55} roughness={0.28} />
      </mesh>

      <mesh position={[0, floorY, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[28, 14]} />
        <meshStandardMaterial color="#0b1120" roughness={1} metalness={0} />
      </mesh>

      {members.map((member, index) => (
        <LanyardItem
          key={member.name}
          member={member}
          lanyardLength={lanyardLengths[index % lanyardLengths.length]}
          gravity={gravity}
          bandTexture={bandTexture}
          phase={index * 0.9}
          anchor={[startX + index * spacing, hangerY, 0]}
        />
      ))}
    </>
  );
}

export default function TeamLanyards({
  members,
  position = [0, 0, 24],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}) {
  return (
    <div className="team-lanyards-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1.25, 2.2]}
        gl={{ alpha: transparent, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.06;
        }}
      >
        <Scene members={members} gravity={gravity} />
      </Canvas>
    </div>
  );
}
