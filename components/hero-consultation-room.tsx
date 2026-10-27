"use client";

import { Canvas } from "@react-three/fiber";

function Patient() {
  return (
    <group position={[0, -1.05, 0]}>
      <mesh position={[0, 0.65, -0.12]}>
        <boxGeometry args={[1.05, 1.05, 0.12]} />
        <meshStandardMaterial color="#34536b" />
      </mesh>
      <mesh position={[0, 0.12, -0.12]}>
        <boxGeometry args={[1.05, 0.12, 0.8]} />
        <meshStandardMaterial color="#34536b" />
      </mesh>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.18, 0.15]}>
          <cylinderGeometry args={[0.055, 0.055, 0.42, 12]} />
          <meshStandardMaterial color="#24394a" />
        </mesh>
      ))}
      <mesh position={[0, 1.02, 0]}>
        <capsuleGeometry args={[0.38, 0.63, 5, 12]} />
        <meshStandardMaterial color="#4c9a91" roughness={0.82} />
      </mesh>
      <mesh position={[0, 1.66, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.24, 16]} />
        <meshStandardMaterial color="#dca982" />
      </mesh>
      <mesh position={[0, 1.98, 0]}>
        <sphereGeometry args={[0.36, 32, 24]} />
        <meshStandardMaterial color="#e8b995" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, -0.025]}>
        <sphereGeometry args={[0.365, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color="#49352e" roughness={0.9} />
      </mesh>
      {[-0.13, 0.13].map((x) => (
        <mesh key={x} position={[x, 2.02, 0.32]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#27394a" />
        </mesh>
      ))}
      <mesh position={[0, 1.96, 0.36]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#d39b79" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.42, 0.99, 0.02]}
          rotation={[0, 0, side * -0.18]}
        >
          <capsuleGeometry args={[0.105, 0.53, 4, 10]} />
          <meshStandardMaterial color="#4c9a91" />
        </mesh>
      ))}
    </group>
  );
}

function ConsultationRoom() {
  return (
    <>
      <color attach="background" args={["#eaf1f5"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 6, 5]} intensity={2.2} />
      <mesh position={[0, -1.12, 0]}>
        <boxGeometry args={[12, 0.15, 9]} />
        <meshStandardMaterial color="#c9d8dc" />
      </mesh>
      <mesh position={[0, 2, -2.5]}>
        <boxGeometry args={[12, 6, 0.12]} />
        <meshStandardMaterial color="#f5f8f9" />
      </mesh>
      <mesh position={[0, -0.05, 1.05]}>
        <boxGeometry args={[3.3, 0.13, 1.15]} />
        <meshStandardMaterial color="#b58b66" roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.58, 1.05]}>
        <boxGeometry args={[2.9, 1, 0.82]} />
        <meshStandardMaterial color="#a47b59" />
      </mesh>
      <mesh position={[1.15, 0.12, 0.92]}>
        <cylinderGeometry args={[0.12, 0.16, 0.23, 16]} />
        <meshStandardMaterial color="#b6a18d" />
      </mesh>
      <mesh position={[1.15, 0.37, 0.92]}>
        <sphereGeometry args={[0.23, 16, 16]} />
        <meshStandardMaterial color="#5e9d78" />
      </mesh>
      <Patient />
    </>
  );
}

export default function HeroConsultationRoomPreview() {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 1.3, 6.5], fov: 42 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: false, antialias: true, powerPreference: "low-power" }}
    >
      <ConsultationRoom />
    </Canvas>
  );
}
