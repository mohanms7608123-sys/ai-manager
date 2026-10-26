'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Trash2, 
  Download, 
  Box, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Cpu,
  Building2,
  DollarSign,
  Clock,
  Zap,
  Award,
  RefreshCw,
  Sun,
  Moon,
  Grid,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { formatIndianRupee } from '@/lib/dbStore';

const SAMPLE_PROMPT = "Design a modern G+4 commercial office building with basement parking, glass curtain walls, reinforced concrete structure, electrical layout, plumbing system, HVAC, rooftop solar panels, elevators, landscape, parking area and fire safety system.";

const LOADING_STEPS = [
  "Analyzing Architectural Requirements...",
  "Generating Structural Concrete Grid...",
  "Synthesizing Floor Plans & Elevator Core...",
  "Rendering Glass Curtain Wall Facade...",
  "Modeling HVAC & Rooftop Solar Array...",
  "Assembling Basement Parking & Vehicles...",
  "Calculating Material Quantities & Budget...",
  "3D BIM Model Synthesis Complete."
];

// --- 3D CANVAS COMPONENT (Three.js WebGL Renderer with ResizeObserver) ---
function Building3DViewer({ 
  hasGenerated,
  buildingConfig, 
  activeLayers 
}: { 
  hasGenerated: boolean;
  buildingConfig: any; 
  activeLayers: Record<string, boolean>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [lightingMode, setLightingMode] = useState<'Daylight' | 'Cyberpunk' | 'Studio'>('Daylight');

  useEffect(() => {
    if (!mountRef.current) return;
    const THREE = require('three');
    const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls.js');

    const getDimensions = () => {
      if (!mountRef.current) return { width: 800, height: 600 };
      const rect = mountRef.current.getBoundingClientRect();
      return {
        width: Math.max(rect.width, 300),
        height: Math.max(rect.height, 400)
      };
    };

    const { width, height } = getDimensions();

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgHex = lightingMode === 'Cyberpunk' ? '#060814' : lightingMode === 'Studio' ? '#0f172a' : '#04060d';
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.008);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(38, 32, 45);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls (Rotate, Zoom, Pan)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.01; // Keep above ground plane
    controls.target.set(0, 8, 0);
    controlsRef.current = controls;

    // 5. Lighting Setup based on Lighting Theme
    const ambientIntensity = lightingMode === 'Studio' ? 1.2 : lightingMode === 'Cyberpunk' ? 0.4 : 0.9;
    const ambientLight = new THREE.AmbientLight('#ffffff', ambientIntensity);
    scene.add(ambientLight);

    const mainLightColor = lightingMode === 'Cyberpunk' ? '#00f0ff' : '#ffffff';
    const mainLight = new THREE.DirectionalLight(mainLightColor, 1.4);
    mainLight.position.set(40, 60, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLightColor = lightingMode === 'Cyberpunk' ? '#ff007f' : '#38bdf8';
    const fillLight = new THREE.DirectionalLight(fillLightColor, lightingMode === 'Cyberpunk' ? 1.2 : 0.6);
    fillLight.position.set(-30, 25, -30);
    scene.add(fillLight);

    // Ground Grid Helper
    const gridColor1 = lightingMode === 'Cyberpunk' ? '#00f0ff' : '#38bdf8';
    const gridColor2 = lightingMode === 'Cyberpunk' ? '#ff007f' : '#1e293b';
    const grid = new THREE.GridHelper(100, 50, gridColor1, gridColor2);
    grid.position.y = -0.01;
    scene.add(grid);

    // --- SCENE OBJECTS GENERATION ---
    const buildingGroup = new THREE.Group();

    if (!hasGenerated) {
      // EMPTY STATE: Display interactive spinning 3D Wireframe Architectural Bounding Box
      const boxGeo = new THREE.BoxGeometry(16, 20, 14);
      const wireMat = new THREE.MeshBasicMaterial({ color: '#38bdf8', wireframe: true });
      const placeholderBox = new THREE.Mesh(boxGeo, wireMat);
      placeholderBox.position.set(0, 10, 0);
      buildingGroup.add(placeholderBox);

      // Core Pillar Axis
      const axisGeo = new THREE.CylinderGeometry(0.2, 0.2, 24, 16);
      const axisMat = new THREE.MeshBasicMaterial({ color: '#00f0ff', wireframe: true });
      const axisMesh = new THREE.Mesh(axisGeo, axisMat);
      axisMesh.position.set(0, 10, 0);
      buildingGroup.add(axisMesh);

      // Floor Guide Rings
      for (let ring = 1; ring <= 5; ring++) {
        const ringGeo = new THREE.RingGeometry(8, 8.2, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#3b82f6', side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.position.set(0, ring * 4, 0);
        buildingGroup.add(ringMesh);
      }
    } else {
      // GENERATED MODEL: Full Procedural BIM Building
      const floorCount = buildingConfig.floors || 5;
      const floorHeight = 3.2;
      const bWidth = 20;
      const bDepth = 16;

      // A. Landscape Layer
      if (activeLayers.landscape) {
        const groundGeo = new THREE.PlaneGeometry(85, 85);
        const groundMat = new THREE.MeshStandardMaterial({ 
          color: lightingMode === 'Cyberpunk' ? '#090d1a' : '#0d2818', 
          roughness: 0.8,
          wireframe: isWireframe
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        buildingGroup.add(ground);

        const roadGeo = new THREE.PlaneGeometry(85, 12);
        const roadMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.6, wireframe: isWireframe });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0.01, 32);
        buildingGroup.add(road);

        // Trees
        const treePositions = [[-18, 0, 14], [-18, 0, -14], [18, 0, 14], [18, 0, -14], [-22, 0, 0], [22, 0, 0]];
        treePositions.forEach(([tx, ty, tz]) => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8), new THREE.MeshStandardMaterial({ color: '#78350f', wireframe: isWireframe }));
          trunk.position.set(tx, 0.75, tz);
          buildingGroup.add(trunk);

          const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 8), new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.5, wireframe: isWireframe }));
          foliage.position.set(tx, 3, tz);
          buildingGroup.add(foliage);
        });
      }

      // B. Basement & Parking Layer
      if (activeLayers.parking) {
        const basement = new THREE.Mesh(
          new THREE.BoxGeometry(22, 2.5, 18),
          new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.9, wireframe: isWireframe })
        );
        basement.position.set(0, -1.25, 0);
        buildingGroup.add(basement);

        const carColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#64748b'];
        [[-6, 0.5, 18], [0, 0.5, 18], [6, 0.5, 18], [-7, -0.6, 0], [0, -0.6, 0], [7, -0.6, 0]].forEach(([cx, cy, cz], i) => {
          const car = new THREE.Mesh(
            new THREE.BoxGeometry(2.2, 0.9, 1.2),
            new THREE.MeshStandardMaterial({ color: carColors[i % carColors.length], roughness: 0.3, wireframe: isWireframe })
          );
          car.position.set(cx, cy, cz);
          buildingGroup.add(car);
        });
      }

      // C. Concrete Structure Layer
      if (activeLayers.structure) {
        for (let f = 0; f <= floorCount; f++) {
          const slab = new THREE.Mesh(
            new THREE.BoxGeometry(bWidth + 0.4, 0.4, bDepth + 0.4),
            new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.4, wireframe: isWireframe })
          );
          slab.position.set(0, f * floorHeight + 0.2, 0);
          buildingGroup.add(slab);

          const core = new THREE.Mesh(
            new THREE.BoxGeometry(4, floorHeight, 4),
            new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.6, wireframe: isWireframe })
          );
          core.position.set(0, f * floorHeight + floorHeight / 2, 0);
          buildingGroup.add(core);

          if (f < floorCount) {
            [
              [-bWidth/2 + 0.6, -bDepth/2 + 0.6], [-bWidth/2 + 0.6, bDepth/2 - 0.6],
              [bWidth/2 - 0.6, -bDepth/2 + 0.6], [bWidth/2 - 0.6, bDepth/2 - 0.6],
              [0, -bDepth/2 + 0.6], [0, bDepth/2 - 0.6],
              [-bWidth/2 + 0.6, 0], [bWidth/2 - 0.6, 0]
            ].forEach(([cx, cz]) => {
              const col = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, floorHeight, 8),
                new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5, wireframe: isWireframe })
              );
              col.position.set(cx, f * floorHeight + floorHeight / 2 + 0.2, cz);
              buildingGroup.add(col);
            });
          }
        }
      }

      // D. Glass Curtain Wall Facade Layer
      if (activeLayers.facade) {
        const glassHeight = floorCount * floorHeight;
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: lightingMode === 'Cyberpunk' ? '#00f0ff' : '#0284c7',
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
          metalness: 0.9,
          wireframe: isWireframe
        });
        const glassBuilding = new THREE.Mesh(new THREE.BoxGeometry(bWidth, glassHeight, bDepth), glassMat);
        glassBuilding.position.set(0, glassHeight / 2 + 0.2, 0);
        buildingGroup.add(glassBuilding);

        const frameMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, wireframe: isWireframe });
        for (let f = 0; f < floorCount; f++) {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.1, 0.15, bDepth + 0.1), frameMat);
          frame.position.set(0, f * floorHeight + 1.6, 0);
          buildingGroup.add(frame);
        }
      }

      // E. Rooftop Solar & HVAC Layer
      if (activeLayers.roof) {
        const roofY = floorCount * floorHeight + 0.4;
        const garden = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth - 1, 0.15, bDepth - 1),
          new THREE.MeshStandardMaterial({ color: '#16a34a', wireframe: isWireframe })
        );
        garden.position.set(0, roofY + 0.08, 0);
        buildingGroup.add(garden);

        for (let i = 0; i < 3; i++) {
          const chiller = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.4, 1.8),
            new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8, wireframe: isWireframe })
          );
          chiller.position.set(-6 + i * 3.5, roofY + 0.8, -4);
          buildingGroup.add(chiller);
        }

        const solarMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', metalness: 0.9, wireframe: isWireframe });
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            const panel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 1.2), solarMat);
            panel.position.set(-4 + c * 2.6, roofY + 0.5, 2 + r * 1.8);
            panel.rotation.x = -Math.PI / 12;
            buildingGroup.add(panel);
          }
        }
      }
    }

    scene.add(buildingGroup);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!hasGenerated && buildingGroup) {
        buildingGroup.rotation.y += 0.005; // Idle spin for empty state
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6. Dynamic Auto-Resize Handling (ResizeObserver)
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      const w = Math.max(rect.width, 100);
      const h = Math.max(rect.height, 100);

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(mountRef.current);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [hasGenerated, buildingConfig, activeLayers, isWireframe, lightingMode]);

  // Reset Camera Helper
  const handleResetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(38, 32, 45);
      controlsRef.current.target.set(0, 8, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[500px] flex-1 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#050711]' : ''} rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#050711] flex flex-col`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full flex-1 block overflow-hidden cursor-grab active:cursor-grabbing" />

      {/* EMPTY STATE OVERLAY (Mandated Requirement 10) */}
      {!hasGenerated && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/20 backdrop-blur-[2px]">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-2 max-w-sm pointer-events-auto">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
              <Box className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              Generate a 3D model to begin.
            </h3>
            <p className="text-[11px] text-white/60 font-mono">
              Describe your architectural requirements in the prompt box on the left and click &quot;Generate 3D Model&quot;.
            </p>
          </div>
        </div>
      )}

      {/* TOP 3D TOOLBAR (Mandated Requirement 9) */}
      <div className="absolute top-4 right-4 flex flex-wrap items-center gap-2 z-20">
        <button 
          onClick={handleResetCamera}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-white/20 rounded-xl text-cyan-300 font-mono text-xs flex items-center space-x-1.5 backdrop-blur-md shadow-lg transition-all"
          title="Reset Camera Target"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Camera</span>
        </button>

        <button 
          onClick={() => setIsWireframe(!isWireframe)}
          className={`p-2 rounded-xl text-xs font-mono border backdrop-blur-md shadow-lg transition-all flex items-center space-x-1.5 ${
            isWireframe ? 'bg-cyan-500 text-black font-bold border-cyan-400' : 'bg-slate-900/90 text-white border-white/20 hover:bg-slate-800'
          }`}
          title="Toggle Wireframe Structural Skeleton"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isWireframe ? 'Shaded' : 'Wireframe'}</span>
        </button>

        <button 
          onClick={() => setLightingMode(l => l === 'Daylight' ? 'Cyberpunk' : l === 'Cyberpunk' ? 'Studio' : 'Daylight')}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-white/20 rounded-xl text-yellow-300 font-mono text-xs flex items-center space-x-1.5 backdrop-blur-md shadow-lg transition-all"
          title="Toggle Lighting Theme"
        >
          {lightingMode === 'Daylight' ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
          <span className="hidden sm:inline">{lightingMode}</span>
        </button>

        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-white/20 rounded-xl text-white backdrop-blur-md transition-all shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM CAMERA HINT OVERLAY */}
      <div className="absolute bottom-4 left-4 bg-slate-950/85 border border-cyan-500/30 rounded-xl px-3 py-2 backdrop-blur-md text-[10px] text-white/70 font-mono space-y-0.5 z-20 pointer-events-none">
        <span className="text-cyan-400 font-bold uppercase block">Interactive BIM CAD View</span>
        <p className="hidden sm:block">• Left Click: Rotate • Scroll: Zoom • Right Click: Pan</p>
      </div>
    </div>
  );
}

// --- MAIN AI TEXT TO 3D GENERATOR COMPONENT ---
export default function AiTextTo3DGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Active Layers Toggle State
  const [activeLayers, setActiveLayers] = useState({
    facade: true,
    structure: true,
    roof: true,
    parking: true,
    landscape: true
  });

  // Building Output Parameters State
  const [buildingConfig, setBuildingConfig] = useState({
    name: 'Modern G+4 Commercial Office Building',
    floors: 5,
    totalArea: 48500,
    estimatedCost: 245000000,
    estimatedTime: 14,
    sustainabilityScore: 94,
    materials: [
      { name: 'Fe550 High-Grade Steel Rebars', qty: '380 Tons' },
      { name: 'M40 Ready-Mix Structural Concrete', qty: '2,400 m³' },
      { name: 'Double-Glazed Low-E Tinted Glass', qty: '1,850 m²' },
      { name: 'Rooftop Solar PV Panels (400W)', qty: '120 Units' },
      { name: 'HVAC Central Chiller Units', qty: '4 Units' }
    ],
    recommendations: [
      'Orient glass curtain wall facade North-South to reduce solar heat gain by 18%.',
      'Implement rainwater harvesting tanks under basement parking lot.',
      'Utilize fly-ash concrete mix to improve structural durability and earn +8 LEED points.'
    ]
  });

  const handleInsertSample = () => {
    setPrompt(SAMPLE_PROMPT);
  };

  const handleClear = () => {
    setPrompt('');
    setHasGenerated(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCurrentStepIndex(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setCurrentStepIndex(i);
      await new Promise(res => setTimeout(res, 350));
    }

    let detectedFloors = 5;
    if (prompt.toLowerCase().includes('g+2') || prompt.toLowerCase().includes('3 floor')) detectedFloors = 3;
    if (prompt.toLowerCase().includes('g+6') || prompt.toLowerCase().includes('7 floor')) detectedFloors = 7;
    if (prompt.toLowerCase().includes('g+8') || prompt.toLowerCase().includes('9 floor')) detectedFloors = 9;

    setBuildingConfig(prev => ({
      ...prev,
      floors: detectedFloors,
      totalArea: detectedFloors * 9700,
      estimatedCost: detectedFloors * 49000000,
      estimatedTime: Math.round(detectedFloors * 2.8)
    }));

    setHasGenerated(true);
    setIsGenerating(false);
  };

  // PDF Report Exporter
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(7, 11, 25);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(18);
    doc.text('AI SMART CONSTRUCTION MANAGER', 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('AI TEXT TO 3D BUILDING GENERATION REPORT', 15, 30);

    doc.setDrawColor(56, 189, 248);
    doc.line(15, 35, 195, 35);

    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 15, 45);
    doc.text(`Building Name: ${buildingConfig.name}`, 15, 52);
    doc.text(`Floors: G+4 (${buildingConfig.floors} Above Ground + Basement)`, 15, 59);
    doc.text(`Total Built-Up Area: ${buildingConfig.totalArea.toLocaleString()} sq ft`, 15, 66);
    doc.text(`Estimated Budget: ${formatIndianRupee(buildingConfig.estimatedCost)}`, 15, 73);
    doc.text(`Estimated Construction Time: ${buildingConfig.estimatedTime} Months`, 15, 80);

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(12);
    doc.text('MATERIAL ESTIMATES:', 15, 102);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    buildingConfig.materials.forEach((m, idx) => {
      doc.text(`• ${m.name}: ${m.qty}`, 20, 112 + idx * 7);
    });

    doc.save(`${buildingConfig.name.replace(/\s+/g, '_')}_BIM_Report.pdf`);
  };

  // 3D Model Exporters (GLB, OBJ, STL downloads)
  const handleExport3D = (format: 'GLB' | 'OBJ' | 'STL') => {
    const dummyContent = `# AI Smart Construction Manager 3D Export
# Building: ${buildingConfig.name}
# Format: ${format}
# Generated: ${new Date().toISOString()}
v -10.000000 0.000000 8.000000
v 10.000000 0.000000 8.000000
v -10.000000 16.000000 8.000000
v 10.000000 16.000000 8.000000
f 1 2 4 3
`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${buildingConfig.name.replace(/\s+/g, '_')}_Model.${format.toLowerCase()}`;
    link.click();
  };

  return (
    <div className="w-full flex flex-col space-y-4 text-slate-100 font-sans min-h-[calc(100vh-100px)]">
      {/* HEADER BAR */}
      <div className="glass-panel p-4 rounded-2xl border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wider text-white">🏗 AI Text to 3D Building Generator</h1>
            <p className="text-[11px] text-white/60">
              Synthesize 3D BIM models from natural language architectural prompts with AI cost & material analysis.
            </p>
          </div>
        </div>

        {/* LAYER TOGGLES TOOLBAR (When Generated) */}
        {hasGenerated && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            {Object.entries({
              facade: 'Glass Facade',
              structure: 'Concrete Frame',
              roof: 'Roof Solar & HVAC',
              parking: 'Basement & Vehicles',
              landscape: 'Landscape & Trees'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 text-[10px]">
                <input
                  type="checkbox"
                  checked={activeLayers[key as keyof typeof activeLayers]}
                  onChange={(e) => setActiveLayers(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="accent-cyan-500"
                />
                <span className="text-white/80">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* CAD/BIM SPLIT VIEW LAYOUT: PROMPT PANEL (LEFT) + 3D VIEWER (RIGHT) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[600px]">
        
        {/* LEFT PANEL: PROMPT FORM & EXPORT CONTROLS (Cols 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 flex-1 flex flex-col justify-between border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Architectural Prompt *</span>
                </label>
                <button 
                  type="button" 
                  onClick={handleInsertSample}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold underline"
                >
                  + Sample Prompt
                </button>
              </div>

              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your building (e.g. Design a modern G+4 commercial office building with basement parking, glass curtain walls, rooftop solar panels, HVAC...)"
                className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500/60 rounded-xl p-3.5 text-white text-xs leading-relaxed focus:outline-none font-mono"
              />

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-wider"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 3D Model</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleClear}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-xl transition-colors"
                  title="Clear Prompt & Scene"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>

            {/* EXPORT TOOLBAR */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <span className="text-[10px] font-mono text-white/40 uppercase block font-bold">Model Export Options</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!hasGenerated}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-xl font-bold text-xs transition-all disabled:opacity-40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>

                <button
                  onClick={() => handleExport3D('GLB')}
                  disabled={!hasGenerated}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export GLB</span>
                </button>

                <button
                  onClick={() => handleExport3D('OBJ')}
                  disabled={!hasGenerated}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 rounded-xl font-bold text-xs transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export OBJ</span>
                </button>

                <button
                  onClick={() => handleExport3D('STL')}
                  disabled={!hasGenerated}
                  className="flex items-center justify-center space-x-1.5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl font-bold text-xs transition-all disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export STL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 3D MODEL VIEWER CANVAS (Cols 8) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[550px]">
          <Building3DViewer hasGenerated={hasGenerated} buildingConfig={buildingConfig} activeLayers={activeLayers} />
        </div>
      </div>

      {/* ANIMATED PROCESSING MODAL */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-lg">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-white text-base uppercase tracking-wider">AI Architectural Processing</h3>
                <p className="text-white/50 text-[11px]">Synthesizing parametric 3D BIM geometry from prompt...</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 font-mono">
                {LOADING_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded-xl text-[11px] transition-all ${
                        isDone ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-bold' :
                        isCurrent ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 font-bold animate-pulse' :
                        'text-white/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                      {isDone && <span className="text-[9px] text-emerald-400 uppercase font-bold">Done</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* METRICS & MATERIAL BREAKDOWN CARDS (When Generated) */}
      {hasGenerated && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-white/40 font-mono uppercase block">Built-Up Area</span>
              <p className="text-xl font-extrabold text-white">{buildingConfig.totalArea.toLocaleString()} <span className="text-xs text-cyan-400 font-normal">sq ft</span></p>
              <span className="text-[10px] text-cyan-400 font-mono block">G+4 (5 Floors + Basement)</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-white/40 font-mono uppercase block">Estimated Budget</span>
              <p className="text-xl font-extrabold text-yellow-400">{formatIndianRupee(buildingConfig.estimatedCost)}</p>
              <span className="text-[10px] text-yellow-400/80 font-mono block">Turnkey Material & Labor</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-white/40 font-mono uppercase block">Schedule</span>
              <p className="text-xl font-extrabold text-white">{buildingConfig.estimatedTime} <span className="text-xs text-purple-400 font-normal">Months</span></p>
              <span className="text-[10px] text-purple-400 font-mono block">Fast-Track Timeline</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-white/40 font-mono uppercase block">LEED Rating</span>
              <p className="text-xl font-extrabold text-emerald-400">{buildingConfig.sustainabilityScore} <span className="text-xs font-normal text-emerald-300">/ 100</span></p>
              <span className="text-[10px] text-emerald-400 font-mono block">LEED Gold Certified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
