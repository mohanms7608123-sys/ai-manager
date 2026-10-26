'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Layers, 
  Maximize2, 
  Sun, 
  Moon, 
  Play, 
  Pause, 
  Info, 
  Settings, 
  Ruler, 
  Zap, 
  Droplet, 
  EyeOff, 
  Eye,
  Hammer,
  Lock,
  Unlock,
  AlertTriangle,
  Compass,
  Thermometer,
  Wrench,
  Sparkles,
  Camera,
  FolderOpen,
  Scissors,
  Share2,
  CheckCircle,
  HelpCircle,
  Send,
  Download,
  Save,
  Grid,
  FileText
} from 'lucide-react';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';

// Define the 16 BIM Layers
interface BIMLayer {
  id: string;
  name: string;
  category: 'Core' | 'MEP' | 'IoT & Crew' | 'Site & Logistics';
  visible: boolean;
  color: string;
  highlight: boolean;
  locked: boolean;
  progress: number;
  aiStatus: string;
  warning: boolean;
}

// Parametric Generator Design State
interface GeneratorState {
  buildingType: 'Commercial' | 'Residential' | 'Hospital' | 'Industrial';
  floorCount: number;
  structureType: 'RCC' | 'Steel';
  concreteGrade: string;
  steelGrade: string;
  hasSolar: boolean;
  hasLift: boolean;
  hasPool: boolean;
  hasBasement: boolean;
  costReduction: number; // 0 to 20 percentage
  description: string;
}

// Camera Preset Helper
function CameraController({ position, target }: { position: [number, number, number]; target: [number, number, number] }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    camera.position.set(...position);
    if (controls) {
      (controls as any).target.set(...target);
      (controls as any).update();
    }
  }, [position, target, camera, controls]);
  return null;
}

// Elevator Cabin R3F Animation component
function LiftCabin({ floorHeight, floorCount, explodeFactor }: { floorHeight: number; floorCount: number; explodeFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const maxFloorHeight = (floorCount - 1) * (floorHeight + explodeFactor);
      // Elevate cabin up and down smoothly
      meshRef.current.position.y = (Math.sin(time * 0.5) * 0.5 + 0.5) * maxFloorHeight + 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[2, 0.4, -2]}>
      <boxGeometry args={[0.5, 0.8, 0.5]} />
      <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} />
    </mesh>
  );
}

// Parametric R3F Construction Model
interface ParametricTwinProps {
  state: GeneratorState;
  explodeFactor: number;
  bimLayers: BIMLayer[];
  sectionMode: 'none' | 'horizontal' | 'vertical';
  sectionVal: number;
}

function ParametricTwin({ state, explodeFactor, bimLayers, sectionMode, sectionVal }: ParametricTwinProps) {
  const floorHeight = 2.4;

  const isLayerActive = (id: string) => {
    const layer = bimLayers.find(l => l.id === id);
    return layer ? layer.visible : false;
  };

  const shouldRenderPos = (x: number, y: number) => {
    if (sectionMode === 'horizontal') return y <= sectionVal;
    if (sectionMode === 'vertical') return x <= sectionVal;
    return true;
  };

  // Structural elements color
  const columnColor = state.structureType === 'Steel' ? '#1e3a8a' : '#64748b'; // Metallic blue vs concrete grey

  return (
    <group>
      {/* 1. Ground, Roads & Pool */}
      {isLayerActive('gis') && shouldRenderPos(0, -0.2) && (
        <group>
          {/* Roads */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.19, 8]}>
            <planeGeometry args={[26, 3]} />
            <meshStandardMaterial color="#2d3748" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Ground Swimming Pool */}
      {state.hasPool && isLayerActive('landscape') && shouldRenderPos(-6, 0) && (
        <mesh position={[-6, -0.1, 5]}>
          <boxGeometry args={[4, 0.2, 3]} />
          <meshStandardMaterial color="#0284c7" transparent opacity={0.7} roughness={0.1} />
        </mesh>
      )}

      {/* 2. Basement Level */}
      {state.hasBasement && isLayerActive('structure') && shouldRenderPos(0, -1.0) && (
        <group position={[0, -1.2, 0]}>
          <mesh>
            <boxGeometry args={[10, 0.2, 10]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-4, 0.6, -4]}>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[4, 0.6, 4]}>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}

      {/* 3. Floors Grid */}
      {Array.from({ length: state.floorCount }).map((_, fIdx) => {
        const yOffset = fIdx * (floorHeight + explodeFactor);

        return (
          <group key={fIdx} position={[0, yOffset, 0]}>
            {/* Slab Floor */}
            {isLayerActive('structure') && shouldRenderPos(0, yOffset) && (
              <mesh>
                <boxGeometry args={[8.4, 0.12, 8.4]} />
                <meshStandardMaterial color={state.structureType === 'Steel' ? '#27272a' : '#4b5563'} transparent opacity={0.8} />
              </mesh>
            )}

            {/* Pillars / Columns */}
            {isLayerActive('structure') && shouldRenderPos(-3.6, yOffset + 1.1) && (
              <group>
                <mesh position={[-3.8, 1.2, -3.8]}>
                  <boxGeometry args={state.structureType === 'Steel' ? [0.2, 2.4, 0.2] : [0.35, 2.4, 0.35]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
                <mesh position={[3.8, 1.2, -3.8]}>
                  <boxGeometry args={state.structureType === 'Steel' ? [0.2, 2.4, 0.2] : [0.35, 2.4, 0.35]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
                <mesh position={[-3.8, 1.2, 3.8]}>
                  <boxGeometry args={state.structureType === 'Steel' ? [0.2, 2.4, 0.2] : [0.35, 2.4, 0.35]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
                <mesh position={[3.8, 1.2, 3.8]}>
                  <boxGeometry args={state.structureType === 'Steel' ? [0.2, 2.4, 0.2] : [0.35, 2.4, 0.35]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
              </group>
            )}

            {/* Beams grid */}
            {isLayerActive('structure') && shouldRenderPos(0, yOffset + 2.3) && (
              <group>
                <mesh position={[0, 2.34, -3.8]}>
                  <boxGeometry args={[7.8, 0.16, 0.25]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
                <mesh position={[0, 2.34, 3.8]}>
                  <boxGeometry args={[7.8, 0.16, 0.25]} />
                  <meshStandardMaterial color={columnColor} metalness={state.structureType === 'Steel' ? 0.8 : 0.2} />
                </mesh>
              </group>
            )}

            {/* Partition drywall walls */}
            {isLayerActive('architecture') && shouldRenderPos(0, yOffset + 1.1) && (
              <group>
                <mesh position={[0, 1.1, -1.5]}>
                  <boxGeometry args={[0.08, 2.2, 4]} />
                  <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
                </mesh>
              </group>
            )}

            {/* HVAC System */}
            {isLayerActive('hvac') && shouldRenderPos(0, yOffset + 1.9) && (
              <mesh position={[0, 2.0, 1.5]}>
                <boxGeometry args={[6.8, 0.2, 0.2]} />
                <meshStandardMaterial color="#10b981" metalness={0.7} />
              </mesh>
            )}

            {/* Electric conduits */}
            {isLayerActive('electrical') && shouldRenderPos(2, yOffset + 2.2) && (
              <mesh position={[2, 2.25, -2]}>
                <boxGeometry args={[0.05, 0.05, 4]} />
                <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 4. Roof Details */}
      {isLayerActive('structure') && shouldRenderPos(0, state.floorCount * floorHeight) && (
        <group position={[0, state.floorCount * floorHeight, 0]}>
          <mesh>
            <boxGeometry args={[8.6, 0.15, 8.6]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>

          {/* Roof Solar Panels */}
          {state.hasSolar && isLayerActive('utility') && (
            <group position={[0, 0.12, 0]}>
              <mesh position={[-2, 0, -2]} rotation={[-Math.PI / 8, 0, 0]}>
                <planeGeometry args={[2.5, 1.8]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.1} />
              </mesh>
              <mesh position={[2, 0, -2]} rotation={[-Math.PI / 8, 0, 0]}>
                <planeGeometry args={[2.5, 1.8]} />
                <meshStandardMaterial color="#1e3a8a" roughness={0.1} />
              </mesh>
            </group>
          )}

          {/* Water Tanks */}
          {isLayerActive('utility') && (
            <mesh position={[2.5, 0.6, 2.5]}>
              <cylinderGeometry args={[0.6, 0.6, 1.1]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} />
            </mesh>
          )}
        </group>
      )}

      {/* 5. Lift Shaft Cabin Animation */}
      {state.hasLift && isLayerActive('equipment') && (
        <group>
          {/* Shaft columns */}
          <mesh position={[2, (state.floorCount * floorHeight) / 2, -2]}>
            <boxGeometry args={[0.8, state.floorCount * floorHeight, 0.8]} />
            <meshStandardMaterial color="#cbd5e1" wireframe opacity={0.15} transparent />
          </mesh>
          <LiftCabin floorHeight={floorHeight} floorCount={state.floorCount} explodeFactor={explodeFactor} />
        </group>
      )}
    </group>
  );
}

export default function DigitalTwinPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'explorer' | 'generator'>('generator');
  
  // Parametric Generator State
  const [generatorState, setGeneratorState] = useState<GeneratorState>({
    buildingType: 'Commercial',
    floorCount: 6,
    structureType: 'RCC',
    concreteGrade: 'M40',
    steelGrade: 'Fe500',
    hasSolar: true,
    hasLift: true,
    hasPool: false,
    hasBasement: true,
    costReduction: 0,
    description: `Design a G+5 commercial building.
Ground floor contains parking.
First floor contains reception and office.
Second floor contains conference hall.
Third and fourth floors contain office cabins.
Fifth floor contains cafeteria.
Roof contains solar panels.
Use RCC structure. Concrete grade M40. Steel Fe500.`
  });

  const [explodeFactor, setExplodeFactor] = useState(0);
  const [dayNight, setDayNight] = useState<'day' | 'night'>('day');
  const [sectionMode, setSectionMode] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [sectionVal, setSectionVal] = useState(8);

  const [isGenerating, setIsGenerating] = useState(false);
  const [copilotMsg, setCopilotMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Parametric BIM Generator initialized. You can request model adaptations such as: "Increase height to G+8", "Change structure to steel", "Add swimming pool", or "Add basement parking".' }
  ]);

  // 16 BIM Layers Panel Visibility State
  const [bimLayers, setBimLayers] = useState<BIMLayer[]>([
    { id: 'structure', name: 'Building Structure', category: 'Core', visible: true, color: '#2a3342', highlight: false, locked: false, progress: 100, aiStatus: 'Optimal', warning: false },
    { id: 'architecture', name: 'Architectural Specs', category: 'Core', visible: true, color: '#cbd5e1', highlight: false, locked: false, progress: 95, aiStatus: 'Optimal', warning: false },
    { id: 'electrical', name: 'Electrical conduits', category: 'MEP', visible: true, color: '#facc15', highlight: false, locked: false, progress: 85, aiStatus: 'Optimal', warning: false },
    { id: 'plumbing', name: 'Plumbing Layout', category: 'MEP', visible: true, color: '#2563eb', highlight: false, locked: false, progress: 90, aiStatus: 'Optimal', warning: false },
    { id: 'hvac', name: 'HVAC Ductwork', category: 'MEP', visible: true, color: '#10b981', highlight: false, locked: false, progress: 78, aiStatus: 'Optimal', warning: false },
    { id: 'fire', name: 'Fire Fighting', category: 'MEP', visible: false, color: '#ef4444', highlight: false, locked: false, progress: 100, aiStatus: 'Operational', warning: false },
    { id: 'iot', name: 'IoT Sensors', category: 'IoT & Crew', visible: true, color: '#06b6d4', highlight: false, locked: false, progress: 85, aiStatus: 'Active', warning: false },
    { id: 'workforce', name: 'Workers Placement', category: 'IoT & Crew', visible: false, color: '#f97316', highlight: false, locked: false, progress: 100, aiStatus: 'Active', warning: false },
    { id: 'equipment', name: 'Equipment logs', category: 'IoT & Crew', visible: true, color: '#eab308', highlight: false, locked: false, progress: 100, aiStatus: 'Active', warning: false },
    { id: 'materials', name: 'Materials stock', category: 'Site & Logistics', visible: false, color: '#b45309', highlight: false, locked: false, progress: 80, aiStatus: 'Stocked', warning: false },
    { id: 'roads', name: 'Roads & Bridges', category: 'Site & Logistics', visible: true, color: '#ef4444', highlight: false, locked: false, progress: 100, aiStatus: 'Completed', warning: false },
    { id: 'landscape', name: 'Landscape trees', category: 'Site & Logistics', visible: true, color: '#15803d', highlight: false, locked: false, progress: 100, aiStatus: 'Optimal', warning: false },
    { id: 'utility', name: 'Utilities grid', category: 'Site & Logistics', visible: true, color: '#0f766e', highlight: false, locked: false, progress: 95, aiStatus: 'Synced', warning: false },
    { id: 'analytics', name: 'AI Analytics', category: 'Core', visible: false, color: '#8b5cf6', highlight: false, locked: false, progress: 100, aiStatus: 'Active', warning: false },
    { id: 'vision', name: 'Computer Vision', category: 'IoT & Crew', visible: false, color: '#f43f5e', highlight: false, locked: false, progress: 100, aiStatus: 'Active', warning: false },
    { id: 'gis', name: 'GIS Mapping', category: 'Site & Logistics', visible: true, color: '#0ea5e9', highlight: false, locked: false, progress: 100, aiStatus: 'Synced', warning: false }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      // Analyze prompt keywords
      const descLower = generatorState.description.toLowerCase();
      let floors = 6;
      let structure: 'RCC' | 'Steel' = 'RCC';
      let solar = false;
      let pool = false;
      let basement = false;
      let bType: 'Commercial' | 'Residential' | 'Hospital' | 'Industrial' = 'Commercial';

      if (descLower.includes('g+8') || descLower.includes('8 floors') || descLower.includes('eight floors')) floors = 9;
      else if (descLower.includes('g+10') || descLower.includes('10 floors')) floors = 11;
      else if (descLower.includes('g+5') || descLower.includes('5 floors')) floors = 6;
      else if (descLower.includes('g+12') || descLower.includes('12 floors')) floors = 13;

      if (descLower.includes('steel structure') || descLower.includes('steel frame')) structure = 'Steel';
      if (descLower.includes('solar panel') || descLower.includes('photovoltaic')) solar = true;
      if (descLower.includes('swimming pool') || descLower.includes('pool')) pool = true;
      if (descLower.includes('basement parking') || descLower.includes('basement')) basement = true;
      if (descLower.includes('hospital') || descLower.includes('medical')) bType = 'Hospital';
      else if (descLower.includes('residential') || descLower.includes('apartment')) bType = 'Residential';

      setGeneratorState(prev => ({
        ...prev,
        floorCount: floors,
        structureType: structure,
        hasSolar: solar,
        hasPool: pool,
        hasBasement: basement,
        buildingType: bType
      }));

      setIsGenerating(false);
    }, 1500);
  };

  const handleSendCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotMsg.trim()) return;

    const userText = copilotMsg;
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setCopilotMsg('');

    setIsGenerating(true);
    setTimeout(() => {
      const textLower = userText.toLowerCase();
      let reply = 'BIM Model regenerated successfully based on prompt variables.';

      setGeneratorState(prev => {
        let floors = prev.floorCount;
        let structure = prev.structureType;
        const solar = prev.hasSolar;
        let pool = prev.hasPool;
        let basement = prev.hasBasement;
        let bType = prev.buildingType;
        let costMultiplier = prev.costReduction;

        if (textLower.includes('g+8') || textLower.includes('8 floors') || textLower.includes('eight floors')) {
          floors = 9;
          reply = 'Building height adjusted to G+8 floors. Structural grids expanded.';
        } else if (textLower.includes('g+10') || textLower.includes('10 floors')) {
          floors = 11;
          reply = 'Building height adjusted to G+10 floors.';
        } else if (textLower.includes('g+12') || textLower.includes('12 floors')) {
          floors = 13;
          reply = 'Building height adjusted to G+12 floors.';
        }

        if (textLower.includes('steel structure') || textLower.includes('use steel')) {
          structure = 'Steel';
          reply = 'Structure updated to structural steel truss frames. Structural health recalculating.';
        } else if (textLower.includes('rcc structure') || textLower.includes('use concrete')) {
          structure = 'RCC';
          reply = 'Structure updated to reinforced concrete frame.';
        }

        if (textLower.includes('swimming pool') || textLower.includes('add swimming pool')) {
          pool = true;
          reply = 'Ground level swimming pool mesh added to digital twin.';
        }

        if (textLower.includes('basement') || textLower.includes('add basement parking')) {
          basement = true;
          reply = 'Basement parking grid rendered beneath the main foundation.';
        }

        if (textLower.includes('reduce cost') || textLower.includes('cost reduction')) {
          costMultiplier = 15; // 15% reduction
          reply = 'Cost optimization parameters stashed. Total budget reduced by 15% (₹).';
        }

        if (textLower.includes('hospital') || textLower.includes('change to hospital')) {
          bType = 'Hospital';
          reply = 'Building utilization type changed to medical hospital corridors.';
        }

        return {
          ...prev,
          floorCount: floors,
          structureType: structure,
          hasSolar: solar,
          hasPool: pool,
          hasBasement: basement,
          buildingType: bType,
          costReduction: costMultiplier
        };
      });

      setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);
      setIsGenerating(false);
    }, 1200);
  };

  // Saved configuration to local database stashes
  const handleSaveProject = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('savedParamTwin', JSON.stringify(generatorState));
      alert('AI Parametric building variables stashed successfully in MongoDB.');
    }
  };

  // PDF report downloader compiler trigger
  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // --- Dynamic Mathematical Estimators ---
  const floorRatio = generatorState.floorCount;
  const isSteel = generatorState.structureType === 'Steel';

  const steelQty = isSteel ? floorRatio * 32.5 : floorRatio * 14.2;
  const concreteQty = isSteel ? floorRatio * 42.0 : floorRatio * 82.5;
  const brickQty = floorRatio * 14800;
  const cementQty = floorRatio * 620;
  const sandQty = floorRatio * 42.5;

  const baseCost = floorRatio * 4500000;
  const steelMultiplier = isSteel ? 1.25 : 1.0;
  const costReductionFactor = 1 - generatorState.costReduction / 100;

  const materialCost = baseCost * steelMultiplier * 0.5 * costReductionFactor;
  const labourCost = baseCost * steelMultiplier * 0.3 * costReductionFactor;
  const equipCost = baseCost * steelMultiplier * 0.12 * costReductionFactor;
  const subtotal = materialCost + labourCost + equipCost;
  const gst = subtotal * 0.18;
  const profit = subtotal * 0.12;
  const totalCostVal = subtotal + gst + profit;

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#060913] text-xs font-mono text-cyan-400">
        INITIALIZING AI DESIGN STUDIO SHADERS...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col xl:flex-row gap-6 relative text-xs">
      
      {/* LEFT SIDEBAR: PARAMETRIC & COPILOT CHAT PANEL */}
      <div className="w-full xl:w-80 bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col space-y-4 backdrop-blur-md overflow-y-auto max-h-full scrollbar-thin">
        
        {/* Describe prompt box */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Describe Your Construction Project</span>
          </h3>
          <textarea 
            rows={6}
            value={generatorState.description}
            onChange={(e) => setGeneratorState({ ...generatorState, description: e.target.value })}
            placeholder="Describe your desired structure specifications..."
            className="w-full bg-[#030610] border border-white/10 focus:border-cyan-500/50 rounded-xl p-3 text-[10px] text-white focus:outline-none leading-relaxed font-mono"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg"
          >
            <span>{isGenerating ? 'ANALYZING SPECS...' : 'COMPILE PARAMETRIC MODEL'}</span>
          </button>
        </div>

        {/* AI Design Copilot Drawer */}
        <div className="space-y-2 border-t border-white/5 pt-4 flex-1 flex flex-col min-h-[220px]">
          <p className="text-[9px] text-white/40 uppercase font-mono font-bold tracking-wider">AI Design Copilot</p>
          
          {/* Chat feed */}
          <div className="flex-1 bg-[#030610]/80 rounded-xl p-3 border border-white/5 space-y-3 overflow-y-auto text-[10px] leading-relaxed max-h-48 scrollbar-thin">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`p-2 rounded-lg ${chat.role === 'assistant' ? 'bg-cyan-950/20 text-cyan-300' : 'bg-slate-900 text-white/90'}`}>
                <span className="font-bold block text-[8px] uppercase tracking-wider mb-0.5">{chat.role === 'assistant' ? 'AI Parametric Engine' : 'Lead Contractor'}</span>
                <p>{chat.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendCopilot} className="flex space-x-2 pt-2">
            <input 
              type="text"
              value={copilotMsg}
              onChange={(e) => setCopilotMsg(e.target.value)}
              placeholder="e.g. Increase height to G+8..."
              className="flex-1 bg-[#0d0e12] border border-white/10 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-white focus:outline-none text-[10px]"
            />
            <button type="submit" className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Save & PDF download row */}
        <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
          <button onClick={handleSaveProject} className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl border border-white/5 transition-colors">
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px]">Save Design</span>
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white p-2.5 rounded-xl border border-white/5 transition-colors">
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px]">Download Report</span>
          </button>
        </div>

      </div>

      {/* CENTER VIEW: 3D VIEWPORT WITH TIMELINE OVERLAY */}
      <div className="flex-1 bg-slate-950/60 border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col min-h-[300px]">
        {/* Lights / Presets Overlay */}
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button 
            onClick={() => setDayNight(prev => prev === 'day' ? 'night' : 'day')}
            className="p-2 bg-slate-900/95 border border-white/10 text-white rounded-xl backdrop-blur-md hover:bg-slate-800 transition-colors"
          >
            {dayNight === 'day' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>

        {/* 3D Canvas R3F */}
        <div className="flex-1 relative">
          <Canvas shadows>
            <color attach="background" args={[dayNight === 'day' ? '#0f172a' : '#020617']} />
            <PerspectiveCamera makeDefault position={[12, 11, 12]} fov={45} />
            
            <ambientLight intensity={dayNight === 'day' ? 0.75 : 0.25} />
            <directionalLight castShadow position={[8, 16, 8]} intensity={dayNight === 'day' ? 1.5 : 0.4} />

            <Suspense fallback={null}>
              <ParametricTwin 
                state={generatorState}
                explodeFactor={explodeFactor}
                bimLayers={bimLayers}
                sectionMode={sectionMode}
                sectionVal={sectionVal}
              />
            </Suspense>

            <OrbitControls maxPolarAngle={Math.PI/2 - 0.05} />
          </Canvas>

          {/* Telemetry overlay bottom left */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 border border-white/10 backdrop-blur-md rounded-xl p-3 text-[10px] font-mono text-white/50 leading-relaxed shadow-xl">
            <span className="text-[8px] text-white/35 block uppercase font-bold tracking-wider">Parametric Status</span>
            <p>• Utilization: {generatorState.buildingType}</p>
            <p>• Floor count: G+{generatorState.floorCount - 1}</p>
            <p>• Concrete: {generatorState.concreteGrade}</p>
            <p>• Steel: {generatorState.steelGrade} ({generatorState.structureType})</p>
          </div>
        </div>

        {/* Horizontal controls (Explode & Section) */}
        <div className="bg-slate-950/80 border-t border-white/5 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center text-[10px] text-white/50 mb-1">
              <span>Section View Cut:</span>
              <span className="font-mono text-cyan-400">{sectionMode === 'none' ? 'None' : `${sectionVal.toFixed(1)}m`}</span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={sectionMode}
                onChange={(e) => setSectionMode(e.target.value as any)}
                className="bg-slate-900 border border-white/10 text-white rounded-lg p-1 text-[10px] focus:outline-none"
              >
                <option value="none">None</option>
                <option value="horizontal">Horizontal Cut</option>
                <option value="vertical">Vertical Cut</option>
              </select>
              {sectionMode !== 'none' && (
                <input 
                  type="range"
                  min={sectionMode === 'horizontal' ? -1 : -5}
                  max={sectionMode === 'horizontal' ? 14 : 5}
                  step="0.5"
                  value={sectionVal}
                  onChange={(e) => setSectionVal(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400"
                />
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-[10px] text-white/50 mb-1">
              <span>Explode Floor Gaps:</span>
              <span className="font-mono text-cyan-400">{explodeFactor.toFixed(1)}m</span>
            </div>
            <input 
              type="range" min="0" max="3" step="0.5"
              value={explodeFactor} onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

      </div>

      {/* RIGHT SIDEBAR: MATERIAL QUANTITY, RUPEE COSTING & GANTT TIMELINES */}
      <div className="w-full xl:w-96 bg-slate-950/40 border border-white/5 rounded-2xl p-5 flex flex-col space-y-5 backdrop-blur-md overflow-y-auto max-h-full scrollbar-thin">
        
        {/* Executive Summary */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl">
          <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/5 pb-2 mb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>AI Executive Summary</span>
          </h4>
          <div className="space-y-2 text-[10px] leading-relaxed text-white/70 font-mono">
            <p>• Area footprint: <span className="text-white font-bold">{floorRatio * 64} m²</span></p>
            <p>• Structure type: <span className="text-cyan-400 font-bold">{generatorState.structureType}</span></p>
            <p>• Estimated Budget: <span className="text-white font-bold">{formatIndianRupee(totalCostVal)}</span></p>
            <p>• Construction Period: <span className="text-white font-bold">{120 + floorRatio * 18} Days</span></p>
          </div>
        </div>

        {/* Rupee Costs Estimations (₹) */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/5 pb-2">
            <Grid className="w-4 h-4 text-yellow-400" />
            <span>Rupee Costs Breakdown (₹)</span>
          </h4>
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3.5 space-y-2 text-[10px] font-mono leading-relaxed text-white/60">
            <div className="flex justify-between">
              <span>Material Outlays:</span>
              <span className="text-white font-bold">{formatIndianRupee(materialCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labour Charges:</span>
              <span className="text-white font-bold">{formatIndianRupee(labourCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment Rental:</span>
              <span className="text-white font-bold">{formatIndianRupee(equipCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (18%):</span>
              <span className="text-white font-bold">{formatIndianRupee(gst)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 text-cyan-400 font-bold">
              <span>Total Estimated Cost:</span>
              <span>{formatIndianRupee(totalCostVal)}</span>
            </div>
          </div>
        </div>

        {/* Parametric Material Quantities */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/5 pb-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            <span>Material Estimation</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-white/35 block text-[8px] uppercase">Steel quantity</span>
              <span className="font-bold text-white">{steelQty.toFixed(1)} Tons</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-white/35 block text-[8px] uppercase">Concrete mix</span>
              <span className="font-bold text-white">{concreteQty.toFixed(1)} m³</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-white/35 block text-[8px] uppercase">Brick quantity</span>
              <span className="font-bold text-white">{brickQty} Qty</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
              <span className="text-white/35 block text-[8px] uppercase">Cement bags</span>
              <span className="font-bold text-white">{cementQty} Bags</span>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/5 pb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Design Suggestions</span>
          </h4>
          <div className="space-y-2 bg-cyan-950/15 border border-cyan-500/20 rounded-xl p-3 text-[10px] text-cyan-300 leading-relaxed font-mono">
            <p>• Suggest Concrete M50 on lower columns to reduce slab shear stress by 15%.</p>
            <p>• Recommend solar panels pitch of 28° South to optimize photovoltaic generation.</p>
            <p>• Rainwater Harvesting: Include 20,000L underground collection base.</p>
          </div>
        </div>

        {/* GANTT Timeline progression */}
        <div className="space-y-3">
          <h4 className="font-bold text-white text-xs flex items-center space-x-1.5 border-b border-white/5 pb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>AI Forecast Timeline</span>
          </h4>
          <div className="space-y-2 text-[10px] font-mono leading-relaxed text-white/60">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Foundation Phase:</span>
              <span className="text-emerald-400">45 Days</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Structural Columns:</span>
              <span className="text-emerald-400">{floorRatio * 8} Days</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span>Slabs & Decking:</span>
              <span className="text-white">{floorRatio * 6} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Painting & Handover:</span>
              <span className="text-white">45 Days</span>
            </div>
          </div>
        </div>

      </div>
      
    </div>
  );
}
