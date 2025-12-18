import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./styles/ModelShowcase.module.css";
import modelUrl from "../assets/3dmodels/pileofpapers.glb";

const ModelShowcase: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number | null>(null);
const baseRotation = useRef({ x: 45, y: 10, z: Math.PI / -100 });
  const targetRotation = useRef({ x: 50, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x0f1124, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.2, 4);

    const ambient = new THREE.HemisphereLight(0xbfd7ff, 0x0a0c16, 0.9);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 2);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0x68e2c2, 0.6);
    rim.position.set(-3, 2, -2);
    scene.add(rim);

    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);

      model.position.sub(center);
      model.scale.setScalar(maxDim > 0 ? 2.4 / maxDim : 1);

      scene.add(model);
      modelRef.current = model;
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      frameRef.current = window.requestAnimationFrame(animate);

      if (modelRef.current) {
        currentRotation.current.y +=
          (targetRotation.current.y - currentRotation.current.y) * 1.00;
        currentRotation.current.x +=
          (targetRotation.current.x - currentRotation.current.x) * 0.08;

        modelRef.current.rotation.set(
          baseRotation.current.x + currentRotation.current.x,
          baseRotation.current.y + currentRotation.current.y,
          baseRotation.current.z
        );
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("resize", resize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height + viewport;
      const progress = (viewport - rect.top) / total;
      const clamped = Math.min(Math.max(progress, 0), 1);

      targetRotation.current.y = clamped * Math.PI * 2;
      targetRotation.current.x = clamped * 0.2 - 0.1;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.content}>
        <h2 className={styles.title}>GradCraft, built for your first step.</h2>
        <p className={styles.description}>
          GradCraft helps recent grads land that first entry role and connect with recruiters,
          while staying free for everyone to use.
        </p>
      </div>
      <div
        className={styles.viewer}
        ref={mountRef}
        role="img"
        aria-label="3D model preview"
      />
    </section>
  );
};

export default ModelShowcase;
