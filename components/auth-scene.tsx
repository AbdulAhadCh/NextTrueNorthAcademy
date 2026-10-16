"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const FIELD_OF_VIEW = 35;
const CAMERA_Z = 12;
const BOX_SEGMENTS = 32;
const MAX_PIXEL_RATIO = 1.5;
const EDGE_MARGIN = 30;
const FLOAT_AMPLITUDE = 8;

const CUBE_HALF_SIZE = 0.74;
const CUBE_CORNER_RADIUS = 0.17;
const CAPSULE_RADIUS = 0.42;
const CAPSULE_HALF_LENGTH = 0.58;
const TABLET_RADIUS = 1;
const TABLET_HALF_THICKNESS = 0.3;
const TABLET_EXPONENT = 5;
const BOUND_RADIUS = 1.45;

const TEAL = new THREE.Color("#74d3c8");
const TEAL_SOFT = new THREE.Color("#9ee0d7");
const WHITE = new THREE.Color("#f4fbfa");
const TABLET_WHITE = new THREE.Color("#eaf7f5");
const TIMELINE_SEGMENTS = [
  2.4, 1.8, 3.4, 1.8,
  1.2, 1.8, 3.4, 1.8,
  1.2, 1.8, 3.4, 1.8,
  1.2, 1.8, 3.4, 1.8,
  1.2, 1.8, 3.4, 1.8,
  1.2, 1.8, 3.4, 1.8,
] as const;
const CYCLE_DURATION = TIMELINE_SEGMENTS.reduce((total, duration) => total + duration, 0);

type Form = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface ItemConfig {
  anchor: [number, number];
  depth: number;
  size: number;
  offset: number;
  capsuleTilt: number;
  tabletRoll: number;
  spin: [number, number, number];
  tealCube: boolean;
  staticForm: Form;
}

const ITEMS: ItemConfig[] = [
  {
    anchor: [0.12, 0.19],
    depth: -0.6,
    size: 1,
    offset: 0,
    capsuleTilt: 0.75,
    tabletRoll: -0.45,
    spin: [0.22, 0.31, 0.12],
    tealCube: true,
    staticForm: 1,
  },
  {
    anchor: [0.27, 0.84],
    depth: 0.8,
    size: 0.82,
    offset: 7.3,
    capsuleTilt: -0.95,
    tabletRoll: 0.6,
    spin: [-0.27, 0.2, 0.16],
    tealCube: false,
    staticForm: 3,
  },
  {
    anchor: [0.87, 0.16],
    depth: -1.2,
    size: 1.12,
    offset: 12.1,
    capsuleTilt: -0.6,
    tabletRoll: 0.25,
    spin: [0.18, -0.29, 0.1],
    tealCube: false,
    staticForm: 0,
  },
  {
    anchor: [0.79, 0.8],
    depth: 0.3,
    size: 0.92,
    offset: 3.9,
    capsuleTilt: 1.05,
    tabletRoll: -0.8,
    spin: [-0.2, -0.24, 0.14],
    tealCube: true,
    staticForm: 6,
  },
  {
    anchor: [0.05, 0.56],
    depth: -1.8,
    size: 0.76,
    offset: 15.2,
    capsuleTilt: -0.35,
    tabletRoll: 0.9,
    spin: [0.3, 0.17, -0.11],
    tealCube: true,
    staticForm: 5,
  },
  {
    anchor: [0.6, 0.06],
    depth: 0.5,
    size: 0.7,
    offset: 9.6,
    capsuleTilt: 0.5,
    tabletRoll: -0.15,
    spin: [-0.16, 0.26, 0.2],
    tealCube: false,
    staticForm: 4,
  },
];

interface TimelineSample {
  capsule: number;
  tablet: number;
  vial: number;
  syringe: number;
  injection: number;
  stethoscope: number;
  pulse: number;
}

interface MaterialUniforms {
  uPill: { value: number };
  uTablet: { value: number };
  uVial: { value: number };
  uSyringe: { value: number };
  uInjection: { value: number };
  uStethoscope: { value: number };
  uTeal: { value: THREE.Color };
  uWhite: { value: THREE.Color };
  uTabletColor: { value: THREE.Color };
}

interface Circle {
  x: number;
  y: number;
  radius: number;
}

interface Rectangle {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface AuthItem {
  config: ItemConfig;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  uniforms: MaterialUniforms;
  capsuleRotation: THREE.Quaternion;
  tabletRotation: THREE.Quaternion;
  vialRotation: THREE.Quaternion;
  syringeRotation: THREE.Quaternion;
  injectionRotation: THREE.Quaternion;
  stethoscopeRotation: THREE.Quaternion;
  stethoscopeHead: THREE.Group;
  basePosition: THREE.Vector3;
  baseScale: number;
  pixelsToWorld: number;
  phase: number;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoother(value: number) {
  return value * value * value * (value * (value * 6 - 15) + 10);
}

function sampleTimeline(time: number, sample: TimelineSample) {
  let remaining = ((time % CYCLE_DURATION) + CYCLE_DURATION) % CYCLE_DURATION;
  let segment = 0;

  while (
    segment < TIMELINE_SEGMENTS.length - 1 &&
    remaining >= TIMELINE_SEGMENTS[segment]
  ) {
    remaining -= TIMELINE_SEGMENTS[segment];
    segment += 1;
  }

  const progress = clamp(
    remaining / TIMELINE_SEGMENTS[segment],
    0,
    1,
  );
  const eased = smoother(progress);
  sample.capsule = 0;
  sample.tablet = 0;
  sample.vial = 0;
  sample.syringe = 0;
  sample.injection = 0;
  sample.stethoscope = 0;
  sample.pulse = 0;

  switch (segment) {
    case 1:
      sample.capsule = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 2:
      sample.capsule = 1;
      break;
    case 3:
      sample.capsule = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 5:
      sample.tablet = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 6:
      sample.tablet = 1;
      break;
    case 7:
      sample.tablet = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 9:
      sample.vial = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 10:
      sample.vial = 1;
      break;
    case 11:
      sample.vial = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 13:
      sample.syringe = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 14:
      sample.syringe = 1;
      break;
    case 15:
      sample.syringe = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 17:
      sample.injection = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 18:
      sample.injection = 1;
      break;
    case 19:
      sample.injection = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 21:
      sample.stethoscope = eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
    case 22:
      sample.stethoscope = 1;
      break;
    case 23:
      sample.stethoscope = 1 - eased;
      sample.pulse = Math.sin(Math.PI * progress);
      break;
  }
}

function cubeToSphere(x: number, y: number, z: number): [number, number, number] {
  const xSquared = x * x;
  const ySquared = y * y;
  const zSquared = z * z;
  const sphereX = x * Math.sqrt(1 - ySquared / 2 - zSquared / 2 + (ySquared * zSquared) / 3);
  const sphereY = y * Math.sqrt(1 - zSquared / 2 - xSquared / 2 + (zSquared * xSquared) / 3);
  const sphereZ = z * Math.sqrt(1 - xSquared / 2 - ySquared / 2 + (xSquared * ySquared) / 3);
  const length = Math.hypot(sphereX, sphereY, sphereZ) || 1;

  return [sphereX / length, sphereY / length, sphereZ / length];
}

function profileTransition(value: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(value, start, end);
}

function vialRadiusAt(y: number) {
  if (y < -0.94) {
    return THREE.MathUtils.lerp(0.12, 0.43, profileTransition(y, -1.25, -0.94));
  }
  if (y < 0.48) return 0.43;
  if (y < 0.76) {
    return THREE.MathUtils.lerp(0.43, 0.23, profileTransition(y, 0.48, 0.76));
  }
  if (y < 1.06) return 0.23;
  return THREE.MathUtils.lerp(0.23, 0.29, profileTransition(y, 1.06, 1.22));
}

function syringeRadiusAt(y: number) {
  if (y < -1.02) {
    return THREE.MathUtils.lerp(0.018, 0.11, profileTransition(y, -1.3, -1.02));
  }
  if (y < -0.78) return 0.11;
  if (y < 0.68) return 0.28;
  if (y < 0.83) return THREE.MathUtils.lerp(0.28, 0.35, profileTransition(y, 0.68, 0.83));
  if (y < 1.08) return 0.085;
  if (y < 1.23) return THREE.MathUtils.lerp(0.085, 0.29, profileTransition(y, 1.08, 1.23));
  return 0.29;
}

function injectionPenRadiusAt(y: number) {
  if (y < -1.12) {
    return THREE.MathUtils.lerp(0.015, 0.105, profileTransition(y, -1.32, -1.12));
  }
  if (y < -0.86) return 0.105;
  if (y < 0.66) return 0.27;
  if (y < 0.8) {
    return THREE.MathUtils.lerp(0.27, 0.32, profileTransition(y, 0.66, 0.8));
  }
  if (y < 1.02) return 0.32;
  if (y < 1.2) {
    return THREE.MathUtils.lerp(0.32, 0.22, profileTransition(y, 1.02, 1.2));
  }
  return 0.22;
}

function buildMorphGeometry() {
  const baseGeometry = new THREE.BoxGeometry(
    2,
    2,
    2,
    BOX_SEGMENTS,
    BOX_SEGMENTS,
    BOX_SEGMENTS,
  );
  let geometry: THREE.BufferGeometry = baseGeometry;
  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");
  geometry = mergeVertices(geometry, 1e-5);
  baseGeometry.dispose();

  const source = geometry.getAttribute("position") as THREE.BufferAttribute;
  const count = source.count;
  const cubePositions = new Float32Array(count * 3);
  const capsulePositions = new Float32Array(count * 3);
  const tabletPositions = new Float32Array(count * 3);
  const vialPositions = new Float32Array(count * 3);
  const syringePositions = new Float32Array(count * 3);
  const injectionPositions = new Float32Array(count * 3);
  const stethoscopePositions = new Float32Array(count * 3);
  const cubeInner = CUBE_HALF_SIZE - CUBE_CORNER_RADIUS;
  const capsuleLength = Math.PI * CAPSULE_RADIUS + 2 * CAPSULE_HALF_LENGTH;
  const capsuleQuarterArc = (Math.PI * CAPSULE_RADIUS) / 2;
  const stethoscopePath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-0.43, 0.92, 0),
      new THREE.Vector3(-0.43, 0.2, 0),
      new THREE.Vector3(-0.36, -0.3, 0),
      new THREE.Vector3(0, -0.56, 0),
      new THREE.Vector3(0.36, -0.3, 0),
      new THREE.Vector3(0.43, 0.2, 0),
      new THREE.Vector3(0.43, 0.92, 0),
    ],
    false,
    "centripetal",
  );

  for (let index = 0; index < count; index += 1) {
    const x = source.getX(index);
    const y = source.getY(index);
    const z = source.getZ(index);

    const cubeX = x * CUBE_HALF_SIZE;
    const cubeY = y * CUBE_HALF_SIZE;
    const cubeZ = z * CUBE_HALF_SIZE;
    const innerX = clamp(cubeX, -cubeInner, cubeInner);
    const innerY = clamp(cubeY, -cubeInner, cubeInner);
    const innerZ = clamp(cubeZ, -cubeInner, cubeInner);
    const offsetX = cubeX - innerX;
    const offsetY = cubeY - innerY;
    const offsetZ = cubeZ - innerZ;
    const cornerLength = Math.hypot(offsetX, offsetY, offsetZ) || 1;
    cubePositions[index * 3] =
      innerX + (offsetX / cornerLength) * CUBE_CORNER_RADIUS;
    cubePositions[index * 3 + 1] =
      innerY + (offsetY / cornerLength) * CUBE_CORNER_RADIUS;
    cubePositions[index * 3 + 2] =
      innerZ + (offsetZ / cornerLength) * CUBE_CORNER_RADIUS;

    const [sphereX, sphereY, sphereZ] = cubeToSphere(x, y, z);
    const polarAngle = Math.acos(clamp(sphereY, -1, 1));
    const arcPosition = (polarAngle / Math.PI) * capsuleLength;
    let capsuleY: number;
    let capsuleRadius: number;

    if (arcPosition < capsuleQuarterArc) {
      const angle = arcPosition / CAPSULE_RADIUS;
      capsuleY = CAPSULE_HALF_LENGTH + CAPSULE_RADIUS * Math.cos(angle);
      capsuleRadius = CAPSULE_RADIUS * Math.sin(angle);
    } else if (arcPosition < capsuleQuarterArc + 2 * CAPSULE_HALF_LENGTH) {
      capsuleY =
        CAPSULE_HALF_LENGTH - (arcPosition - capsuleQuarterArc);
      capsuleRadius = CAPSULE_RADIUS;
    } else {
      const angle =
        (arcPosition - capsuleQuarterArc - 2 * CAPSULE_HALF_LENGTH) /
        CAPSULE_RADIUS;
      capsuleY = -CAPSULE_HALF_LENGTH - CAPSULE_RADIUS * Math.sin(angle);
      capsuleRadius = CAPSULE_RADIUS * Math.cos(angle);
    }

    const radialLength = Math.hypot(sphereX, sphereZ);
    const axisX = radialLength > 1e-6 ? sphereX / radialLength : 0;
    const axisZ = radialLength > 1e-6 ? sphereZ / radialLength : 0;
    capsulePositions[index * 3] = axisX * capsuleRadius;
    capsulePositions[index * 3 + 1] = capsuleY;
    capsulePositions[index * 3 + 2] = axisZ * capsuleRadius;

    const tabletRadialLength = Math.hypot(sphereX, sphereZ);
    const tabletScale = Math.pow(
      Math.pow(tabletRadialLength / TABLET_RADIUS, TABLET_EXPONENT) +
        Math.pow(Math.abs(sphereY) / TABLET_HALF_THICKNESS, TABLET_EXPONENT),
      -1 / TABLET_EXPONENT,
    );
    tabletPositions[index * 3] = sphereX * tabletScale;
    tabletPositions[index * 3 + 1] = sphereY * tabletScale;
    tabletPositions[index * 3 + 2] = sphereZ * tabletScale;

    const vialY = sphereY * 1.22;
    const vialRadius = vialRadiusAt(vialY);
    vialPositions[index * 3] = axisX * vialRadius;
    vialPositions[index * 3 + 1] = vialY;
    vialPositions[index * 3 + 2] = axisZ * vialRadius;

    const syringeY = sphereY * 1.3;
    const syringeRadius = syringeRadiusAt(syringeY);
    syringePositions[index * 3] = axisX * syringeRadius;
    syringePositions[index * 3 + 1] = syringeY;
    syringePositions[index * 3 + 2] = axisZ * syringeRadius;

    const injectionY = sphereY * 1.27;
    const injectionRadius = injectionPenRadiusAt(injectionY);
    injectionPositions[index * 3] = axisX * injectionRadius;
    injectionPositions[index * 3 + 1] = injectionY;
    injectionPositions[index * 3 + 2] = axisZ * injectionRadius;

    const pathPosition = stethoscopePath.getPointAt((sphereY + 1) / 2);
    const pathTangent = stethoscopePath.getTangentAt((sphereY + 1) / 2).normalize();
    const reference = new THREE.Vector3(0, 0, 1);
    const pathNormal = new THREE.Vector3().crossVectors(pathTangent, reference).normalize();
    const pathBinormal = new THREE.Vector3().crossVectors(pathTangent, pathNormal).normalize();
    const stethoscopeAngle = Math.atan2(sphereZ, sphereX);
    const stethoscopeTubeRadius =
      0.11 * Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
    const stethoscopeOffset = new THREE.Vector3()
      .addScaledVector(pathNormal, Math.cos(stethoscopeAngle) * stethoscopeTubeRadius)
      .addScaledVector(pathBinormal, Math.sin(stethoscopeAngle) * stethoscopeTubeRadius);
    stethoscopePositions[index * 3] = pathPosition.x + stethoscopeOffset.x;
    stethoscopePositions[index * 3 + 1] = pathPosition.y + stethoscopeOffset.y;
    stethoscopePositions[index * 3 + 2] = pathPosition.z + stethoscopeOffset.z;
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(cubePositions, 3),
  );
  geometry.computeVertexNormals();

  const index = geometry.getIndex();
  if (!index) {
    geometry.dispose();
    throw new Error("The morph geometry did not produce an index buffer.");
  }

  function makeNormalAttribute(positions: Float32Array) {
    const normalGeometry = new THREE.BufferGeometry();
    normalGeometry.setIndex(index);
    normalGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    normalGeometry.computeVertexNormals();
    const normals = normalGeometry.getAttribute("normal") as THREE.BufferAttribute;
    const copy = new Float32Array(normals.array);
    normalGeometry.dispose();
    return new THREE.BufferAttribute(copy, 3);
  }

  geometry.morphAttributes.position = [
    new THREE.BufferAttribute(capsulePositions, 3),
    new THREE.BufferAttribute(tabletPositions, 3),
    new THREE.BufferAttribute(vialPositions, 3),
    new THREE.BufferAttribute(syringePositions, 3),
    new THREE.BufferAttribute(injectionPositions, 3),
    new THREE.BufferAttribute(stethoscopePositions, 3),
  ];
  geometry.morphAttributes.normal = [
    makeNormalAttribute(capsulePositions),
    makeNormalAttribute(tabletPositions),
    makeNormalAttribute(vialPositions),
    makeNormalAttribute(syringePositions),
    makeNormalAttribute(injectionPositions),
    makeNormalAttribute(stethoscopePositions),
  ];
  geometry.morphTargetsRelative = false;
  geometry.computeBoundingSphere();
  return geometry;
}

function createItemMaterial(baseColor: THREE.Color) {
  const uniforms: MaterialUniforms = {
    uPill: { value: 0 },
    uTablet: { value: 0 },
    uVial: { value: 0 },
    uSyringe: { value: 0 },
    uInjection: { value: 0 },
    uStethoscope: { value: 0 },
    uTeal: { value: TEAL.clone() },
    uWhite: { value: WHITE.clone() },
    uTabletColor: { value: TABLET_WHITE.clone() },
  };
  const material = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.34,
    metalness: 0,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vLocal;
         varying vec3 vGrooveDir;`,
      )
      .replace(
        "#include <morphtarget_vertex>",
        `#include <morphtarget_vertex>
         vLocal = transformed;
         vGrooveDir = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vLocal;
         varying vec3 vGrooveDir;
         uniform float uPill;
         uniform float uTablet;
         uniform float uVial;
         uniform float uSyringe;
         uniform float uInjection;
         uniform float uStethoscope;
         uniform vec3 uTeal;
         uniform vec3 uWhite;
         uniform vec3 uTabletColor;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
         {
           float capsuleSplit = smoothstep(-0.012, 0.012, vLocal.y);
           vec3 capsuleColor = mix(uWhite, uTeal, capsuleSplit);
           capsuleColor *= 1.0 - 0.14 * (1.0 - smoothstep(0.0, 0.05, abs(vLocal.y)));
           diffuseColor.rgb = mix(diffuseColor.rgb, capsuleColor, uPill);

           diffuseColor.rgb = mix(diffuseColor.rgb, uTabletColor, uTablet);
           float tabletFace = smoothstep(0.22, 0.26, abs(vLocal.y));
           float groove = (1.0 - smoothstep(0.012, 0.05, abs(vLocal.z))) * tabletFace * uTablet;
           diffuseColor.rgb *= 1.0 - 0.42 * groove;

           vec3 vialColor = mix(uTabletColor, uTeal, 0.78);
           float vialCap = smoothstep(1.02, 1.08, vLocal.y) * uVial;
           vialColor = mix(vialColor, uTeal * 0.72, vialCap);
           diffuseColor.rgb = mix(diffuseColor.rgb, vialColor, uVial);

           vec3 syringeColor = mix(uWhite, uTeal, 0.42);
           float syringeBarrel = step(-0.78, vLocal.y) * (1.0 - step(0.68, vLocal.y));
           float syringeFront = smoothstep(0.04, 0.2, vLocal.z);
           float syringeTick = step(0.84, fract((vLocal.y + 0.78) * 10.0));
           float syringeTickArea = step(abs(vLocal.x), 0.19) * syringeFront * syringeTick;
           syringeColor = mix(syringeColor, uTeal * 0.52, syringeTickArea);
           diffuseColor.rgb = mix(diffuseColor.rgb, syringeColor, uSyringe);

           vec3 injectionColor = mix(uWhite, uTeal, 0.3);
           float penGrip = smoothstep(0.66, 0.72, vLocal.y) *
             (1.0 - smoothstep(0.76, 0.82, vLocal.y));
           float penBand = smoothstep(0.82, 0.85, vLocal.y) *
             (1.0 - smoothstep(0.9, 0.93, vLocal.y));
           injectionColor = mix(injectionColor, uTeal, max(penGrip, penBand));
           float needleTip = 1.0 - smoothstep(1.06, 1.2, vLocal.y);
           injectionColor = mix(injectionColor, uWhite, needleTip * 0.65);
           diffuseColor.rgb = mix(diffuseColor.rgb, injectionColor, uInjection);

           vec3 stethoscopeColor = mix(uTeal, uWhite, 0.14);
           float earTip = smoothstep(0.86, 0.94, abs(vLocal.y)) * uStethoscope;
           stethoscopeColor = mix(stethoscopeColor, uWhite, earTip * 0.8);
           diffuseColor.rgb = mix(diffuseColor.rgb, stethoscopeColor, uStethoscope);
         }`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
         {
           float grooveZ = vLocal.z;
           float grooveWidth = 0.045;
           float grooveProfile = exp(-(grooveZ * grooveZ) / (grooveWidth * grooveWidth));
           float grooveSlope = -2.0 * grooveZ / (grooveWidth * grooveWidth) * grooveProfile;
           float tabletFace = smoothstep(0.22, 0.26, abs(vLocal.y));
           normal = normalize(normal + vGrooveDir * grooveSlope * 0.012 * tabletFace * uTablet);
         }`,
      );
  };
  material.customProgramCacheKey = () => "truenorth-auth-clinical-morph-v1";

  return { material, uniforms };
}

function getExclusionRectangle(container: HTMLElement, width: number, height: number) {
  const containerBounds = container.getBoundingClientRect();
  const card = document.querySelector<HTMLElement>("[data-auth-card]");

  if (card) {
    const cardBounds = card.getBoundingClientRect();
    return {
      left: cardBounds.left - containerBounds.left,
      top: cardBounds.top - containerBounds.top,
      right: cardBounds.right - containerBounds.left,
      bottom: cardBounds.bottom - containerBounds.top,
    };
  }

  const cardWidth = Math.min(480, width - 32);
  const cardHeight = Math.min(620, height - 32);
  return {
    left: (width - cardWidth) / 2,
    top: (height - cardHeight) / 2,
    right: (width + cardWidth) / 2,
    bottom: (height + cardHeight) / 2,
  };
}

function clearanceFromCard(circle: Circle, rectangle: Rectangle) {
  const dx = Math.max(rectangle.left - circle.x, 0, circle.x - rectangle.right);
  const dy = Math.max(rectangle.top - circle.y, 0, circle.y - rectangle.bottom);
  return Math.hypot(dx, dy);
}

function findPosition(
  anchorX: number,
  anchorY: number,
  baseRadius: number,
  card: Rectangle,
  width: number,
  height: number,
  placed: Circle[],
) {
  for (const scale of [1, 0.85, 0.7]) {
    const radius = baseRadius * scale;
    const requiredClearance = radius * 1.08 + EDGE_MARGIN;
    const candidates: [number, number][] = [
      [anchorX, anchorY],
      [card.left - requiredClearance, anchorY],
      [card.right + requiredClearance, anchorY],
      [anchorX, card.top - requiredClearance],
      [anchorX, card.bottom + requiredClearance],
    ];
    let best: Circle | null = null;
    let bestDistance = Infinity;

    for (const [x, y] of candidates) {
      const candidate = { x, y, radius };
      if (
        x < radius * 0.75 ||
        x > width - radius * 0.75 ||
        y < radius * 0.75 ||
        y > height - radius * 0.75
      ) {
        continue;
      }
      if (clearanceFromCard(candidate, card) < requiredClearance) continue;
      if (
        placed.some(
          (item) =>
            Math.hypot(item.x - x, item.y - y) < item.radius + radius + 12,
        )
      ) {
        continue;
      }

      const distance = Math.hypot(x - anchorX, y - anchorY);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }

    if (best) return best;
  }

  return null;
}

export default function AuthScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const sceneContainer: HTMLDivElement = container;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      console.error("Unable to initialize the TrueNorth 3D background.", error);
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    sceneContainer.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FIELD_OF_VIEW, 1, 0.1, 60);
    camera.position.set(0, 0, CAMERA_Z);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.7;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcdeeea, 0.6));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa6e8de, 0.7);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    const geometry = buildMorphGeometry();
    const chestpieceGeometry = new THREE.CylinderGeometry(0.145, 0.19, 0.085, 32);
    const chestpieceFaceGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.018, 32);
    const chestpieceRingGeometry = new THREE.TorusGeometry(0.17, 0.024, 8, 32);
    const earTipGeometry = new THREE.SphereGeometry(0.09, 16, 12);
    const chestpieceMaterial = new THREE.MeshStandardMaterial({
      color: "#dbe9e8",
      metalness: 0.48,
      roughness: 0.24,
    });
    const earTipMaterial = new THREE.MeshStandardMaterial({
      color: "#eff8f7",
      metalness: 0.04,
      roughness: 0.3,
    });
    const chestpieceFaceMaterial = new THREE.MeshStandardMaterial({
      color: "#78c9c1",
      metalness: 0.16,
      roughness: 0.32,
    });
    const tubingMaterial = new THREE.MeshStandardMaterial({
      color: "#397f7b",
      metalness: 0.12,
      roughness: 0.38,
    });
    const connectorCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.CatmullRomCurve3(
          [
            new THREE.Vector3(-0.43, 0.92, 0),
            new THREE.Vector3(-0.43, 0.2, 0),
            new THREE.Vector3(-0.36, -0.3, 0),
            new THREE.Vector3(0, -0.56, 0),
            new THREE.Vector3(0.36, -0.3, 0),
            new THREE.Vector3(0.43, 0.2, 0),
            new THREE.Vector3(0.43, 0.92, 0),
          ],
          false,
          "centripetal",
        ).getPointAt(0.68),
        new THREE.Vector3(0.34, -0.58, 0),
        new THREE.Vector3(0.18, -0.72, 0),
      ],
      false,
      "centripetal",
    );
    const connectorGeometry = new THREE.TubeGeometry(
      connectorCurve,
      24,
      0.055,
      8,
      false,
    );

    const items: AuthItem[] = ITEMS.map((config, index) => {
      const { material, uniforms } = createItemMaterial(
        config.tealCube ? TEAL_SOFT : WHITE,
      );
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      mesh.visible = false;
      const connector = new THREE.Mesh(connectorGeometry, tubingMaterial);
      const chestpiece = new THREE.Mesh(chestpieceGeometry, chestpieceMaterial);
      const chestpieceFace = new THREE.Mesh(
        chestpieceFaceGeometry,
        chestpieceFaceMaterial,
      );
      const chestpieceRing = new THREE.Mesh(
        chestpieceRingGeometry,
        chestpieceMaterial,
      );
      const leftEarTip = new THREE.Mesh(earTipGeometry, earTipMaterial);
      const rightEarTip = new THREE.Mesh(earTipGeometry, earTipMaterial);
      const chestpieceGroup = new THREE.Group();
      chestpieceGroup.position.set(0.18, -0.72, 0);
      for (const detail of [chestpiece, chestpieceFace]) {
        detail.rotation.x = Math.PI / 2;
      }
      chestpiece.position.z = 0.1;
      chestpieceFace.position.z = 0.16;
      chestpieceRing.position.z = 0.16;
      leftEarTip.position.set(-0.43, 0.91, 0);
      rightEarTip.position.set(0.43, 0.91, 0);
      leftEarTip.scale.set(0.8, 1.15, 0.8);
      rightEarTip.scale.set(0.8, 1.15, 0.8);
      const stethoscopeHead = new THREE.Group();
      chestpieceGroup.add(chestpiece, chestpieceFace, chestpieceRing);
      stethoscopeHead.add(
        connector,
        chestpieceGroup,
        leftEarTip,
        rightEarTip,
      );
      stethoscopeHead.scale.setScalar(0.001);
      mesh.add(stethoscopeHead);
      scene.add(mesh);

      return {
        config,
        mesh,
        material,
        uniforms,
        capsuleRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.35, 0, config.capsuleTilt),
        ),
        tabletRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.9, 0, config.tabletRoll, "ZXY"),
        ),
        vialRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.12, 0.08, config.capsuleTilt * 0.45),
        ),
        syringeRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.08, 0, config.tabletRoll * 0.45),
        ),
        injectionRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.08, 0, config.tabletRoll * 0.4),
        ),
        stethoscopeRotation: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(0.04, 0, config.capsuleTilt * 0.12),
        ),
        stethoscopeHead,
        basePosition: new THREE.Vector3(),
        baseScale: 1,
        pixelsToWorld: 0.01,
        phase: index * 1.7 + 0.6,
      };
    });

    const sample: TimelineSample = {
      capsule: 0,
      tablet: 0,
      vial: 0,
      syringe: 0,
      injection: 0,
      stethoscope: 0,
      pulse: 0,
    };
    const euler = new THREE.Euler();
    const freeRotation = new THREE.Quaternion();
    const swayRotation = new THREE.Quaternion();
    const targetRotation = new THREE.Quaternion();
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = motionPreference.matches;
    let resizeObserver: ResizeObserver | null = null;
    let layoutFrame = 0;

    function renderFrame(time: number, animated: boolean) {
      for (const item of items) {
        if (!item.mesh.visible) continue;
        const { config } = item;

        if (animated) {
          sampleTimeline(time + config.offset, sample);
        } else {
          sample.capsule = config.staticForm === 1 ? 1 : 0;
          sample.tablet = config.staticForm === 2 ? 1 : 0;
          sample.vial = config.staticForm === 3 ? 1 : 0;
          sample.syringe = config.staticForm === 4 ? 1 : 0;
          sample.injection = config.staticForm === 5 ? 1 : 0;
          sample.stethoscope = config.staticForm === 6 ? 1 : 0;
          sample.pulse = 0;
        }

        const influences = item.mesh.morphTargetInfluences;
        if (!influences) {
          throw new Error("The clinical morph geometry has no morph influences.");
        }
        influences[0] = sample.capsule;
        influences[1] = sample.tablet;
        influences[2] = sample.vial;
        influences[3] = sample.syringe;
        influences[4] = sample.injection;
        influences[5] = sample.stethoscope;
        item.uniforms.uPill.value = sample.capsule;
        item.uniforms.uTablet.value = sample.tablet;
        item.uniforms.uVial.value = sample.vial;
        item.uniforms.uSyringe.value = sample.syringe;
        item.uniforms.uInjection.value = sample.injection;
        item.uniforms.uStethoscope.value = sample.stethoscope;
        item.stethoscopeHead.visible = sample.stethoscope > 0;
        item.stethoscopeHead.scale.setScalar(
          Math.max(sample.stethoscope, 0.001),
        );

        const bob = FLOAT_AMPLITUDE * item.pixelsToWorld;
        const elapsed = animated ? time : 0;
        item.mesh.position.set(
          item.basePosition.x + Math.sin(elapsed * 0.45 + item.phase) * bob,
          item.basePosition.y +
            Math.sin(elapsed * 0.6 + item.phase * 1.3) * bob,
          item.basePosition.z,
        );

        const rotationTime = animated ? time : config.offset * 0.3 + 1.2;
        euler.set(
          rotationTime * config.spin[0] + item.phase,
          rotationTime * config.spin[1] + item.phase * 1.7,
          rotationTime * config.spin[2],
        );
        freeRotation.setFromEuler(euler);

        const clinicalWeight = Math.max(
          sample.capsule,
          sample.tablet,
          sample.vial,
          sample.syringe,
          sample.injection,
          sample.stethoscope,
        );
        if (clinicalWeight > 0) {
          const swayTime = animated ? time : 0;
          euler.set(
            Math.sin(swayTime * 0.7 + item.phase) * 0.07,
            Math.sin(swayTime * 0.5 + item.phase * 2) * 0.09,
            Math.sin(swayTime * 0.4 + item.phase) * 0.05,
          );
          swayRotation.setFromEuler(euler);
          const itemRotation =
            sample.stethoscope >= Math.max(
              sample.capsule,
              sample.tablet,
              sample.vial,
              sample.syringe,
              sample.injection,
            )
              ? item.stethoscopeRotation
              : sample.injection >= Math.max(
                    sample.capsule,
                    sample.tablet,
                    sample.vial,
                    sample.syringe,
                  )
                ? item.injectionRotation
                : sample.vial >= Math.max(
                      sample.capsule,
                      sample.tablet,
                      sample.syringe,
                    )
                  ? item.vialRotation
                  : sample.syringe >= Math.max(sample.capsule, sample.tablet)
                    ? item.syringeRotation
                    : sample.capsule >= sample.tablet
                      ? item.capsuleRotation
                      : item.tabletRotation;
          targetRotation
            .copy(itemRotation)
            .multiply(swayRotation);
          freeRotation.slerp(targetRotation, clinicalWeight);
        }

        item.mesh.quaternion.copy(freeRotation);
        item.mesh.scale.setScalar(
          item.baseScale * (1 + 0.07 * sample.pulse),
        );
      }

      renderer.render(scene, camera);
    }

    const startTime = performance.now();
    const animationLoop = () =>
      renderFrame((performance.now() - startTime) / 1000, true);

    function startAnimation() {
      if (reducedMotion) {
        renderer.setAnimationLoop(null);
        renderFrame(0, false);
      } else {
        renderer.setAnimationLoop(animationLoop);
      }
    }

    function layout() {
      const width = sceneContainer.clientWidth;
      const height = sceneContainer.clientHeight;
      if (!width || !height) return;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const card = getExclusionRectangle(sceneContainer, width, height);
      const cardElement = document.querySelector<HTMLElement>("[data-auth-card]");
      if (cardElement) resizeObserver?.observe(cardElement);

      const baseDiameter = clamp(Math.min(width, height) * 0.2, 92, 200);
      const tangent = Math.tan(
        THREE.MathUtils.degToRad(FIELD_OF_VIEW / 2),
      );
      const placed: Circle[] = [];

      for (const item of items) {
        const cameraDistance = CAMERA_Z - item.config.depth;
        const pixelsPerUnit = height / (2 * tangent * cameraDistance);
        const spot = findPosition(
          item.config.anchor[0] * width,
          item.config.anchor[1] * height,
          (baseDiameter * item.config.size) / 2,
          card,
          width,
          height,
          placed,
        );

        if (!spot) {
          item.mesh.visible = false;
          continue;
        }

        placed.push(spot);
        const halfViewHeight = tangent * cameraDistance;
        const worldX = ((spot.x / width) * 2 - 1) * halfViewHeight * camera.aspect;
        const worldY = -((spot.y / height) * 2 - 1) * halfViewHeight;
        item.basePosition.set(worldX, worldY, item.config.depth);
        item.pixelsToWorld = 1 / pixelsPerUnit;
        item.baseScale = spot.radius / (pixelsPerUnit * BOUND_RADIUS);
        item.mesh.visible = true;
      }

      if (reducedMotion) renderFrame(0, false);
    }

    function scheduleLayout() {
      if (layoutFrame) return;
      layoutFrame = window.requestAnimationFrame(() => {
        layoutFrame = 0;
        layout();
      });
    }

    resizeObserver = new ResizeObserver(scheduleLayout);
    resizeObserver.observe(sceneContainer);
    motionPreference.addEventListener("change", onMotionChange);

    function onMotionChange(event: MediaQueryListEvent) {
      reducedMotion = event.matches;
      startAnimation();
    }

    layout();
    startAnimation();

    return () => {
      if (layoutFrame) window.cancelAnimationFrame(layoutFrame);
      resizeObserver?.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
      renderer.setAnimationLoop(null);
      items.forEach((item) => {
        scene.remove(item.mesh);
        item.material.dispose();
      });
      chestpieceGeometry.dispose();
      chestpieceFaceGeometry.dispose();
      chestpieceRingGeometry.dispose();
      earTipGeometry.dispose();
      connectorGeometry.dispose();
      chestpieceMaterial.dispose();
      earTipMaterial.dispose();
      chestpieceFaceMaterial.dispose();
      tubingMaterial.dispose();
      geometry.dispose();
      environment.dispose();
      pmrem.dispose();
      room.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const roomMaterials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          roomMaterials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div aria-hidden="true" className="auth-scene" ref={containerRef} />;
}
