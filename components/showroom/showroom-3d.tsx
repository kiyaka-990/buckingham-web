"use client";

import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Image as DreiImage, RoundedBox, Text, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { Dog } from "@/lib/data/catalog";
import { ShowroomOverlay } from "./overlay";

/* ---- Warm Clay, in 3D ---------------------------------------------- */
const WALL = "#ffffff";
const WALL_SHADE = "#f6efe8";
const FLOOR = "#efe4d9";
const CLAY = "#a8442a";
const CLAY_DEEP = "#8f3a24";
const INK = "#2a1d18";

/**
 * A bright, straight gallery wall — not a carousel of floating frames.
 *
 * The previous versions read as cheap because the portraits hung in black space
 * and span endlessly on their own. This is a lit room: white walls with a real
 * corner, a floor the frames actually sit on, and a camera that only moves when
 * the visitor drags. Nothing rotates by itself.
 */

/** One framed dog on the wall. */
function Frame({
  dog,
  x,
  onSelect,
}: {
  dog: Dog;
  x: number;
  onSelect: (d: Dog) => void;
}) {
  const [hover, setHover] = useState(false);
  const group = useRef<THREE.Group>(null);

  // Lift very slightly on hover — a nudge, not a bounce.
  useFrame(() => {
    if (!group.current) return;
    const target = hover ? 0.06 : 0;
    group.current.position.z += (target - group.current.position.z) * 0.15;
  });

  return (
    <group ref={group} position={[x, 0.35, 0]}>
      {/* Mat board */}
      <RoundedBox args={[2.3, 2.9, 0.07]} radius={0.015} smoothness={3} position={[0, 0, -0.02]}>
        <meshStandardMaterial color={WALL} roughness={0.9} metalness={0} />
      </RoundedBox>

      {/* Thin dark rebate around the print */}
      <mesh position={[0, 0.16, -0.005]}>
        <planeGeometry args={[2.06, 2.36]} />
        <meshStandardMaterial color={INK} roughness={0.8} />
      </mesh>

      <Suspense fallback={null}>
        <DreiImage
          url={dog.images[0]}
          scale={[2, 2.3]}
          position={[0, 0.16, 0.03]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHover(false);
            document.body.style.cursor = "default";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(dog);
          }}
        />
      </Suspense>

      {/* Printed caption on the mat, gallery-label style */}
      <Text
        position={[0, -1.03, 0.03]}
        fontSize={0.13}
        color={INK}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
        maxWidth={2}
      >
        {dog.name}
      </Text>
      <Text
        position={[0, -1.22, 0.03]}
        fontSize={0.082}
        color="#5b6b60"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {dog.breedName}
      </Text>
      <mesh position={[0, -1.36, 0.03]}>
        <planeGeometry args={[hover ? 0.9 : 0.34, 0.012]} />
        <meshBasicMaterial color={CLAY} />
      </mesh>
    </group>
  );
}

/** Drag left/right along the wall. No autoplay, no orbit, no drift. */
function Dolly({ span }: { span: number }) {
  const { camera, gl } = useThree();
  const drag = useRef<{ active: boolean; startX: number; startCam: number }>({
    active: false,
    startX: 0,
    startCam: 0,
  });
  const target = useRef(0);
  const limit = Math.max(0, span / 2 - 1.6);

  useMemo(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current = { active: true, startX: e.clientX, startCam: target.current };
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = ((e.clientX - drag.current.startX) / el.clientWidth) * span;
      target.current = THREE.MathUtils.clamp(drag.current.startCam - dx, -limit, limit);
    };
    const up = () => {
      drag.current.active = false;
      el.style.cursor = "grab";
    };
    const wheel = (e: WheelEvent) => {
      target.current = THREE.MathUtils.clamp(target.current + e.deltaY * 0.004, -limit, limit);
    };
    el.style.cursor = "grab";
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("wheel", wheel, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("wheel", wheel);
    };
  }, [gl, span, limit]);

  useFrame(() => {
    camera.position.x += (target.current - camera.position.x) * 0.08;
    camera.lookAt(camera.position.x, 0.35, 0);
  });

  return null;
}

function Scene({ dogs, onSelect }: { dogs: Dog[]; onSelect: (d: Dog) => void }) {
  const gap = 2.75;
  const span = dogs.length * gap;
  const startX = -((dogs.length - 1) * gap) / 2;

  return (
    <>
      <color attach="background" args={[WALL_SHADE]} />
      <Environment preset="city" environmentIntensity={0.7} />

      {/* Daylight from the left, fill from the right */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[-6, 8, 6]} intensity={2.2} color="#ffffff" castShadow />
      <directionalLight position={[8, 4, 5]} intensity={0.7} color="#fff8e7" />

      {/* Back wall */}
      <mesh position={[0, 1.4, -0.12]} receiveShadow>
        <planeGeometry args={[span + 14, 12]} />
        <meshStandardMaterial color={WALL} roughness={1} />
      </mesh>

      {/* Skirting */}
      <mesh position={[0, -1.58, -0.05]}>
        <planeGeometry args={[span + 14, 0.16]} />
        <meshStandardMaterial color={WALL_SHADE} roughness={1} />
      </mesh>

      {/* Green datum line running the length of the wall */}
      <mesh position={[0, 2.15, -0.09]}>
        <planeGeometry args={[span + 14, 0.03]} />
        <meshBasicMaterial color={CLAY_DEEP} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.66, 5]} receiveShadow>
        <planeGeometry args={[span + 20, 16]} />
        <meshStandardMaterial color={FLOOR} roughness={0.75} metalness={0.05} />
      </mesh>

      <ContactShadows position={[0, -1.64, 0.4]} opacity={0.22} scale={span + 8} blur={2} far={3} color="#14201a" />

      {dogs.map((dog, i) => (
        <Frame key={dog.id} dog={dog} x={startX + i * gap} onSelect={onSelect} />
      ))}

      <Dolly span={span} />
    </>
  );
}

export default function Showroom3D({ dogs }: { dogs: Dog[] }) {
  const [selected, setSelected] = useState<Dog | null>(null);

  if (dogs.length === 0) {
    return (
      <div className="grid h-[70vh] min-h-[460px] w-full place-items-center rounded-3xl border border-border bg-surface-2 text-center">
        <p className="max-w-sm px-6 text-sm text-muted">
          The wall is being re-hung. Everything is in the shop in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[70vh] min-h-[460px] w-full overflow-hidden rounded-3xl border border-border bg-surface-2">
      <Canvas camera={{ position: [0, 0.35, 5.4], fov: 42 }} dpr={[1, 2]} shadows>
        <Suspense fallback={null}>
          <Scene dogs={dogs} onSelect={setSelected} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full glass-strong px-4 py-2 text-xs font-medium text-foreground">
        Drag to walk the wall · Click a portrait
      </div>

      {selected && <ShowroomOverlay dog={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
