import React, { useState } from 'react';
import { Sparkles, Users, Shuffle, Shield, AlertTriangle, CheckCircle, Calendar, Clock, X, Scale } from 'lucide-react';
import { generateBalancedTeams } from '../utils/smartDraft';

export default function MatchGenerator({ selectedPlayers, sport, onConfirmMatch, onViewAvatar }) {
  const [draftMode, setDraftMode] = useState('auto'); // 'auto' | 'manual'
  const [teams, setTeams] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTeamCount, setCustomTeamCount] = useState('');
  const [manualAssignments, setManualAssignments] = useState({}); // { playerId: teamIndex | 'sub' }
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [matchDate, setMatchDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [matchTime, setMatchTime] = useState(() => {
    const today = new Date();
    return today.toTimeString().split(' ')[0].substring(0, 5);
  });

  const forcedCount = customTeamCount ? parseInt(customTeamCount, 10) : null;
  const numTeams = forcedCount || Math.max(2, Math.floor(selectedPlayers.length / sport.playersPerTeam));

  // Equipos y suplentes calculados para modo manual
  const manualTeamsList = Array.from({ length: numTeams }, (_, idx) => 
    selectedPlayers.filter(p => manualAssignments[p.id] === idx)
  );
  const manualSubstitutesList = selectedPlayers.filter(p => manualAssignments[p.id] === 'sub');
  const unassignedPlayers = selectedPlayers.filter(p => manualAssignments[p.id] === undefined);

  // Estadísticas para modo manual
  const manualStatsList = manualTeamsList.map((team, idx) => {
    const totalSkill = team.reduce((sum, p) => sum + p.skillLevel, 0);
    const avgSkill = team.length > 0 ? (totalSkill / team.length).toFixed(1) : 0;
    return {
      teamIndex: idx,
      totalSkill,
      avgSkill: parseFloat(avgSkill)
    };
  });

  const handleClear = () => {
    setTeams([]);
    setSubstitutes([]);
    setTeamStats([]);
    setManualAssignments({});
  };

  const handleGenerate = () => {
    if (selectedPlayers.length < 2) return;

    setIsGenerating(true);
    
    setTimeout(() => {
      const result = generateBalancedTeams(selectedPlayers, sport.playersPerTeam, forcedCount);
      
      setTeams(result.teams || []);
      setSubstitutes(result.substitutes || []);
      setTeamStats(result.stats || []);
      setIsGenerating(false);
    }, 600);
  };

  const handleAssignPlayer = (playerId, target) => {
    setManualAssignments(prev => ({
      ...prev,
      [playerId]: target
    }));
  };

  const handleRemovePlayer = (playerId) => {
    setManualAssignments(prev => {
      const copy = { ...prev };
      delete copy[playerId];
      return copy;
    });
  };

  const handleSubmitConfirm = (e) => {
    e.preventDefault();
    const activeTeams = draftMode === 'auto' ? teams : manualTeamsList;
    const activeSubstitutes = draftMode === 'auto' ? substitutes : manualSubstitutesList;

    onConfirmMatch({
      sportId: sport.id,
      sportName: sport.name,
      date: matchDate,
      time: matchTime,
      teams: activeTeams.map(team => ({
        players: team.map(p => ({ id: p.id, name: p.name, skillLevel: p.skillLevel, avatar: p.avatar }))
      })),
      substitutes: activeSubstitutes.map(p => ({ id: p.id, name: p.name, skillLevel: p.skillLevel, avatar: p.avatar })),
      status: 'pendiente',
      score: { team1: null, team2: null }
    });
    setShowConfirmModal(false);
    handleClear();
  };

  const getTeamColor = (index) => {
    const colors = [
      'border-brand-orange/30 from-brand-orange/5 to-transparent',
      'border-brand-lime/30 from-brand-lime/5 to-transparent',
      'border-blue-500/30 from-blue-500/5 to-transparent',
      'border-purple-500/30 from-purple-500/5 to-transparent',
      'border-pink-500/30 from-pink-500/5 to-transparent',
    ];
    return colors[index % colors.length];
  };

  const getTeamHeaderBg = (index) => {
    const badges = [
      'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
      'bg-brand-lime/10 text-brand-lime border-brand-lime/20',
      'bg-blue-400/10 text-blue-400 border-blue-400/20',
      'bg-purple-400/10 text-purple-400 border-purple-400/20',
      'bg-pink-400/10 text-pink-400 border-pink-400/20',
    ];
    return badges[index % badges.length];
  };

  const hasResults = draftMode === 'auto' 
    ? teams.length > 0 
    : Object.keys(manualAssignments).length > 0;

  // Calculador de Equilibridad (Signature Element)
  const renderEquilibriumMeter = () => {
    const stats = draftMode === 'auto' ? teamStats : manualStatsList;
    const activeTeams = draftMode === 'auto' ? teams : manualTeamsList;
    if (activeTeams.length !== 2 || stats.length !== 2) return null;

    const t1 = stats[0].avgSkill;
    const t2 = stats[1].avgSkill;
    const diff = Math.abs(t1 - t2);
    
    // Si diff es 0 => 100% balanceado. Si diff >= 1.5 => ~50% balanceado.
    const balancePct = Math.max(40, Math.round(100 - (diff * 30)));
    
    let label = 'Estabilidad Óptima';
    let statusClass = 'text-brand-lime border-brand-lime/20 bg-brand-lime/5';
    let trackColor = 'bg-brand-lime';
    
    if (diff > 0.3 && diff <= 0.7) {
      label = 'Equilibrio Aceptable';
      statusClass = 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      trackColor = 'bg-yellow-400';
    } else if (diff > 0.7) {
      label = 'Desviación Competitiva';
      statusClass = 'text-brand-orange border-brand-orange/20 bg-brand-orange/5';
      trackColor = 'bg-brand-orange';
    }

    return (
      <div className="w-full bg-brand-slate border border-brand-steel rounded-xl p-4 mb-6 shadow-md shadow-black/25">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-orange" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">Índice de Simetría (Equilibrio)</h5>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${statusClass} font-mono`}>
            {label} ({balancePct}%)
          </span>
        </div>
        
        {/* Telemetry Scale Visualization */}
        <div className="relative h-6 bg-brand-obsidian/60 border border-brand-steel/50 rounded-lg flex items-center px-4 overflow-hidden">
          {/* Center axis mark */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-brand-steel/90 z-10"></div>
          
          {/* Dynamic slider beam */}
          <div className="absolute top-1 bottom-1 left-1 right-1 rounded-md flex items-center justify-center">
            {/* We offset from center based on difference. if t1 > t2, offset left. if t2 > t1, offset right */}
            {/* Max offset will represent 1.5 skill diff which corresponds to 100% side bias */}
            {(() => {
              const maxDiff = 1.5;
              const normalizedDiff = Math.min(maxDiff, t2 - t1); // positive if t2 is stronger
              const percentShift = (normalizedDiff / maxDiff) * 45; // max 45% shift left/right
              const leftPercent = 50 + percentShift;
              
              return (
                <div 
                  className={`w-3.5 h-3.5 rounded-full ${trackColor} shadow-[0_0_8px_currentColor] transition-all duration-500 absolute`}
                  style={{ left: `calc(${leftPercent}% - 7px)` }}
                />
              );
            })()}
          </div>
          
          {/* Labels for side biases */}
          <div className="w-full flex justify-between text-[9px] font-bold font-mono text-gray-500 z-0">
            <span>◄ SESGO EQUIPO 1</span>
            <span>BALANCEADO</span>
            <span>SESGO EQUIPO 2 ►</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-10">
      
      {/* Panel de Controles */}
      <div className="bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/35 mb-6">
        {/* Selector de modo */}
        <div className="flex bg-brand-obsidian p-1 rounded-xl border border-brand-steel w-fit mb-4">
          <button
            onClick={() => { setDraftMode('auto'); handleClear(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono ${draftMode === 'auto' ? 'bg-brand-orange text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Balanceo Automático
          </button>
          <button
            onClick={() => { setDraftMode('manual'); handleClear(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-mono ${draftMode === 'manual' ? 'bg-brand-orange text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Armado Manual
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
              <Sparkles className="w-5 h-5 text-brand-orange" /> {draftMode === 'auto' ? 'Panel de Draft Inteligente' : 'Armador de Equipos Manual'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Seleccionados: <strong className="text-brand-orange">{selectedPlayers.length}</strong> jugadores.
              El deporte requiere equipos de <strong className="text-brand-orange">{sport.playersPerTeam}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono">
            {hasResults && (
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="py-2 px-4 bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all text-xs font-semibold rounded-lg active:scale-95 cursor-pointer"
                >
                  Limpiar Equipos
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="py-2 px-4 bg-brand-orange hover:bg-brand-orange-dark text-white transition-all text-xs font-bold rounded-lg active:scale-95 flex items-center gap-1.5 shadow shadow-brand-orange/10 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmar Partido
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Equipos a armar:</span>
              <input
                type="number"
                min="2"
                max="10"
                placeholder="Auto"
                value={customTeamCount}
                onChange={(e) => setCustomTeamCount(e.target.value)}
                className="w-16 bg-brand-obsidian text-gray-100 rounded-lg py-1.5 px-2.5 border border-brand-steel focus:border-brand-orange outline-none text-xs text-center font-bold"
              />
            </div>

            {draftMode === 'auto' && (
              <button
                onClick={handleGenerate}
                disabled={selectedPlayers.length < 2 || isGenerating}
                className={`flex items-center gap-2 py-2.5 px-6 font-bold rounded-lg transition-all text-sm shadow-lg cursor-pointer ${
                  selectedPlayers.length >= 2
                    ? 'bg-brand-orange hover:bg-brand-orange-dark text-white shadow-brand-orange/10 active:scale-95'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-brand-steel'
                }`}
              >
                <Shuffle className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Calculando Balanceo...' : 'Generar Equipos'}
              </button>
            )}
          </div>
        </div>

        {selectedPlayers.length < 2 && (
          <div className="mt-4 flex items-center gap-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Debes seleccionar al menos 2 jugadores para poder armar los equipos.</span>
          </div>
        )}
      </div>

      {/* ÍNDICE DE EQUILIBRIO DE EQUIPOS */}
      {hasResults && renderEquilibriumMeter()}

      {/* RENDERIZADO DEL MODO MANUAL */}
      {draftMode === 'manual' && selectedPlayers.length >= 2 && (
        <div className="space-y-6">
          {/* Jugadores Disponibles para Asignar */}
          <div className="bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/25">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2 font-display">
              <Users className="w-4 h-4 text-brand-orange" /> Jugadores Disponibles ({unassignedPlayers.length})
            </h4>
            
            {unassignedPlayers.length === 0 ? (
              <p className="text-xs text-brand-lime/80 font-bold bg-brand-lime/5 py-3 px-4 rounded-lg border border-brand-lime/10 text-center font-mono">
                🎉 ¡Todos los jugadores han sido asignados a un equipo!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {unassignedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 bg-brand-obsidian/40 border border-brand-steel/50 rounded-lg text-xs hover:bg-brand-obsidian/80 transition-all font-mono"
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                        alt={player.name}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewAvatar) {
                            onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                          }
                        }}
                        className="w-7 h-7 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                        onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                      />
                      <span className="font-semibold text-gray-300 truncate">{player.name}</span>
                      <span className="text-brand-orange font-bold flex-shrink-0">({player.skillLevel}★)</span>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {Array.from({ length: numTeams }).map((_, teamIdx) => (
                        <button
                          key={teamIdx}
                          onClick={() => handleAssignPlayer(player.id, teamIdx)}
                          className="px-1.5 py-1 bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white border border-brand-orange/20 rounded font-bold transition-all text-[9px] cursor-pointer"
                          title={`Asignar al Equipo ${teamIdx + 1}`}
                        >
                          E{teamIdx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handleAssignPlayer(player.id, 'sub')}
                        className="px-1.5 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-white border border-yellow-500/20 rounded font-bold transition-all text-[9px] cursor-pointer"
                        title="Asignar como Suplente"
                      >
                        Sup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grilla de Equipos Manuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manualTeamsList.map((team, idx) => {
              const stats = manualStatsList[idx];
              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${getTeamColor(idx)} border rounded-2xl p-5 shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between border-b border-brand-steel/50 pb-3 mb-4 font-mono">
                    <h5 className="font-extrabold text-white text-lg flex items-center gap-2 font-display">
                      Equipo {idx + 1}
                      <span className="text-xs font-medium text-gray-400">({team.length} jug.)</span>
                    </h5>
                    {stats && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getTeamHeaderBg(idx)}`}>
                        Fuerza: {stats.avgSkill} ⭐
                      </span>
                    )}
                  </div>

                  {team.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500 border border-dashed border-brand-steel rounded-lg font-mono">
                      Sin jugadores asignados
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {team.map((player) => (
                        <li
                          key={player.id}
                          className="flex items-center justify-between py-2 px-3 bg-brand-obsidian/30 rounded-lg border border-brand-steel/20 text-sm hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <img
                              src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                              alt={player.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onViewAvatar) {
                                  onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                                }
                              }}
                              className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-200 truncate">{player.name}</span>
                              {player.isSpecial && (
                                <span className="text-[8px] bg-brand-lime/10 text-brand-lime font-bold px-1 rounded border border-brand-lime/20 flex items-center gap-0.5 w-fit mt-0.5 uppercase font-mono">
                                  <Shield className="w-2 h-2" /> {sport.specialPositions[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex gap-0.5">
                              {Array.from({ length: player.skillLevel }).map((_, i) => (
                                <span key={i} className="text-brand-orange text-xs">★</span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(player.id)}
                              className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-full transition-all cursor-pointer"
                              title="Remover de este equipo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suplentes Manuales */}
          {manualSubstitutesList.length > 0 && (
            <div className="bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/25">
              <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
                <Users className="w-4 h-4" /> Suplentes ({manualSubstitutesList.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {manualSubstitutesList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 py-1 pl-2.5 pr-1 bg-brand-obsidian/60 border border-brand-steel rounded-full text-xs font-semibold font-mono"
                  >
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAvatar) {
                          onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                        }
                      }}
                      className="w-5 h-5 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                    />
                    <span className="text-gray-300">{player.name}</span>
                    <span className="text-yellow-400 font-bold">({player.skillLevel}★)</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="p-0.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-full transition-all cursor-pointer"
                      title="Quitar de Suplentes"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDERIZADO DEL MODO AUTOMÁTICO */}
      {draftMode === 'auto' && teams.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between font-mono">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest font-display">
              Equipos Balanceados
            </h4>
            <span className="text-xs text-gray-500">
              Draft generado por Smart-Draft (Snake)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, idx) => {
              const stats = teamStats.find(s => s.teamIndex === idx);
              return (
                <div
                  key={idx}
                  className={`bg-gradient-to-br ${getTeamColor(idx)} border rounded-2xl p-5 shadow-xl transition-all duration-300 hover:translate-y-[-2px]`}
                >
                  <div className="flex items-center justify-between border-b border-brand-steel/50 pb-3 mb-4 font-mono">
                    <h5 className="font-extrabold text-white text-lg flex items-center gap-2 font-display">
                      Equipo {idx + 1}
                      <span className="text-xs font-medium text-gray-400">({team.length} jug.)</span>
                    </h5>
                    {stats && (
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${getTeamHeaderBg(idx)}`}>
                        Fuerza: {stats.avgSkill} ⭐
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {team.map((player) => (
                      <li
                        key={player.id}
                        className="flex items-center justify-between py-2 px-3 bg-brand-obsidian/30 rounded-lg border border-brand-steel/20 text-sm hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                            alt={player.name}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewAvatar) {
                                  onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                              }
                            }}
                            className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                            onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-200">{player.name}</span>
                            {player.isSpecial && (
                              <span className="text-[8px] bg-brand-lime/10 text-brand-lime font-bold px-1 rounded border border-brand-lime/20 flex items-center gap-0.5 w-fit mt-0.5 uppercase font-mono">
                                <Shield className="w-2 h-2" /> {sport.specialPositions[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-0.5">
                          {Array.from({ length: player.skillLevel }).map((_, i) => (
                            <span key={i} className="text-brand-orange text-xs">★</span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Suplentes */}
          {substitutes.length > 0 && (
            <div className="bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/25">
              <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
                <Users className="w-4 h-4" /> Suplentes ({substitutes.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {substitutes.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 py-1 px-2.5 bg-brand-obsidian/60 border border-brand-steel rounded-full text-xs font-semibold font-mono"
                  >
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAvatar) {
                          onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                        }
                      }}
                      className="w-5 h-5 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                    />
                    <span className="text-gray-300">{player.name}</span>
                    <span className="text-yellow-400 font-bold">({player.skillLevel}★)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Confirmación de Partido */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-brand-slate border border-brand-steel rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2 font-display">
              <CheckCircle className="w-5 h-5 text-brand-orange" /> Programar Partido
            </h3>

            <form onSubmit={handleSubmitConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-brand-orange" /> Fecha del Partido
                </label>
                <input
                  type="date"
                  required
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2.5 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-brand-orange" /> Horario
                </label>
                <input
                  type="time"
                  required
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2.5 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm font-semibold font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-brand-steel transition-all text-sm font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-lg transition-all text-sm font-mono cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
