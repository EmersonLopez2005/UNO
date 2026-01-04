
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PosterStyle } from '../types';

interface ThreePreviewProps {
  modelUrl?: string;
  patternUrl?: string;
  style: PosterStyle;
  lang: 'en' | 'zh';
}

export interface ThreePreviewHandle {
  getSnapshot: () => string | undefined;
}

const ThreePreview = forwardRef<ThreePreviewHandle, ThreePreviewProps>(({ modelUrl, patternUrl, style, lang }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    model?: THREE.Group;
    controls: OrbitControls;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      if (!sceneRef.current) return undefined;
      // Force a render before snapshot to ensure current frame
      sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
      return sceneRef.current.renderer.domElement.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    // preserveDrawingBuffer is required to take snapshots via toDataURL
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    camera.position.set(4, 2, 4);
    controls.update();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);

    // Style Specific Environment
    if (style === 'LAUNCH') {
      scene.background = new THREE.Color(0x0a0a0a);
      const grid = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
      scene.add(grid);
    } else {
      scene.background = new THREE.Color(0x000000);
      const pointLight = new THREE.PointLight(0xff007f, 5, 50);
      pointLight.position.set(-5, 2, 0);
      scene.add(pointLight);
    }

    sceneRef.current = { scene, camera, renderer, controls };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [style]);

  useEffect(() => {
    if (!modelUrl || !sceneRef.current) return;
    
    setLoading(true);
    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      if (sceneRef.current?.model) {
        sceneRef.current.scene.remove(sceneRef.current.model);
      }
      const model = gltf.scene;
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / maxDim;
      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      model.position.y = 0;

      sceneRef.current!.scene.add(model);
      sceneRef.current!.model = model;
      setLoading(false);

      if (patternUrl) applyPattern(patternUrl);
    }, undefined, (err) => {
      console.error("3D Load Error", err);
      setLoading(false);
    });
  }, [modelUrl]);

  useEffect(() => {
    if (patternUrl) applyPattern(patternUrl);
  }, [patternUrl]);

  const applyPattern = (url: string) => {
    if (!sceneRef.current?.model) return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, (texture) => {
      texture.flipY = false;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      sceneRef.current!.model!.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.map = texture;
            mat.needsUpdate = true;
          }
        }
      });
    });
  };

  return (
    <div className="relative w-full h-[400px] bg-black rounded-2xl overflow-hidden border border-white/5">
      <div ref={containerRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border border-white/10 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} shadow-neon`}></span>
          {lang === 'zh' ? (loading ? '同步中' : '3D 实时预览') : (loading ? 'SYNCING' : 'LIVE 3D PREVIEW')}
        </div>
      </div>

      {!modelUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 bg-black/40 backdrop-blur-sm">
          <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '请上传 3D 模型 (.glb)' : 'UPLOAD 3D MODEL (.glb)'}</span>
        </div>
      )}
    </div>
  );
});

export default ThreePreview;
