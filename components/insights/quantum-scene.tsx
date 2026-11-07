"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type QuantumModel = "atom" | "qubit" | "entanglement" | "computer" | "sensor" | "shield" | "network";

const GOLD = 0xf7c96b;
const LIME = 0xb9ff39;
const AQUA = 0x56ebdf;
const LAVENDER = 0xac9aff;
const NIGHT = 0x0e1a19;

function sphere(radius: number, color: number, metalness = 0.1) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 24),
    new THREE.MeshStandardMaterial({ color, metalness, roughness: 0.25, emissive: color, emissiveIntensity: 0.12 }),
  );
}

function ring(radius: number, color: number, thickness = 0.023) {
  return new THREE.Mesh(
    new THREE.TorusGeometry(radius, thickness, 10, 92),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
  );
}

function rod(radius: number, height: number, color: number, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 16),
    new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.25 }),
  );
  mesh.position.set(x, y, z);
  return mesh;
}

function createAtom() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const nucleus = sphere(0.29, i % 2 ? GOLD : AQUA);
    nucleus.scale.setScalar(0.68);
    nucleus.position.set(Math.sin(i * 2.4) * 0.26, Math.cos(i * 3.2) * 0.24, Math.sin(i * 1.9) * 0.25);
    g.add(nucleus);
  }
  for (let i = 0; i < 3; i += 1) {
    const orbit = ring(1.55, i === 0 ? LIME : i === 1 ? AQUA : LAVENDER, 0.016);
    orbit.rotation.set(i * 0.88 + 0.2, i * 1.3, i * 0.36);
    g.add(orbit);
    const electron = sphere(0.092, i === 0 ? LIME : AQUA);
    const position = new THREE.Vector3(1.55, 0, 0).applyEuler(orbit.rotation);
    electron.position.copy(position);
    g.add(electron);
  }
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.07, 32, 20),
    new THREE.MeshBasicMaterial({ color: LIME, wireframe: true, transparent: true, opacity: 0.07 }),
  );
  g.add(halo);
  return g;
}

function createQubit() {
  const g = new THREE.Group();
  const ghost = new THREE.Mesh(
    new THREE.SphereGeometry(1.47, 36, 24),
    new THREE.MeshPhongMaterial({ color: 0x6d94ac, transparent: true, opacity: 0.09, shininess: 80 }),
  );
  g.add(ghost);
  const wire = new THREE.Mesh(
    new THREE.SphereGeometry(1.47, 20, 12),
    new THREE.MeshBasicMaterial({ color: AQUA, transparent: true, opacity: 0.16, wireframe: true }),
  );
  g.add(wire);
  const equator = ring(1.48, AQUA, 0.012);
  equator.rotation.x = Math.PI / 2;
  g.add(equator);
  const meridian = ring(1.48, LAVENDER, 0.012);
  meridian.rotation.y = Math.PI / 2;
  g.add(meridian);
  g.add(rod(0.014, 3.55, 0xa9b3c6));
  const arrow = new THREE.Group();
  arrow.add(rod(0.039, 1.7, LIME, 0, 0.82, 0));
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.32, 20),
    new THREE.MeshStandardMaterial({ color: LIME, emissive: LIME, emissiveIntensity: 0.28 }),
  );
  tip.position.y = 1.75;
  arrow.add(tip);
  arrow.rotation.z = -0.8;
  arrow.rotation.x = -0.45;
  g.add(arrow);
  g.add(sphere(0.15, GOLD));
  return g;
}

function createEntanglement() {
  const g = new THREE.Group();
  [-1, 1].forEach((side) => {
    const core = sphere(0.47, side < 0 ? LAVENDER : AQUA);
    core.position.set(side * 1.12, 0, 0);
    g.add(core);
    const orbit = ring(0.76, side < 0 ? LAVENDER : AQUA, 0.023);
    orbit.position.x = side * 1.12;
    orbit.rotation.set(0.6, side * 0.3, 0.4);
    g.add(orbit);
  });
  for (let phase = 0; phase < 2; phase += 1) {
    const points: THREE.Vector3[] = [];
    for (let index = 0; index <= 120; index += 1) {
      const u = index / 120;
      points.push(new THREE.Vector3(-1.15 + u * 2.3, Math.sin(u * Math.PI * 4 + phase * Math.PI) * 0.30, Math.cos(u * Math.PI * 4) * 0.23));
    }
    const geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 120, 0.022, 8, false);
    g.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: phase ? LIME : GOLD })));
  }
  return g;
}

function createComputer() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x2f444b, metalness: 0.8, roughness: 0.22 });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.27, 2.25), metal);
  plate.position.y = -1.55;
  g.add(plate);
  for (let i = 0; i < 5; i += 1) {
    const level = ring(1.05 - i * 0.105, GOLD, 0.075);
    level.rotation.x = Math.PI / 2;
    level.position.y = -1.11 + i * 0.58;
    level.scale.y = 0.7;
    g.add(level);
    for (let j = 0; j < 8; j += 1) {
      const angle = (j / 8) * Math.PI * 2;
      const wire = rod(0.014, 0.55, i % 2 ? AQUA : GOLD, Math.cos(angle) * (0.88 - i * 0.09), level.position.y + 0.23, Math.sin(angle) * (0.88 - i * 0.09));
      g.add(wire);
    }
  }
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.7, 0.2, 32), metal);
  crown.position.y = 1.78;
  g.add(crown);
  const core = sphere(0.24, LIME);
  core.position.y = -1.2;
  g.add(core);
  return g;
}

function createSensor() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.25, 0.25, 36),
    new THREE.MeshStandardMaterial({ color: 0x283f40, metalness: 0.7, roughness: 0.32 }),
  );
  base.position.y = -1.48;
  g.add(base);
  for (let i = 0; i < 4; i += 1) {
    g.add(rod(0.048, 2.25, GOLD, Math.cos(i * Math.PI / 2) * 0.84, -0.23, Math.sin(i * Math.PI / 2) * 0.84));
  }
  const detector = sphere(0.61, AQUA, 0.55);
  detector.position.y = 0.18;
  g.add(detector);
  for (let i = 0; i < 3; i += 1) {
    const orbit = ring(1.02 + i * 0.24, i === 1 ? LIME : AQUA, 0.018);
    orbit.rotation.set(0.3 + i * 0.55, 0.3 * i, Math.PI / 2);
    orbit.position.y = 0.17;
    g.add(orbit);
  }
  const lens = ring(0.53, GOLD, 0.1);
  lens.rotation.x = Math.PI / 2;
  lens.position.y = 1.4;
  g.add(lens);
  return g;
}

function createShield() {
  const g = new THREE.Group();
  const outer = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.65, 1),
    new THREE.MeshBasicMaterial({ color: AQUA, wireframe: true, transparent: true, opacity: 0.28 }),
  );
  g.add(outer);
  const outline = new THREE.Shape();
  outline.moveTo(0, 1.03);
  outline.lineTo(0.86, 0.57);
  outline.lineTo(0.7, -0.56);
  outline.quadraticCurveTo(0.24, -1.2, 0, -1.32);
  outline.quadraticCurveTo(-0.24, -1.2, -0.7, -0.56);
  outline.lineTo(-0.86, 0.57);
  outline.closePath();
  const body = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, { depth: 0.14, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.06, bevelSegments: 3 }),
    new THREE.MeshStandardMaterial({ color: 0x244d42, metalness: 0.54, roughness: 0.2, emissive: 0x0b4230, emissiveIntensity: 0.32 }),
  );
  body.position.z = 0.09;
  g.add(body);
  const lock = new THREE.Group();
  const shackle = ring(0.26, GOLD, 0.057);
  shackle.scale.y = 1.12;
  shackle.position.y = 0.21;
  lock.add(shackle);
  const lockBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.63, 0.52, 0.18),
    new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.5, roughness: 0.28 }),
  );
  lockBody.position.y = -0.19;
  lock.add(lockBody);
  lock.position.z = 0.34;
  g.add(lock);
  return g;
}

function createNetwork() {
  const g = new THREE.Group();
  const points = [
    [-1.35, -0.5, 0.1], [1.22, -0.4, 0.5], [-0.4, 1.18, -0.55],
    [0.8, 0.88, -0.25], [0.25, -1.05, -0.6], [-1.05, 0.55, 0.72],
  ] as const;
  for (const [index, position] of points.entries()) {
    const s = sphere(index % 2 ? 0.22 : 0.28, index % 2 ? GOLD : AQUA);
    s.position.set(...position);
    g.add(s);
  }
  for (const [start, end] of [[0, 2], [0, 5], [1, 3], [1, 4], [2, 3], [2, 5], [3, 4], [4, 5]] as const) {
    const a = new THREE.Vector3(...points[start]);
    const b = new THREE.Vector3(...points[end]);
    const direction = b.clone().sub(a);
    const line = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, direction.length(), 8),
      new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.58 }),
    );
    line.position.copy(a.add(b).multiplyScalar(0.5));
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    g.add(line);
  }
  return g;
}

const factories: Record<QuantumModel, () => THREE.Group> = {
  atom: createAtom,
  qubit: createQubit,
  entanglement: createEntanglement,
  computer: createComputer,
  sensor: createSensor,
  shield: createShield,
  network: createNetwork,
};

export default function QuantumScene({ model, label }: { model: QuantumModel; label: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const activeModel = useRef(model);
  const [unavailable, setUnavailable] = useState(false);
  activeModel.current = model;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // Static accessible fallback remains visible.
    }
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.25, 7.3);
    scene.add(new THREE.HemisphereLight(0xd5f7ff, 0x111d14, 2.3));
    const light = new THREE.PointLight(0xc9ff8c, 70, 20);
    light.position.set(3, 4, 5);
    scene.add(light);
    const fill = new THREE.PointLight(0x8b84ff, 50, 18);
    fill.position.set(-3, -2, 3);
    scene.add(fill);
    const models = {} as Record<QuantumModel, THREE.Group>;
    (Object.keys(factories) as QuantumModel[]).forEach((kind) => {
      const group = factories[kind]();
      group.visible = false;
      scene.add(group);
      models[kind] = group;
    });

    const stars: number[] = [];
    for (let i = 0; i < 160; i += 1) {
      const a = i * 2.399963;
      const z = 1 - 2 * (i + 0.5) / 160;
      const r = Math.sqrt(1 - z * z);
      stars.push(Math.cos(a) * r * 5.1, Math.sin(a) * r * 3.9, z * 2.7 - 1);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(stars, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xb7ffe8, size: 0.035, transparent: true, opacity: 0.55 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(NIGHT, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previous: QuantumModel | null = null;
    let tick = 0;
    const render = () => {
      if (document.hidden) return;
      tick += 0.01;
      const target = activeModel.current;
      if (target !== previous) {
        for (const kind of Object.keys(models) as QuantumModel[]) {
          models[kind].visible = kind === target;
          if (kind === target) models[kind].scale.setScalar(0.9);
        }
        previous = target;
      }
      const group = models[target];
      if (!reducedMotion.matches) {
        group.rotation.y += 0.003;
        group.rotation.x = Math.sin(tick * 0.35) * 0.12;
        starField.rotation.y += 0.00015;
      }
      group.scale.lerp(new THREE.Vector3(1, 1, 1), reducedMotion.matches ? 1 : 0.07);
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(render);

    const lost = (event: Event) => {
      event.preventDefault();
      renderer.setAnimationLoop(null);
      setUnavailable(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="quantum-three-shell">
      <div ref={hostRef} className="quantum-three-canvas" aria-hidden="true" />
      <div className="quantum-three-caption" aria-live="polite">
        <strong>{label}</strong>
        <span>{unavailable ? "3D-visning er ikke tilgjengelig på denne enheten." : "3D-konseptmodell · illustrasjon, ikke fysisk simulering"}</span>
      </div>
    </div>
  );
}
