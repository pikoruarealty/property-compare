import { useEffect, useRef } from "react";
import * as THREE from "three";

const CITIES = [
  { name: "Ahmedabad", lat: 23.03, lng: 72.58 },
  { name: "Dubai", lat: 25.2, lng: 55.27 },
  { name: "London", lat: 51.51, lng: -0.13 },
  { name: "Mumbai", lat: 19.08, lng: 72.88 },
  { name: "Singapore", lat: 1.35, lng: 103.82 },
  { name: "Sydney", lat: -33.87, lng: 151.21 },
  { name: "New York", lat: 40.71, lng: -74.0 },
  { name: "Tokyo", lat: 35.68, lng: 139.65 },
];

const ARCS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 2],
  [1, 5],
  [2, 6],
  [4, 7],
];

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export interface PinScreenPos {
  name: string;
  x: number;
  y: number;
  visible: boolean;
  opacity: number;
}

interface Props {
  size?: number;
  pinPositionsRef?: React.MutableRefObject<PinScreenPos[]>;
}

export function EarthGlobe({ size = 380, pinPositionsRef }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pinsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // WebGL check
    const testCanvas = document.createElement("canvas");
    if (!testCanvas.getContext("webgl")) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = 0.22;
    earthGroup.rotation.y = 4.45;
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const dayTex = loader.load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
      (t) => {
        if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
        earthMat.needsUpdate = true;
      },
    );
    const nightTex = loader.load(
      "https://threejs.org/examples/textures/planets/earth_lights_2048.png",
      (t) => {
        if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
        earthMat.needsUpdate = true;
      },
    );
    const specTex = loader.load(
      "https://threejs.org/examples/textures/planets/earth_specular_2048.jpg",
      () => {
        earthMat.needsUpdate = true;
      },
    );
    const cloudsTex = loader.load(
      "https://threejs.org/examples/textures/planets/earth_clouds_1024.png",
      (t) => {
        if ("colorSpace" in t) t.colorSpace = THREE.SRGBColorSpace;
        cloudMat.needsUpdate = true;
      },
    );

    const earthGeo = new THREE.SphereGeometry(1, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: dayTex,
      bumpMap: specTex,
      bumpScale: 0.015,
      specularMap: specTex,
      specular: new THREE.Color(0x6688aa),
      shininess: 18,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    void nightTex;

    const cloudGeo = new THREE.SphereGeometry(1.01, 48, 48);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudsTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(clouds);

    // Atmosphere halo — soft light blue rim
    const atmGeo = new THREE.SphereGeometry(1.22, 48, 48);
    const atmMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.75 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.4);
          gl_FragColor = vec4(0.55, 0.78, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    // Lights — bright daylight feel
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(3, 2, 4);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xbfd9ff, 0.6);
    fill.position.set(-4, -1, -2);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    // Arcs
    const arcObjects: THREE.Line[] = [];
    ARCS.forEach(([a, b]) => {
      const va = latLngToVector3(CITIES[a].lat, CITIES[a].lng, 1.005);
      const vb = latLngToVector3(CITIES[b].lat, CITIES[b].lng, 1.005);
      const mid = va.clone().add(vb).multiplyScalar(0.5);
      const dist = va.distanceTo(vb);
      mid.normalize().multiplyScalar(1 + dist * 0.4);
      const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
      const points = curve.getPoints(50);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0xffb347,
        transparent: true,
        opacity: 0.5,
      });
      const line = new THREE.Line(geo, mat);
      earthGroup.add(line);
      arcObjects.push(line);
    });

    // City pins (HTML)
    const pinEls: HTMLDivElement[] = [];
    CITIES.forEach((c) => {
      const el = document.createElement("div");
      el.className = "city-pin";
      el.dataset.name = c.name;
      mount.appendChild(el);
      pinEls.push(el);
    });
    pinsRef.current = pinEls;

    const cityVecs = CITIES.map((c) => latLngToVector3(c.lat, c.lng, 1.02));

    let raf = 0;
    const tmp = new THREE.Vector3();
    const worldMatrix = new THREE.Matrix4();

    function updatePins() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      earth.updateMatrixWorld();
      worldMatrix.copy(earth.matrixWorld);
      const positions: PinScreenPos[] = [];
      cityVecs.forEach((v, i) => {
        tmp.copy(v).applyMatrix4(worldMatrix);
        const worldPos = tmp.clone();
        // dot with camera-forward from camera to pin
        const camToPin = worldPos.clone().sub(camera.position).normalize();
        const facing = -camToPin.z; // camera looks toward -z; front hemisphere when facing > 0
        const visible = facing > 0.15;
        const opacity = Math.max(0, Math.min(1, (facing - 0.15) / 0.4));
        const projected = worldPos.clone().project(camera);
        const x = (projected.x * 0.5 + 0.5) * w;
        const y = (-projected.y * 0.5 + 0.5) * h;
        const el = pinEls[i];
        if (visible) {
          el.style.display = "block";
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.style.opacity = String(opacity);
        } else {
          el.style.display = "none";
        }
        positions.push({ name: CITIES[i].name, x, y, visible, opacity });
      });
      if (pinPositionsRef) pinPositionsRef.current = positions;
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      earth.rotation.y += 0.001;
      clouds.rotation.y += 0.0013;
      // rotate arcs+pins with earth: they're on earthGroup so they follow, but pins are HTML — use earth's matrix
      updatePins();
      renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      pinEls.forEach((el) => el.remove());
      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmGeo.dispose();
      atmMat.dispose();
      arcObjects.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      dayTex.dispose();
      nightTex.dispose();
      specTex.dispose();
      cloudsTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [pinPositionsRef]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    />
  );
}
