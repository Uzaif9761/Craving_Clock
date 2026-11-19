import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MealSlot } from '../types';

interface ThreeHeroSceneProps {
  activeSlot: MealSlot;
  onSlotSelect: (slot: MealSlot) => void;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({ activeSlot, onSlotSelect }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);

  // Map meal slot to orbital angle (in radians)
  const slotAngles: Record<MealSlot, number> = {
    Breakfast: 0,
    Lunch: Math.PI / 2,
    Snacks: Math.PI,
    Dinner: (3 * Math.PI) / 2
  };

  useEffect(() => {
    targetAngleRef.current = slotAngles[activeSlot];
  }, [activeSlot]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0908, 0.045);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // LIGHTING: Saffron Rim + Crimson Fill + Warm Ambient
    const ambientLight = new THREE.AmbientLight(0xfff0e6, 1.4);
    scene.add(ambientLight);

    const saffronPointLight = new THREE.PointLight(0xff9f1c, 45, 15);
    saffronPointLight.position.set(3, 4, 3);
    saffronPointLight.castShadow = true;
    scene.add(saffronPointLight);

    const crimsonFillLight = new THREE.PointLight(0xe71d36, 30, 15);
    crimsonFillLight.position.set(-3.5, 3, -2);
    scene.add(crimsonFillLight);

    const mintChutneyLight = new THREE.PointLight(0x2ec4b6, 15, 10);
    mintChutneyLight.position.set(0, -2, 3);
    scene.add(mintChutneyLight);

    // 3D OBJECTS GROUP: THE CRAVING CLOCK PLATTER & THALI
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. STAINLESS-STEEL THALI (Large Platter)
    const platterGeo = new THREE.CylinderGeometry(2.2, 2.05, 0.12, 64);
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e6ed,
      metalness: 0.92,
      roughness: 0.18
    });
    const platter = new THREE.Mesh(platterGeo, chromeMaterial);
    platter.castShadow = true;
    platter.receiveShadow = true;
    masterGroup.add(platter);

    // Platter raised rim
    const rimGeo = new THREE.TorusGeometry(2.2, 0.08, 20, 64);
    rimGeo.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, chromeMaterial);
    rim.position.y = 0.06;
    masterGroup.add(rim);

    // 2. KATORIS (Small Stainless Steel Bowls with curries)
    const katoriGeo = new THREE.CylinderGeometry(0.44, 0.36, 0.28, 32);
    const curryMat1 = new THREE.MeshStandardMaterial({ color: 0xd9531e, roughness: 0.4 }); // Paneer Gravy
    const curryMat2 = new THREE.MeshStandardMaterial({ color: 0xdeb841, roughness: 0.5 }); // Dal Tadka
    const curryMat3 = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.45 }); // Mint Chutney
    const sweetMat = new THREE.MeshStandardMaterial({ color: 0xf5b700, roughness: 0.3 }); // Saffron Sheera

    const katoriConfigs = [
      { x: -1.2, z: -0.6, mat: curryMat1 },
      { x: -0.3, z: -1.3, mat: curryMat2 },
      { x: 0.7, z: -1.2, mat: curryMat3 },
      { x: 1.35, z: -0.4, mat: sweetMat }
    ];

    katoriConfigs.forEach((cfg) => {
      const bowlGroup = new THREE.Group();
      bowlGroup.position.set(cfg.x, 0.14, cfg.z);

      const bowl = new THREE.Mesh(katoriGeo, chromeMaterial);
      bowl.castShadow = true;
      bowl.receiveShadow = true;
      bowlGroup.add(bowl);

      // Curry filling
      const fillGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 32);
      const filling = new THREE.Mesh(fillGeo, cfg.mat);
      filling.position.y = 0.11;
      bowlGroup.add(filling);

      masterGroup.add(bowlGroup);
    });

    // 3. RICE MOUND & ROTIS / CHAWAL
    const riceGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const riceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
    const riceMound = new THREE.Mesh(riceGeo, riceMat);
    riceMound.position.set(0.4, 0.06, 0.5);
    riceMound.scale.set(1.1, 0.65, 1.1);
    masterGroup.add(riceMound);

    // Warm Phulkas / Chapatis (Folded discs)
    const rotiGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.03, 32);
    const rotiMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const roti = new THREE.Mesh(rotiGeo, rotiMat);
      roti.position.set(-0.75 + i * 0.12, 0.08 + i * 0.035, 0.5 - i * 0.08);
      roti.rotation.set(0.1, 0.2 * i, 0.05);
      roti.castShadow = true;
      masterGroup.add(roti);
    }

    // 4. FLOATING CHRONO ORBITAL RING (The Craving Clock Dial)
    const dialRingGeo = new THREE.TorusGeometry(3.1, 0.035, 16, 100);
    dialRingGeo.rotateX(Math.PI / 2);
    const dialRingMat = new THREE.MeshStandardMaterial({
      color: 0xff9f1c,
      emissive: 0xff9f1c,
      emissiveIntensity: 0.6,
      metalness: 0.7,
      roughness: 0.3
    });
    const dialRing = new THREE.Mesh(dialRingGeo, dialRingMat);
    dialRing.position.y = 0.1;
    scene.add(dialRing);

    // Secondary glowing outer ring
    const outerRingGeo = new THREE.TorusGeometry(3.4, 0.015, 16, 120);
    outerRingGeo.rotateX(Math.PI / 2);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xe71d36,
      emissive: 0xe71d36,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.7
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    scene.add(outerRing);

    // 4 MEAL-SLOT 3D JEWEL MARKERS (Breakfast, Lunch, Snacks, Dinner)
    const markerGeo = new THREE.OctahedronGeometry(0.18, 0);
    const markerMatActive = new THREE.MeshStandardMaterial({
      color: 0xffb84d,
      emissive: 0xff9f1c,
      emissiveIntensity: 1.2,
      roughness: 0.2
    });

    const mealMarkers: Array<{ mesh: THREE.Mesh; slot: MealSlot; angle: number }> = [
      { slot: 'Breakfast', angle: 0, mesh: new THREE.Mesh(markerGeo, markerMatActive) },
      { slot: 'Lunch', angle: Math.PI / 2, mesh: new THREE.Mesh(markerGeo, markerMatActive) },
      { slot: 'Snacks', angle: Math.PI, mesh: new THREE.Mesh(markerGeo, markerMatActive) },
      { slot: 'Dinner', angle: (3 * Math.PI) / 2, mesh: new THREE.Mesh(markerGeo, markerMatActive) }
    ];

    mealMarkers.forEach((m) => {
      m.mesh.position.set(Math.cos(m.angle) * 3.1, 0.25, Math.sin(m.angle) * 3.1);
      scene.add(m.mesh);
    });

    // 5. STEAM & FLOATING SPICE PARTICLES
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 4.5;
      particlePositions[i * 3 + 1] = Math.random() * 2.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
      particleSpeeds[i] = 0.005 + Math.random() * 0.012;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffcb77,
      size: 0.045,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const steamSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(steamSystem);

    // ================================================================
    // INTERACTIVE MOUSE & TOUCH SPRING PHYSICS
    // ================================================================
    let targetTiltX = 0;
    let targetTiltZ = 0;
    let currentTiltX = 0;
    let currentTiltZ = 0;

    const updateTilt = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      targetTiltX = -y * 0.28;
      targetTiltZ = x * 0.28;
    };

    const onMouseMove = (e: MouseEvent) => {
      updateTilt(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });

    // RESIZE OBSERVER FOR RESPONSIVENESS
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // ANIMATION RENDER LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Spring Interpolation
      currentTiltX += (targetTiltX - currentTiltX) * 0.08;
      currentTiltZ += (targetTiltZ - currentTiltZ) * 0.08;

      // Rotation towards active meal slot
      currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * 0.05;

      masterGroup.rotation.x = currentTiltX + 0.15;
      masterGroup.rotation.z = currentTiltZ;
      masterGroup.rotation.y = -currentAngleRef.current + Math.sin(elapsedTime * 0.8) * 0.04;
      masterGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

      dialRing.rotation.y = elapsedTime * 0.08;
      outerRing.rotation.y = -elapsedTime * 0.05;

      mealMarkers.forEach((m) => {
        m.mesh.rotation.y = elapsedTime * 1.5;
        m.mesh.rotation.x = elapsedTime * 1.2;
        m.mesh.position.y = 0.2 + Math.sin(elapsedTime * 2.5 + m.angle) * 0.06;
      });

      // Animate Steam particles
      const pos = steamSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += particleSpeeds[i];
        if (pos[i * 3 + 1] > 3.2) {
          pos[i * 3 + 1] = 0.1;
          pos[i * 3] = (Math.random() - 0.5) * 2.5;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
      }
      steamSystem.geometry.attributes.position.needsUpdate = true;

      saffronPointLight.intensity = 40 + Math.sin(elapsedTime * 3) * 8;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchmove', onTouchMove);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[550px] overflow-hidden rounded-3xl border border-[#FF9F1C]/20 bg-gradient-to-b from-[#14110F]/90 via-[#0B0908]/95 to-[#0B0908] shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing touch-none" />

      {/* Hero Ambient Glow Overlays */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-[#FF9F1C]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-[#E71D36]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating HUD: Title Badges */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 flex flex-col gap-1 pointer-events-none pr-4">
        <span className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-[#FF9F1C] flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#FF9F1C] animate-ping" />
          VIT Pune Real-Time DBMS Telemetry
        </span>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-syne text-white tracking-tight drop-shadow-md">
          Craving Clock™ Platter 3D
        </h2>
        <p className="text-[11px] sm:text-xs text-neutral-400 max-w-xs sm:max-w-sm hidden xs:block">
          Interactive WebGL Indian Thali with spring physics. Drag or move cursor to tilt platter and observe live katoris.
        </p>
      </div>

      {/* Responsive Meal Windows Selector HUD */}
      <div className="absolute bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-6 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl glass-panel-elevated">
        <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5 justify-between sm:justify-start">
          <span className="text-[#FF9F1C] font-bold">ACTIVE MEAL WINDOW:</span>
          <span className="sm:hidden text-white font-bold">{activeSlot}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full sm:w-auto">
          {[
            { slot: 'Breakfast' as MealSlot, time: '07:30–10:30', emoji: '☕' },
            { slot: 'Lunch' as MealSlot, time: '12:00–15:00', emoji: '🍛' },
            { slot: 'Snacks' as MealSlot, time: '16:30–18:30', emoji: '🥪' },
            { slot: 'Dinner' as MealSlot, time: '19:30–22:30', emoji: '🍲' }
          ].map((item) => {
            const isActive = activeSlot === item.slot;
            return (
              <button
                key={item.slot}
                onClick={() => onSlotSelect(item.slot)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF9F1C] to-[#E71D36] text-white shadow-lg shadow-[#FF9F1C]/25 scale-[1.02] font-bold'
                    : 'bg-[#14110F]/80 text-neutral-300 hover:bg-[#1E1916] hover:text-[#FF9F1C] border border-white/5'
                }`}
              >
                <span className="text-sm">{item.emoji}</span>
                <div className="text-left">
                  <div className="leading-tight text-[11px] sm:text-xs">{item.slot}</div>
                  <div className="text-[9px] sm:text-[10px] font-mono opacity-75">{item.time}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
