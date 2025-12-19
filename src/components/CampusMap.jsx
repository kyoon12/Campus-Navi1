import React, { useState, useRef, useCallback } from 'react';
import { MapPin, Search, Compass, Plus, Minus, X, Navigation } from 'lucide-react';

const CampusMapRedesign = () => {
  const [scale, setScale] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const startPanRef = useRef({ x: 0, y: 0 });

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4;
  const ZOOM_STEP = 0.2;

  // Refined building data to match the image geometry exactly
  const buildings = [
    // Top Left Section
    { id: 'eng-top', name: 'Engineering', label: 'Engineering', color: '#4B2C82', type: 'poly', points: '290,50 480,100 450,250 370,230 400,150 290,120' },
    { id: 'covered-court', name: 'Covered Court', label: 'Covered court', color: '#F3E5AB', type: 'poly', points: '180,150 380,250 340,350 140,250' },
    { id: 'green-area', name: 'Green Space', label: '', color: '#004D40', type: 'poly', points: '10,340 210,140 310,350 250,420 100,550' },
    
    // Top Right / Center Section
    { id: 'canteen', name: 'Canteen', label: 'canteen', color: '#FFD54F', type: 'rect', x: 470, y: 80, w: 130, h: 100, rot: 15 },
    { id: 'high-school', name: 'High School', label: 'HIGHSCHOOL', color: '#42A5F5', type: 'rect', x: 580, y: 150, w: 280, h: 100, rot: 15 },
    { id: 'vacant-lot', name: 'Vacant Lot', label: 'VACANT LOT', color: '#01579B', type: 'rect', x: 420, y: 200, w: 320, h: 220, rot: 15 },
    
    // Middle Left
    { id: 'crim', name: 'Criminology', label: 'Criminology', color: '#64B5F6', type: 'poly', points: '100,380 260,420 220,530 50,480' },
    { id: 'tech', name: 'Technology', label: 'technology', color: '#EF5350', type: 'poly', points: '180,550 380,450 430,550 260,650' },
    
    // Center Bottom (L-shape)
    { id: 'orange-bldg', name: 'Admin/Orange Building', label: '', color: '#FB8C00', type: 'poly', points: '340,650 480,450 550,500 480,550 430,750 330,700' },
    { id: 'open-ground', name: 'Open Ground', label: 'OPEN GROUND', color: '#757575', type: 'poly', points: '380,750 630,680 730,450 890,520 800,780' },
    
    // Bottom Right
    { id: 'eng-bldg', name: 'Engineering Building', label: 'Engineering building', color: '#90CAF9', type: 'rect', x: 470, y: 650, w: 200, h: 60, rot: -75 },
    { id: 'pink-bldg', name: 'Department Building', label: '', color: '#CE93D8', type: 'rect', x: 740, y: 410, w: 140, h: 120, rot: 15 },

    // Entrance and Parking
    { id: 'park-1', name: 'Parking Area A', label: 'PARKING AREA', color: '#81D4FA', type: 'rect', x: 200, y: 750, w: 110, h: 150, rot: 25 },
    { id: 'park-2', name: 'Parking Area B', label: 'PARKING AREA', color: '#81D4FA', type: 'rect', x: 260, y: 780, w: 110, h: 150, rot: 25 }
  ];

  // Logic for Panning, Zooming, and Filtering remains the same as your source
  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPanRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPanX(e.clientX - startPanRef.current.x);
    setPanY(e.clientY - startPanRef.current.y);
  }, [isDragging]);

  const handleMouseUp = () => setIsDragging(false);
  const zoomIn = () => setScale(s => Math.min(s + ZOOM_STEP, MAX_SCALE));
  const zoomOut = () => setScale(s => Math.max(s - ZOOM_STEP, MIN_SCALE));

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* Search Header */}
      <div className="p-4 bg-white shadow-md flex items-center gap-4 z-20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search campus buildings..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => {setScale(1); setPanX(0); setPanY(0);}} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <Compass size={24} className="text-blue-600" />
        </button>
      </div>

      {/* Map Area */}
      <div 
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#E0E0E0]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          style={{ 
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: '0 0'
          }}
        >
          <svg width="1000" height="1000" viewBox="0 0 1000 1000">
            {/* Base Background Path (the gray campus footprint) */}
            <polygon points="100,500 300,100 900,200 950,500 500,950 200,900" fill="#9E9E9E" />

            {buildings.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(b => (
              <g 
                key={b.id} 
                className="hover:brightness-110 cursor-pointer transition-all"
                onClick={() => setSelectedBuilding(b)}
              >
                {b.type === 'poly' ? (
                  <polygon points={b.points} fill={b.color} stroke="white" strokeWidth="1" />
                ) : (
                  <rect 
                    x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} stroke="white" strokeWidth="1"
                    transform={`rotate(${b.rot || 0}, ${b.x + b.w/2}, ${b.y + b.h/2})`}
                  />
                )}
                {/* Visual Labels */}
                <text 
                  x={b.type === 'rect' ? b.x + b.w/2 : 400} // Simplified positioning
                  y={b.type === 'rect' ? b.y + b.h/2 : 400} 
                  fontSize="12" 
                  fontWeight="bold" 
                  fill={b.id === 'vacant-lot' ? '#E91E63' : '#D32F2F'}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  style={{ textShadow: '0px 0px 2px white' }}
                >
                  {b.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-2">
          <button onClick={zoomIn} className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50"><Plus /></button>
          <button onClick={zoomOut} className="p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50"><Minus /></button>
        </div>

        {/* Info Card */}
        {selectedBuilding && (
          <div className="absolute bottom-8 left-8 right-8 md:w-80 bg-white p-6 rounded-2xl shadow-2xl border-t-4 border-blue-500 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold">{selectedBuilding.name}</h2>
              <button onClick={() => setSelectedBuilding(null)}><X size={20}/></button>
            </div>
            <p className="text-gray-500 mt-1">Campus Zone 1</p>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
              <Navigation size={18} /> Directions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusMapRedesign;