"use client";

/**
 * Физичные 3D-объекты поверх главной страницы (в духе axolotgames.com).
 *
 * - Канвас зафиксирован на весь вьюпорт (pointer-events: none), события
 *   ловятся с document.body, так что страница под ним остаётся кликабельной.
 * - Коллизия — convex hull по мешу модели (colliders="hull" у rapier).
 * - По краям экрана невидимые стены: объекты не могут покинуть вьюпорт.
 * - Объекты можно таскать мышкой (пружина по скорости — сквозь стены не пролетают).
 * - При прокрутке тела смещаются вместе с контентом и падают обратно на
 *   «пол» вьюпорта — эффект уезжающего пола.
 */

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";

// Пикселей экрана на одну мировую единицу (zoom ортографической камеры).
const PX_PER_UNIT = 50;
// Полуглубина "коридора", в котором живут объекты (по оси z).
const DEPTH = 2.5;
// Жёсткость пружины перетаскивания и предел скорости.
const DRAG_STIFFNESS = 14;
const DRAG_MAX_SPEED = 55;

const PALETTE = ["#e74c3c", "#f39c12", "#3498db", "#2ecc71", "#e67e22", "#9b59b6"];

/** Детерминированный PRNG (mulberry32) — стабильные "случайные" позиции без Math.random в рендере. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Декорация не должна ронять страницу: при любой ошибке просто исчезает. */
class PhysicsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("[PhysicsPlayground] отключено из-за ошибки:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Сколько копий каждой модели раскидываем по экрану.
const PER_MODEL_COUNT = 2;
// Базовый мировой размер объекта (диаметр) — модели нормализуются к нему.
const BASE_SIZE = 3.2;
// Зазор между объектами при первичной расстановке (в мировых единицах).
const SPAWN_GAP = 0.4;

type BodyEntry = { body: RapierRigidBody; half: number };
type DragState = {
  body: RapierRigidBody;
  // Смещение точки захвата от центра тела, чтобы объект не "прыгал" к курсору.
  offX: number;
  offY: number;
  // Текущая позиция курсора в мировых координатах.
  px: number;
  py: number;
};

type Registry = React.RefObject<BodyEntry[]>;
type DragRef = React.RefObject<DragState | null>;

/** Невидимые стены по краям вьюпорта + перед/зад, чтобы тела не улетали по z. */
function Walls() {
  const { viewport } = useThree();
  const hw = viewport.width / 2;
  const hh = viewport.height / 2;
  const T = 2; // толщина стен

  return (
    <>
      {/* пол */}
      <CuboidCollider position={[0, -hh - T, 0]} args={[hw + T * 2, T, DEPTH + T * 2]} />
      {/* потолок */}
      <CuboidCollider position={[0, hh + T, 0]} args={[hw + T * 2, T, DEPTH + T * 2]} />
      {/* левая и правая */}
      <CuboidCollider position={[-hw - T, 0, 0]} args={[T, hh + T * 2, DEPTH + T * 2]} />
      <CuboidCollider position={[hw + T, 0, 0]} args={[T, hh + T * 2, DEPTH + T * 2]} />
      {/* задняя и передняя (держат объекты у плоскости экрана) */}
      <CuboidCollider position={[0, 0, -DEPTH - T]} args={[hw + T * 2, hh + T * 2, T]} />
      <CuboidCollider position={[0, 0, DEPTH + T]} args={[hw + T * 2, hh + T * 2, T]} />
    </>
  );
}

/**
 * При прокрутке страницы сдвигает тела на величину скролла: они «остаются»
 * на месте контента, а пол вьюпорта уезжает — и они падают на него обратно.
 */
function ScrollShifter({ registry, dragRef }: { registry: Registry; dragRef: DragRef }) {
  const { viewport } = useThree();
  const vp = useRef(viewport);
  useEffect(() => {
    vp.current = viewport;
  }, [viewport]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - last;
      last = window.scrollY;
      if (dy === 0) return;
      // Скролл вниз => контент уезжает вверх => тела двигаем вверх (+y).
      const d = dy / PX_PER_UNIT;
      const hh = vp.current.height / 2;
      for (const entry of registry.current) {
        if (dragRef.current?.body === entry.body) continue;
        const t = entry.body.translation();
        const y = THREE.MathUtils.clamp(t.y + d, -hh + entry.half + 0.05, hh - entry.half - 0.05);
        entry.body.setTranslation({ x: t.x, y, z: t.z }, true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [registry, dragRef]);

  return null;
}

/** Ведёт захваченное тело за курсором через скорость (не телепортацией). */
function DragController({ dragRef }: { dragRef: DragRef }) {
  const { viewport, size } = useThree();
  const dims = useRef({ viewport, size });
  useEffect(() => {
    dims.current = { viewport, size };
  }, [viewport, size]);

  useEffect(() => {
    const toWorld = (e: PointerEvent) => {
      const { viewport, size } = dims.current;
      return {
        x: (e.clientX / size.width - 0.5) * viewport.width,
        y: -(e.clientY / size.height - 0.5) * viewport.height,
      };
    };
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const p = toWorld(e);
      d.px = p.x;
      d.py = p.y;
    };
    const release = () => {
      const d = dragRef.current;
      if (!d) return;
      d.body.setGravityScale(1, true);
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [dragRef]);

  useFrame(() => {
    const d = dragRef.current;
    if (!d) return;
    const t = d.body.translation();
    const tx = d.px - d.offX;
    const ty = d.py - d.offY;
    let vx = (tx - t.x) * DRAG_STIFFNESS;
    let vy = (ty - t.y) * DRAG_STIFFNESS;
    let vz = (0 - t.z) * DRAG_STIFFNESS;
    const speed = Math.hypot(vx, vy, vz);
    if (speed > DRAG_MAX_SPEED) {
      const k = DRAG_MAX_SPEED / speed;
      vx *= k;
      vy *= k;
      vz *= k;
    }
    d.body.setLinvel({ x: vx, y: vy, z: vz }, true);
    const av = d.body.angvel();
    d.body.setAngvel({ x: av.x * 0.92, y: av.y * 0.92, z: av.z * 0.92 }, true);
  });

  return null;
}

/** Нормализует модель: центрирует, масштабирует до нужного размера, чинит материалы. */
function usePreparedModel(url: string, size: number) {
  const gltf = useGLTF(url);
  return useMemo(() => {
    const obj = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const s = size / (sphere.radius * 2);
    obj.scale.setScalar(s);
    obj.position.copy(sphere.center).multiplyScalar(-s);

    let paletteIdx = url.length % PALETTE.length;
    obj.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const convert = (m: THREE.Material) => {
        const src = m as THREE.MeshStandardMaterial & { alphaMap?: THREE.Texture | null };
        const map = src.map ?? null;
        const alphaMap = src.alphaMap ?? null;
        const hasMap = !!map;
        const color = src.color ? src.color.clone() : new THREE.Color("#ffffff");
        // Белые/пустые материалы без текстур красим в цвета палитры.
        const { r, g, b } = color;
        const isGray = Math.abs(r - g) < 0.05 && Math.abs(g - b) < 0.05 && r > 0.85;
        if (!hasMap && isGray) color.set(PALETTE[paletteIdx++ % PALETTE.length]);
        // Прозрачность: наследуем из исходного материала, а также включаем её,
        // если у текстуры есть альфа-канал (RGBA / формат с прозрачностью).
        const mapHasAlpha = !!map && (map.format === THREE.RGBAFormat || !!alphaMap);
        const transparent = !!src.transparent || mapHasAlpha || (src.opacity ?? 1) < 1;
        const next = new THREE.MeshStandardMaterial({
          map,
          alphaMap,
          color,
          roughness: 0.85, // матовая поверхность — почти без бликов
          metalness: 0.0,
          transparent,
          opacity: src.opacity ?? 1,
          alphaTest: src.alphaTest ?? (mapHasAlpha ? 0.5 : 0),
        });
        return next;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(convert)
        : convert(mesh.material);
    });
    return obj;
  }, [gltf, size, url]);
}

function PhysicsModel({
  url,
  size,
  position,
  rotation,
  registry,
  dragRef,
}: {
  url: string;
  size: number;
  position: [number, number, number];
  rotation: [number, number, number];
  registry: Registry;
  dragRef: DragRef;
}) {
  const scene = usePreparedModel(url, size);
  const bodyRef = useRef<RapierRigidBody>(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const list = registry.current;
    const entry: BodyEntry = { body, half: size / 2 };
    list.push(entry);
    return () => {
      const i = list.indexOf(entry);
      if (i !== -1) list.splice(i, 1);
    };
  }, [registry, size]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const body = bodyRef.current;
    if (!body || dragRef.current) return;
    const t = body.translation();
    dragRef.current = {
      body,
      offX: e.point.x - t.x,
      offY: e.point.y - t.y,
      px: e.point.x,
      py: e.point.y,
    };
    body.setGravityScale(0, true);
    body.wakeUp();
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
  };

  return (
    <RigidBody
      ref={bodyRef}
      colliders="hull"
      position={position}
      rotation={rotation}
      restitution={0.2}
      friction={0.4}
      linearDamping={0.2}
      angularDamping={0.35}
      ccd
    >
      <primitive
        object={scene}
        onPointerDown={onPointerDown}
        onPointerOver={() => {
          if (!dragRef.current) document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          if (!dragRef.current) document.body.style.cursor = "";
        }}
      />
    </RigidBody>
  );
}

type Instance = {
  key: string;
  url: string;
  size: number;
  rotation: [number, number, number];
};

/**
 * Расставляет объекты по вьюпорту без наложений (rejection sampling по
 * ограничивающим сферам) и рендерит их. Позиции считаются один раз —
 * при первом появлении вьюпорта, дальше стабильны.
 */
function Scene({
  instances,
  registry,
  dragRef,
}: {
  instances: Instance[];
  registry: Registry;
  dragRef: DragRef;
}) {
  const { viewport } = useThree();

  const placements = useMemo(() => {
    const rand = mulberry32(0x50fa11);
    const hw = viewport.width / 2;
    const hh = viewport.height / 2;
    const placed: { x: number; y: number; r: number }[] = [];

    for (const inst of instances) {
      const r = inst.size / 2;
      const maxX = Math.max(0.1, hw - r - SPAWN_GAP);
      const topY = hh - r - SPAWN_GAP;
      // Стартуем в верхних ~70% экрана, чтобы объекты успели упасть.
      const spanY = Math.max(0.1, Math.min(viewport.height * 0.7, viewport.height - 2 * (r + SPAWN_GAP)));

      let spot: { x: number; y: number } | null = null;
      for (let attempt = 0; attempt < 300; attempt++) {
        const x = (rand() * 2 - 1) * maxX;
        const y = topY - rand() * spanY;
        const ok = placed.every((p) => Math.hypot(p.x - x, p.y - y) >= p.r + r + SPAWN_GAP);
        if (!spot) spot = { x, y }; // запасной вариант, если идеального места не найдём
        if (ok) {
          spot = { x, y };
          break;
        }
      }
      placed.push({ x: spot!.x, y: spot!.y, r });
    }
    return placed;
    // Считаем один раз по стартовому вьюпорту; ресайз позиции не пересчитывает.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instances]);

  return (
    <>
      {instances.map((inst, i) => (
        <PhysicsModel
          key={inst.key}
          url={inst.url}
          size={inst.size}
          position={[placements[i].x, placements[i].y, 0]}
          rotation={inst.rotation}
          registry={registry}
          dragRef={dragRef}
        />
      ))}
    </>
  );
}

export default function PhysicsPlayground({ models }: { models: string[] }) {
  const registry = useRef<BodyEntry[]>([]);
  const dragRef = useRef<DragState | null>(null);
  // Компонент грузится с ssr:false, так что document доступен уже при первом рендере.
  const [eventSource] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null,
  );

  // Все модели из папки × PER_MODEL_COUNT, со стабильным псевдослучайным
  // размером и поворотом (без Math.random в рендере).
  const instances = useMemo<Instance[]>(() => {
    const rand = mulberry32(0xf10bba); // "floppa" в hex-приближении
    return models.flatMap((url, mi) =>
      Array.from({ length: PER_MODEL_COUNT }, (_, i) => ({
        key: `${mi}-${i}`,
        url,
        size: BASE_SIZE * (0.8 + rand() * 0.4),
        rotation: [rand() * 6, rand() * 6, rand() * 6] as [number, number, number],
      })),
    );
  }, [models]);

  if (!eventSource || instances.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      aria-hidden="true"
    >
      <PhysicsErrorBoundary>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 100], zoom: PX_PER_UNIT, near: 0.1, far: 300 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        eventSource={eventSource}
        eventPrefix="client"
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 8]} intensity={2.2} />
        <directionalLight position={[-6, -4, 6]} intensity={0.6} />
        <Suspense fallback={null}>
          <Physics
            gravity={[0, -30, 0]}
            numSolverIterations={8}
            numInternalPgsIterations={2}
          >
            <Walls />
            <ScrollShifter registry={registry} dragRef={dragRef} />
            <DragController dragRef={dragRef} />
            <Scene instances={instances} registry={registry} dragRef={dragRef} />
          </Physics>
        </Suspense>
      </Canvas>
      </PhysicsErrorBoundary>
    </div>
  );
}
