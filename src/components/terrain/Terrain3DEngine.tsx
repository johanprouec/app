"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './Terrain3D.css';
import { useTierra, createProductiveLand } from '@/hooks/useTierras';
import { showToast } from '@/components/ui/ToastProvider';

type LeafletWithDraw = typeof L & {
  Control: typeof L.Control & {
    Draw: new (options: unknown) => L.Control;
  };
  Draw: {
    Event: {
      CREATED: string;
      DELETED: string;
    };
  };
};

interface DrawCreatedEvent extends L.LeafletEvent {
  layer: L.Polygon;
}

interface ElevationLookupResponse {
  results: Array<{ elevation: number }>;
}

// Fix Leaflet marker icons only on client side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface Terrain3DEngineProps {
  propertyId?: string | null;
}

const Terrain3DEngine: React.FC<Terrain3DEngineProps> = ({ propertyId }) => {
  const leafletDraw = L as LeafletWithDraw;
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  
  const [currentPolygon, setCurrentPolygon] = useState<[number, number][] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('ESPERANDO');
  const [loaderText, setLoaderText] = useState('');
  const [progress, setProgress] = useState(0);
  const [elevationRange, setElevationRange] = useState({ min: 0, max: 0 });
  const [exaggeration, setExaggeration] = useState(2.0);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe' | 'both'>('solid');
  const [show3DControls, setShow3DControls] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Agrícola' as const,
    transaction_type: 'Venta' as const,
    area_ha: 15,
    price_per_ha: 0
  });

  // Raw data for rebuilding terrain
  const rawDataRef = useRef<{
    elevations: number[];
    gridPoints: { lat: number; lng: number }[];
    cols: number;
    rows: number;
    mask: boolean[];
  } | null>(null);

  const { tierra } = useTierra(propertyId || null);

  // Height to Color Logic
  const getHeightColor = (t: number) => {
    const stops = [
      { t: 0.00, r: 0.08, g: 0.28, b: 0.12 },
      { t: 0.25, r: 0.18, g: 0.42, b: 0.18 },
      { t: 0.50, r: 0.55, g: 0.48, b: 0.32 },
      { t: 0.75, r: 0.72, g: 0.68, b: 0.62 },
      { t: 1.00, r: 0.96, g: 0.96, b: 0.98 },
    ];
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i].t) {
        const p = (t - stops[i - 1].t) / (stops[i].t - stops[i - 1].t);
        return new THREE.Color(
          stops[i - 1].r + (stops[i].r - stops[i - 1].r) * p,
          stops[i - 1].g + (stops[i].g - stops[i - 1].g) * p,
          stops[i - 1].b + (stops[i].b - stops[i - 1].b) * p
        );
      }
    }
    return new THREE.Color(1, 1, 1);
  };

  const updateViewMode = (mode: string, solid?: THREE.Mesh, wire?: THREE.Mesh) => {
    const s = solid || terrainMeshRef.current;
    const w = wire || wireframeMeshRef.current;
    if (!s || !w) return;
    
    if (mode === 'solid') {
      s.visible = true; w.visible = false;
    } else if (mode === 'wireframe') {
      s.visible = false; w.visible = true; 
      (w.material as THREE.MeshBasicMaterial).opacity = 0.6;
    } else {
      s.visible = true; w.visible = true; 
      (w.material as THREE.MeshBasicMaterial).opacity = 0.1;
    }
  };

  // Rebuild Mesh
  const rebuildTerrain = (exagValue: number) => {
    if (!rawDataRef.current || !sceneRef.current) return;
    const { elevations, gridPoints, cols, rows, mask } = rawDataRef.current;

    // Clear old meshes
    if (terrainMeshRef.current) {
        sceneRef.current.remove(terrainMeshRef.current);
        terrainMeshRef.current.geometry.dispose();
    }
    if (wireframeMeshRef.current) {
        sceneRef.current.remove(wireframeMeshRef.current);
        wireframeMeshRef.current.geometry.dispose();
    }

    const insideElevs = elevations.filter((_, i) => mask[i]);
    const minElev = Math.min(...insideElevs);
    const maxElev = Math.max(...insideElevs);
    const elevRange = maxElev - minElev || 1;

    const insidePointsData = gridPoints.filter((_, i) => mask[i]);
    const cLat = insidePointsData.reduce((s, p) => s + p.lat, 0) / insidePointsData.length;
    const cLon = insidePointsData.reduce((s, p) => s + p.lng, 0) / insidePointsData.length;

    const SCENE_SIZE = 1200;
    const R = 6371000;
    const getXY = (lat: number, lon: number) => ({
      x: (lon - cLon) * (Math.PI / 180) * R * Math.cos(cLat * Math.PI / 180),
      y: (lat - cLat) * (Math.PI / 180) * R,
    });

    const xys = insidePointsData.map(p => getXY(p.lat, p.lng));
    const maxX = Math.max(...xys.map(p => Math.abs(p.x)));
    const maxY = Math.max(...xys.map(p => Math.abs(p.y)));
    const maxDim = Math.max(maxX, maxY) * 2 || 1;
    const geoScale = SCENE_SIZE / maxDim;

    const baseElevScale = (SCENE_SIZE * 0.15) / elevRange;
    const elevScale = baseElevScale * exagValue;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(cols * rows * 3);
    const colors = new Float32Array(cols * rows * 3);
    const indices = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const p = gridPoints[i];
        const xy = getXY(p.lat, p.lng);
        const elev = mask[i] ? elevations[i] : minElev;
        const y = mask[i] ? (elev - minElev) * elevScale : -20;

        positions[i * 3 + 0] = xy.x * geoScale;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = -xy.y * geoScale;

        const col = getHeightColor(mask[i] ? (elev - minElev) / elevRange : 0);
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
    }

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const tl = r * cols + c;
        const tr = tl + 1;
        const bl = (r + 1) * cols + c;
        const br = bl + 1;
        if (mask[tl] && mask[tr] && mask[bl] && mask[br]) {
          indices.push(tl, bl, tr, tr, bl, br);
        }
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const terrain = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ vertexColors: true, side: THREE.DoubleSide }));
    terrain.castShadow = true;
    terrain.receiveShadow = true;
    
    const wireframe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00e5a0, wireframe: true, transparent: true, opacity: 0.1 }));

    sceneRef.current.add(terrain);
    sceneRef.current.add(wireframe);
    terrainMeshRef.current = terrain;
    wireframeMeshRef.current = wireframe;

    updateViewMode(viewMode, terrain, wireframe);
    
    // Zoom to fit
    const box = new THREE.Box3().setFromObject(terrain);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxT = Math.max(size.x, size.z);
    
    if (controlsRef.current && cameraRef.current) {
        controlsRef.current.target.copy(center);
        cameraRef.current.position.set(center.x + maxT * 0.8, center.y + maxT * 0.6, center.z + maxT * 0.8);
        controlsRef.current.update();
    }
  };

  // Point in Polygon Logic
  const isPointInPolygon = (px: number, py: number, polygon: [number, number][]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  const generate3DFromPolygon = async (polygon: [number, number][]) => {
    setLoading(true);
    setStatus('PROCESANDO');
    setLoaderText('PREPARANDO TERRENO...');
    
    try {
      const lngs = polygon.map(p => p[0]);
      const lats = polygon.map(p => p[1]);
      const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats), maxLat = Math.max(...lats);

      const GRID = 40;
      const points = [];
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;

      for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
          const lat = minLat + (r / (GRID - 1)) * (latRange || 0.001);
          const lng = minLng + (c / (GRID - 1)) * (lngRange || 0.001);
          points.push({ lat, lng });
        }
      }

      const mask = points.map(p => isPointInPolygon(p.lng, p.lat, polygon));
      
      // Fetch elevations
      setLoaderText('OBTENIENDO ELEVACIONES...');
      const BATCH = 500;
      const elevations = [];
      for (let i = 0; i < points.length; i += BATCH) {
        if (i > 0) await new Promise(r => setTimeout(r, 100)); // Rate limit buffer
        const batch = points.slice(i, i + BATCH);
        const locations = batch.map(p => ({ latitude: p.lat, longitude: p.lng }));
        setProgress(Math.round((i / points.length) * 100));

        const res = await fetch('https://api.open-elevation.com/api/v1/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locations }),
        });
        const data = (await res.json()) as ElevationLookupResponse;
        if (data.results) {
          elevations.push(...data.results.map((r) => r.elevation));
        } else {
          throw new Error("Respuesta inválida de la API");
        }
      }

      rawDataRef.current = { elevations, gridPoints: points, cols: GRID, rows: GRID, mask };
      rebuildTerrain(exaggeration);
      
      const insideElevs = elevations.filter((_, i) => mask[i]);
      if (insideElevs.length > 0) {
        setElevationRange({ min: Math.min(...insideElevs), max: Math.max(...insideElevs) });
      }
      
      setLoading(false);
      setShow3DControls(true);
      setStatus('LISTO');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStatus('ERROR');
      showToast('Error al generar motor 3D', 'error');
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [4.5709, -74.2973], // Colombia
      zoom: 6,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialize Leaflet Draw
    const drawControl = new (L as any).Control.Draw({
      edit: { featureGroup: drawnItems, remove: true },
      draw: {
        polygon: {
          shapeOptions: {
            color: '#00e5a0',
            fillColor: '#00e5a0',
            fillOpacity: 0.15,
            weight: 2,
          },
          allowIntersection: false,
        },
        rectangle: false,
        circle: false,
        marker: false,
        polyline: false,
        circlemarker: false,
      },
    });
    map.addControl(drawControl);

    map.on((L as any).Draw.Event.CREATED, (e: any) => {
      drawnItems.clearLayers();
      const layer = e.layer;
      drawnItems.addLayer(layer);
      
      const rings = layer.getLatLngs() as L.LatLng[][];
      const latlngs: [number, number][] = rings[0].map((ll) => [ll.lng, ll.lat]);
      // Ensure closed polygon
      if (latlngs[0][0] !== latlngs[latlngs.length - 1][0]) {
        latlngs.push(latlngs[0]);
      }
      setCurrentPolygon(latlngs);
      setStatus('LISTO');
    });

    map.on((L as any).Draw.Event.DELETED, () => {
      setCurrentPolygon(null);
      setStatus('ESPERANDO');
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle data from Supabase hook
  useEffect(() => {
    if (tierra && mapRef.current) {
      const polygon = tierra.polygon_data;
      if (!polygon || polygon.length === 0) return;
      
      setCurrentPolygon(polygon);
      
      // Update map view
      const latlngs = polygon.map(p => [p[1], p[0]] as [number, number]);
      const poly = L.polygon(latlngs, { color: '#efb810', fillOpacity: 0.25, weight: 3 });
      poly.addTo(mapRef.current);
      mapRef.current.fitBounds(poly.getBounds());
      
      // Small delay to ensure everything is ready before triggering generate
      setTimeout(() => {
        generate3DFromPolygon(polygon);
      }, 500);
    }
  }, [tierra, mapRef.current]);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current || rendererRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090c);
    
    const width = canvasContainerRef.current.clientWidth;
    const height = canvasContainerRef.current.clientHeight;
    renderer.setSize(width, height, false);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.5, 50000);
    camera.position.set(400, 400, 400);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    // Lighting
    scene.add(new THREE.AmbientLight(0x8899aa, 1.8));
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.5);
    sun.position.set(1000, 2000, 1000);
    sun.castShadow = true;
    scene.add(sun);

    const grid = new THREE.GridHelper(5000, 50, 0x1e2a35, 0x0d1520);
    grid.position.y = -1;
    scene.add(grid);

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasContainerRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  // Search Logic
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;
    
    setIsSearching(true);
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=co&limit=5`);
      const data = await resp.json();
      setSearchResults(data);
      if (data.length > 0) {
        const first = data[0];
        mapRef.current.flyTo([parseFloat(first.lat), parseFloat(first.lon)], 15);
      } else {
        showToast('No se encontró la ubicación', 'info');
      }
    } catch (err) {
      showToast('Error en la búsqueda', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (lat: string, lon: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo([parseFloat(lat), parseFloat(lon)], 16);
      setSearchResults([]);
    }
  };

  const handleClear = () => {
    if (mapRef.current) {
        mapRef.current.eachLayer((l: L.Layer) => {
            if (l instanceof L.Polygon) {
                l.remove();
            }
        });
    }
    setCurrentPolygon(null);
    setShow3DControls(false);
    if (terrainMeshRef.current && sceneRef.current) {
        sceneRef.current.remove(terrainMeshRef.current);
        if (wireframeMeshRef.current) sceneRef.current.remove(wireframeMeshRef.current);
    }
  };

  const handleSaveLand = async () => {
    if (!currentPolygon || !formData.name || !formData.price_per_ha) {
      showToast('Por favor completa los campos principales', 'info');
      return;
    }
    setSaving(true);
    try {
      const newLand = {
        name: formData.name,
        type: formData.type,
        location_city: 'Cundinamarca',
        location_department: 'Bogotá',
        area_ha: formData.area_ha,
        price_per_ha: formData.price_per_ha,
        transaction_type: formData.transaction_type,
        soil_type: 'Orgánico',
        water_source: 'Pozo',
        altitude: elevationRange.min,
        image_url: (formData.type as string) === 'Ganadero' 
          ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
          : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
        polygon_data: currentPolygon
      };

      await createProductiveLand(newLand);
      showToast('Tierra registrada exitosamente', 'success');
      setShowSaveForm(false);
    } catch (err) {
      showToast('Error al registrar tierra', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!leafletDraw) return null;

  return (
    <div className="terrain-engine-container">
      {/* 2D MAP */}
      <div className="map-panel">
        <div className="panel-header">TerrainForge - Mapa 2D · {status} {tierra && `(${tierra.name})`}</div>
        
        {/* Search Bar UI */}
        <div className="absolute top-12 left-3 right-3 z-[1000] pointer-events-none">
          <form onSubmit={handleSearch} className="pointer-events-auto">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar finca, ciudad o vereda..."
                className="w-full bg-[#0c1218]/90 backdrop-blur-md border border-white/10 rounded-2xl py-3 px-10 text-white text-sm shadow-2xl focus:border-[#00e5a0]/50 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[20px]">search</span>
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-[#00e5a0] rounded-full animate-spin"></div>
              )}
            </div>
          </form>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-[#0c1218]/95 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto max-h-60 overflow-y-auto">
              {searchResults.map((res, i) => (
                <button 
                  key={i} 
                  className="w-full text-left p-3 hover:bg-white/5 border-none border-b border-white/5 last:border-0 text-xs text-white/80 flex items-center gap-3 transition-colors cursor-pointer"
                  onClick={() => handleSelectResult(res.lat, res.lon)}
                >
                  <span className="material-symbols-outlined text-[16px] text-[#00e5a0]">location_on</span>
                  <span className="truncate">{res.display_name}</span>
                </button>
              ))}
              <div className="p-2 bg-white/5 text-[9px] text-center text-white/30 uppercase tracking-widest font-bold">OpenStreetMap Data</div>
            </div>
          )}
        </div>
        <div id="map-container" ref={mapContainerRef}></div>
        <div className="map-controls">
          <button 
            className="btn-3d btn-3d-primary" 
            disabled={!currentPolygon || loading} 
            onClick={() => currentPolygon && generate3DFromPolygon(currentPolygon)}
          >
            {loading ? 'Generando...' : 'Generar 3D'}
          </button>
          
          {currentPolygon && !propertyId && (
            <button 
              className="btn-3d btn-3d-amber" 
              disabled={saving || loading} 
              onClick={() => setShowSaveForm(true)}
              style={{ background: '#efb810', color: '#07090c' }}
            >
              Guardar Finca
            </button>
          )}

          <button 
            className="btn-3d btn-3d-secondary" 
            disabled={!currentPolygon || loading} 
            onClick={handleClear}
          >
            Limpiar
          </button>
          <div className="coord-info">
            {currentPolygon ? `${currentPolygon.length} vértices` : 'Dibuja un polígono'}
          </div>
        </div>
      </div>

      {/* 3D CANVAS */}
      <div className="view3d-panel" ref={canvasContainerRef}>
        <div className="panel-header">TerrainForge - Visualizador 3D</div>
        <canvas id="canvas3d" ref={canvasRef}></canvas>

        {!show3DControls && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
            <span className="material-symbols-outlined text-6xl mb-4">terrain</span>
            <p className="text-sm font-bold uppercase tracking-widest">Esperando polígono...</p>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loader-ring"></div>
            <div className="mt-4 text-[10px] font-bold tracking-[3px] text-[#00e5a0] uppercase">{loaderText}</div>
            <div className="w-40 h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#00e5a0] transition-all" style={{width: `${progress}%`}}></div>
            </div>
          </div>
        )}

        {show3DControls && (
          <>
            <div className="exag-control">
              <div className="flex justify-between items-center text-[8px] uppercase tracking-wider text-white/50 mb-1">
                <span>Exageración</span>
                <span className="text-[#00e5a0]">{exaggeration.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="1" max="10" step="0.5" 
                value={exaggeration} 
                onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setExaggeration(v);
                    rebuildTerrain(v);
                }}
                className="w-full accent-[#00e5a0] h-1"
              />
            </div>

            <div className="elev-info">
                <div className="text-[8px] uppercase tracking-wider text-white/50">Elevación</div>
                <div className="elev-val">{elevationRange.min}<span>m</span></div>
                <div className="text-[8px] uppercase tracking-wider text-white/50 mt-2">Máxima</div>
                <div className="elev-val">{elevationRange.max}<span>m</span></div>
            </div>

            <div className="view-toggles">
              <button 
                className={`toggle-btn ${viewMode === 'solid' ? 'active' : ''}`}
                onClick={() => { setViewMode('solid'); updateViewMode('solid'); }}
              >SÓLIDO</button>
              <button 
                className={`toggle-btn ${viewMode === 'wireframe' ? 'active' : ''}`}
                onClick={() => { setViewMode('wireframe'); updateViewMode('wireframe'); }}
              >MALLA</button>
              <button 
                className={`toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
                onClick={() => { setViewMode('both'); updateViewMode('both'); }}
              >AMBOS</button>
            </div>
          </>
        )}
      </div>

      {/* SAVE FORM MODAL */}
      {showSaveForm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveForm(false)}></div>
          <div className="bg-[#0c1218] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative animate-up shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Registrar Nueva Tierra</h3>
              <button onClick={() => setShowSaveForm(false)} className="text-white/40 hover:text-white border-none bg-transparent cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-stone tracking-widest ml-1">Nombre de la finca</label>
                <input 
                  type="text" 
                  placeholder="Ej: Finca Las Camelias"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#00e5a0] outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone tracking-widest ml-1">Tipo de uso</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none outline-none focus:border-[#00e5a0]"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="Agrícola" className="bg-[#0c1218]">Agrícola</option>
                    <option value="Ganadero" className="bg-[#0c1218]">Ganadero</option>
                    <option value="Mixto" className="bg-[#0c1218]">Mixto</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone tracking-widest ml-1">Transacción</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white appearance-none outline-none focus:border-[#00e5a0]"
                    value={formData.transaction_type}
                    onChange={e => setFormData({...formData, transaction_type: e.target.value as any})}
                  >
                    <option value="Venta" className="bg-[#0c1218]">Venta</option>
                    <option value="Alquiler" className="bg-[#0c1218]">Alquiler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone tracking-widest ml-1">Área (Ha)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#00e5a0] outline-none transition-all"
                    value={formData.area_ha}
                    onChange={e => setFormData({...formData, area_ha: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone tracking-widest ml-1">Precio/Ha (M)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="4.5"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#00e5a0] outline-none transition-all"
                    value={formData.price_per_ha || ''}
                    onChange={e => setFormData({...formData, price_per_ha: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button 
                className="flex-1 py-3 font-bold text-white/50 hover:bg-white/5 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                onClick={() => setShowSaveForm(false)}
              >
                Cancelar
              </button>
              <button 
                className="flex-[2] py-3 bg-[#00e5a0] text-[#07090c] font-bold rounded-xl hover:bg-[#00c58a] transition-all border-none cursor-pointer"
                disabled={saving}
                onClick={handleSaveLand}
              >
                {saving ? 'Guardando...' : 'Confirmar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Terrain3DEngine;
