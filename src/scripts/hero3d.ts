import * as THREE from 'three';

export interface Hero3DOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
}

export function initHero3D({ canvas, container }: Hero3DOptions): (() => void) | undefined {
  // Check if reduced motion or low-end device
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  // Scene setup
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  // WebGL Renderer
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isCoarse,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    console.warn('WebGL not supported or context lost:', e);
    return undefined;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // ══════════════ CLEAN STUDIO LIGHTING (White Canvas Calibration) ══════════════
  const ambientLight = new THREE.AmbientLight(0xffffff, 3.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
  keyLight.position.set(5, 8, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
  fillLight.position.set(-5, -4, 4);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
  backLight.position.set(0, 5, -5);
  scene.add(backLight);

  // ══════════════ LIGHTWEIGHT & SUBTLE 3D MATERIALS ══════════════
  // 1. Soft Silver-Graphite Wireframe Line Material (Subtle, Light & Elegant)
  const softLineMaterial = new THREE.LineBasicMaterial({
    color: 0xd4d4d8,
    transparent: true,
    opacity: 0.16,
  });

  // 2. Finer Hairline Sub-Wireframe (Very faint)
  const hairlineLineMaterial = new THREE.LineBasicMaterial({
    color: 0xe4e4e7,
    transparent: true,
    opacity: 0.12,
  });

  // 3. Ethereal Frosted Glass (Luminous white, ultra low opacity)
  const frostedGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.5,
    roughness: 0.25,
    metalness: 0.02,
    transmission: 0.95,
    ior: 1.1,
    thickness: 0.35,
    transparent: true,
    opacity: 0.15,
  });

  // 4. Subtle Light Grey / White Accent Material (Soft & low contrast)
  const lightGreyMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    emissive: 0xffffff,
    emissiveIntensity: 0.4,
    roughness: 0.5,
    metalness: 0.05,
    transparent: true,
    opacity: 0.22,
  });

  // 5. Signature Brand Accent Material (Soft, desaturated pastel lime accent)
  const brandAccentMaterial = new THREE.MeshBasicMaterial({
    color: 0x8af334,
    transparent: true,
    opacity: 0.35,
  });

  // ══════════════ SCULPTURE ASSEMBLY ══════════════
  const group = new THREE.Group();
  scene.add(group);

  const updateGroupPosition = () => {
    const isWide = container.clientWidth > 960;
    group.position.x = isWide ? 1.9 : 0;
    group.position.y = isWide ? 0.05 : -0.2;
    group.scale.setScalar(isWide ? 1.05 : 0.85);
  };
  updateGroupPosition();

  // 1. Central Architectural Torus Knot (Light frosted glass + soft wireframe)
  const torusGeo = new THREE.TorusKnotGeometry(1.5, 0.20, 120, 24, 2, 3);
  const torusMesh = new THREE.Mesh(torusGeo, frostedGlassMaterial);
  group.add(torusMesh);

  const torusWireGeo = new THREE.WireframeGeometry(torusGeo);
  const torusWire = new THREE.LineSegments(torusWireGeo, softLineMaterial);
  torusMesh.add(torusWire);

  // 2. Floating Concentric Orbiting Rings (Subtle light grey lines)
  const ring1Geo = new THREE.TorusGeometry(2.1, 0.012, 16, 100);
  const ring1 = new THREE.Mesh(ring1Geo, lightGreyMaterial);
  ring1.rotation.x = Math.PI / 3;
  group.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(2.4, 0.01, 16, 100);
  const ring2 = new THREE.Mesh(ring2Geo, lightGreyMaterial);
  ring2.rotation.y = Math.PI / 4;
  ring2.rotation.z = Math.PI / 6;
  group.add(ring2);

  // 3. Central Core: Geometric Icosahedron with neural node points
  const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
  const coreWireGeo = new THREE.WireframeGeometry(coreGeo);
  const coreWire = new THREE.LineSegments(coreWireGeo, hairlineLineMaterial);
  group.add(coreWire);

  // Node dots on key points
  const nodeGeo = new THREE.SphereGeometry(0.035, 12, 12);
  const nodesGroup = new THREE.Group();
  group.add(nodesGroup);

  const positions = coreGeo.attributes.position;
  const numVertices = positions.count;
  for (let i = 0; i < numVertices; i += 4) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);

    const mat = i === 0 ? brandAccentMaterial : lightGreyMaterial;
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.set(x, y, z);
    nodesGroup.add(node);
  }

  // 4. Floating Minimalist Orbiting Nodes
  const satellites: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const satGeo = new THREE.SphereGeometry(i === 0 ? 0.05 : 0.035, 16, 16);
    const satMesh = new THREE.Mesh(satGeo, i === 0 ? brandAccentMaterial : lightGreyMaterial);
    group.add(satMesh);
    satellites.push({
      mesh: satMesh,
      angle: (i * Math.PI * 2) / 3,
      speed: 0.008 + i * 0.004,
      radius: 2.2 + i * 0.35,
      y: (i - 1) * 0.5,
    });
  }

  // 5. Monochromatic Ambient Micro-Particles (Soft & Faint)
  const particleCount = 65;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 12;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 8;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xd4d4d8,
    size: 0.016,
    transparent: true,
    opacity: 0.10,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ══════════════ MOUSE INTERACTION & LERP ══════════════
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  const onMouseMove = (e: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // ══════════════ RESIZE HANDLER ══════════════
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      updateGroupPosition();
    }, 100);
  };

  window.addEventListener('resize', onResize);

  // ══════════════ ANIMATION LOOP ══════════════
  let animId: number | null = null;
  let isRunning = true;
  let clock = new THREE.Clock();

  const animate = () => {
    if (!isRunning) return;
    animId = requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    if (!prefersReduced) {
      // Rotation
      torusMesh.rotation.x += 0.003;
      torusMesh.rotation.y += 0.004;

      ring1.rotation.x += 0.002;
      ring1.rotation.y += 0.003;

      ring2.rotation.y -= 0.002;
      ring2.rotation.z += 0.002;

      coreWire.rotation.x -= 0.004;
      coreWire.rotation.y += 0.005;
      nodesGroup.rotation.copy(coreWire.rotation);

      // Satellites
      satellites.forEach((sat) => {
        sat.angle += sat.speed;
        sat.mesh.position.x = Math.cos(sat.angle) * sat.radius;
        sat.mesh.position.z = Math.sin(sat.angle) * sat.radius;
        sat.mesh.position.y = sat.y + Math.sin(elapsedTime * 1.5 + sat.radius) * 0.2;
      });

      // Subtle breathing float on whole group
      group.position.y += (Math.sin(elapsedTime * 0.8) * 0.08 - (group.position.y - (container.clientWidth > 960 ? 0.05 : -0.2))) * 0.04;

      // Mouse responsive tilt
      group.rotation.y = mouse.x * 0.45;
      group.rotation.x = -mouse.y * 0.35;
    }

    if (renderer) {
      renderer.render(scene, camera);
    }
  };

  animate();

  // Cleanup
  return () => {
    isRunning = false;
    if (animId !== null) cancelAnimationFrame(animId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    if (renderer) {
      renderer.dispose();
      renderer = null;
    }
  };
}
