"use client";

import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Image as DreiImage,
  OrbitControls,
  RoundedBox,
  Text,
  Environment,
  ContactShadows,
  Float,
} from "@react-three/drei";
import * as THREE from "three";
import type { Dog } from "@/lib/data/catalog";
import { ShowroomOverlay } from "./overlay";

/* ---- Estate palette, in linear-friendly hex ------------------------- */
const FOREST_DEEP = "#0b1713";
const FOREST_FLOOR = "#12241d";
const BRASS = "#b08442";
const BRASS_LIT = "#ddb972";
const BONE = "#f7f4ec";

/**
 * One framed portrait on the gallery wall: brass frame, bone mount, the dog's
 * photograph, and an engraved plaque beneath it.
 */
function Portrait({
  dog,
  index,
  total,
  onSelect,
}: {
  dog: Dog;
  index: number;
  total: number;
  onSelect: (d: Dog) => void;
}) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 6.6;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const [hover, setHover] = useState(false);

  return (
    <group position={[x, 1.5, z]} rotation={[0, angle + Math.PI, 0]}>
      {/* Brass outer frame */}
      <RoundedBox args={[2.62, 3.42, 0.12]} radius={0.05} smoothness={4} position={[0, 0, -0.11]}>
        <meshStandardMaterial
          color={hover ? BRASS_LIT : BRASS}
          metalness={0.95}
          roughness={hover ? 0.18 : 0.3}
          emissive={BRASS}
          emissiveIntensity={hover ? 0.25 : 0.06}
        />
      </RoundedBox>

      {/* Bone mount board behind the photograph */}
      <RoundedBox args={[2.42, 3.22, 0.04]} radius={0.02} smoothness={3} position={[0, 0, -0.04]}>
        <meshStandardMaterial color={BONE} roughness={0.85} metalness={0} />
      </RoundedBox>

      <Suspense fallback={null}>
        <DreiImage
          url={dog.images[0]}
          scale={hover ? [2.2, 2.98] : [2.12, 2.88]}
          position={[0, 0.12, 0.02]}
          transparent
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

      {/* Engraved plaque */}
      <group position={[0, -1.52, 0.04]}>
        <RoundedBox args={[1.75, 0.42, 0.06]} radius={0.03} smoothness={3}>
          <meshStandardMaterial color={BRASS} metalness={0.9} roughness={0.32} />
        </RoundedBox>
        <Text
          position={[0, 0.07, 0.04]}
          fontSize={0.15}
          maxWidth={1.6}
          color="#2a1c06"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {dog.name.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.1, 0.04]}
          fontSize={0.088}
          maxWidth={1.62}
          color="#4a3410"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
        >
          {dog.breedName}
        </Text>
      </group>

      {/* Picture light washing the frame from above */}
      <spotLight
        position={[0, 2.5, 1.5]}
        target-position={[0, 0, 0]}
        angle={0.55}
        penumbra={0.9}
        intensity={hover ? 22 : 9}
        color={BRASS_LIT}
        distance={7}
      />
    </group>
  );
}

function Ring({ dogs, onSelect }: { dogs: Dog[]; onSelect: (d: Dog) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.045;
  });
  return (
    <group ref={ref}>
      {dogs.map((dog, i) => (
        <Portrait key={dog.id} dog={dog} index={i} total={dogs.length} onSelect={onSelect} />
      ))}
    </group>
  );
}

/** The kennel's crest, rendered as a slowly turning brass medallion at centre. */
function CentreMedallion() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.25;
  });
  return (
    <Float speed={1.4} rotationIntensity={0} floatIntensity={0.5}>
      <group ref={ref} position={[0, 1.1, 0]}>
        <mesh>
          <torusGeometry args={[0.78, 0.055, 20, 72]} />
          <meshStandardMaterial color={BRASS} metalness={1} roughness={0.22} emissive={BRASS} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[0.76, 64]} />
          <meshStandardMaterial color={FOREST_DEEP} metalness={0.3} roughness={0.6} />
        </mesh>
        <Text position={[0, 0.08, 0.01]} fontSize={0.34} color={BRASS_LIT} anchorX="center" anchorY="middle" letterSpacing={0.06}>
          BK
        </Text>
        <Text position={[0, -0.26, 0.01]} fontSize={0.098} color={BONE} anchorX="center" anchorY="middle" letterSpacing={0.16}>
          EST. 2026
        </Text>
      </group>
    </Float>
  );
}

function Scene({ dogs, onSelect }: { dogs: Dog[]; onSelect: (d: Dog) => void }) {
  // Brass inlay rings set into the gallery floor.
  const inlays = useMemo(() => [2.9, 3.02, 7.6, 7.7], []);

  return (
    <>
      <color attach="background" args={[FOREST_DEEP]} />
      <fog attach="fog" args={[FOREST_DEEP, 13, 30]} />
      <Environment preset="apartment" environmentIntensity={0.35} />

      <ambientLight intensity={0.4} />
      {/* Cupola light over the rotunda */}
      <spotLight position={[0, 13, 0]} angle={0.7} penumbra={0.95} intensity={55} color={BONE} />
      <pointLight position={[0, 3.4, 0]} intensity={14} color={BRASS} distance={20} />

      {/* Polished floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]} receiveShadow>
        <circleGeometry args={[17, 72]} />
        <meshStandardMaterial color={FOREST_FLOOR} metalness={0.55} roughness={0.28} />
      </mesh>

      {/* Brass inlay rings */}
      {inlays.map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.68 + i * 0.001, 0]}>
          <ringGeometry args={[r, r + (i % 2 ? 0.02 : 0.05), 96]} />
          <meshStandardMaterial color={BRASS} metalness={1} roughness={0.2} emissive={BRASS} emissiveIntensity={0.35} />
        </mesh>
      ))}

      <ContactShadows position={[0, -1.66, 0]} opacity={0.45} scale={22} blur={2.6} far={5} color="#000000" />

      <CentreMedallion />
      <Ring dogs={dogs} onSelect={onSelect} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={14}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={false}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  );
}

export default function Showroom3D({ dogs }: { dogs: Dog[] }) {
  const [selected, setSelected] = useState<Dog | null>(null);

  if (dogs.length === 0) {
    return (
      <div className="grid h-[75vh] min-h-[520px] w-full place-items-center rounded-[2rem] border border-border bg-estate text-center">
        <p className="max-w-sm px-6 text-sm text-bone-100/70">
          The showroom is being re-hung. Browse the shop in the meantime — every dog is there.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-border">
      <Canvas camera={{ position: [0, 1.9, 10.5], fov: 50 }} dpr={[1, 2]} shadows>
        <Suspense fallback={null}>
          <Scene dogs={dogs} onSelect={setSelected} />
        </Suspense>
      </Canvas>

      {/* Hint */}
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full glass-strong px-4 py-2 text-xs text-foreground">
        Drag to look around · Scroll to zoom · Click a portrait
      </div>

      {selected && <ShowroomOverlay dog={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
