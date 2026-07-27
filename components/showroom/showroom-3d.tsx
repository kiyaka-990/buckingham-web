"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Dog } from "@/lib/data/catalog";
import { ShowroomOverlay } from "./overlay";

function Portrait({ dog, index, total, onSelect }: { dog: Dog; index: number; total: number; onSelect: (d: Dog) => void }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 6.2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const [hover, setHover] = useState(false);

  return (
    <group position={[x, 1.6, z]} rotation={[0, angle + Math.PI, 0]}>
      {/* Frame */}
      <RoundedBox args={[2.5, 3.3, 0.15]} radius={0.06} position={[0, 0, -0.09]}>
        <meshStandardMaterial color={hover ? "#e6c65a" : "#c9972a"} metalness={0.9} roughness={0.25} />
      </RoundedBox>
      <Suspense fallback={null}>
        <DreiImage
          url={dog.images[0]}
          scale={hover ? [2.35, 3.15] : [2.25, 3.05]}
          position={[0, 0, 0.02]}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { setHover(false); document.body.style.cursor = "default"; }}
          onClick={(e) => { e.stopPropagation(); onSelect(dog); }}
        />
      </Suspense>
      {/* Pedestal light */}
      <pointLight position={[0, -2.2, 1.4]} intensity={hover ? 6 : 2.5} color="#e6c65a" distance={5} />
    </group>
  );
}

function Ring({ dogs, onSelect }: { dogs: Dog[]; onSelect: (d: Dog) => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return (
    <group ref={ref}>
      {dogs.map((dog, i) => (
        <Portrait key={dog.id} dog={dog} index={i} total={dogs.length} onSelect={onSelect} />
      ))}
    </group>
  );
}

function Scene({ dogs, onSelect }: { dogs: Dog[]; onSelect: (d: Dog) => void }) {
  return (
    <>
      <color attach="background" args={["#050b1f"]} />
      <fog attach="fog" args={["#050b1f", 12, 26]} />

      <ambientLight intensity={0.35} />
      <spotLight position={[0, 12, 0]} angle={0.6} penumbra={0.8} intensity={40} color="#ffffff" />
      <pointLight position={[0, 4, 0]} intensity={12} color="#c9972a" distance={18} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <circleGeometry args={[16, 64]} />
        <meshStandardMaterial color="#0a1533" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Center emblem */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.58, 0]}>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshStandardMaterial color="#c9972a" metalness={1} roughness={0.2} emissive="#5f3d1f" emissiveIntensity={0.4} />
      </mesh>

      <Ring dogs={dogs} onSelect={onSelect} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={13}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={false}
      />
    </>
  );
}

export default function Showroom3D({ dogs }: { dogs: Dog[] }) {
  const [selected, setSelected] = useState<Dog | null>(null);

  return (
    <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-border">
      <Canvas camera={{ position: [0, 1.8, 10], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene dogs={dogs} onSelect={setSelected} />
        </Suspense>
      </Canvas>

      {/* Hint */}
      <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full glass-strong px-4 py-2 text-xs text-white">
        Drag to look around · Scroll to zoom · Click a portrait
      </div>

      {selected && <ShowroomOverlay dog={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
