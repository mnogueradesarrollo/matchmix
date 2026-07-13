import React, { useState } from 'react';
import { Calendar, Clock, Trophy, Trash2, Award, CheckCircle, ChevronDown, ChevronUp, Edit2, Users } from 'lucide-react';

export default function MatchHistory({ matches, sport, isAdmin, onUpdateMatchScore, onDeleteMatch, onViewAvatar }) {
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [winnerChoice, setWinnerChoice] = useState('');
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const handleStartEditScore = (match) => {
    setEditingMatchId(match.id);
    const t1 = match.score?.team1;
    const t2 = match.score?.team2;
    if (t1 === null || t2 === null || t1 === undefined || t2 === undefined) {
      setWinnerChoice('');
    } else if (t1 > t2) {
      setWinnerChoice('0');
    } else if (t2 > t1) {
      setWinnerChoice('1');
    } else {
      setWinnerChoice('-1');
    }
  };

  const handleSaveScore = (matchId) => {
    if (!winnerChoice) {
      alert("Por favor, selecciona un resultado.");
      return;
    }
    
    const choice = parseInt(winnerChoice, 10);
    let t1Val = 0;
    let t2Val = 0;
    if (choice === 0) {
      t1Val = 1;
      t2Val = 0;
    } else if (choice === 1) {
      t1Val = 0;
      t2Val = 1;
    } else if (choice === -1) {
      t1Val = 0;
      t2Val = 0;
    }

    onUpdateMatchScore(matchId, {
      status: 'finalizado',
      score: { team1: t1Val, team2: t2Val }
    });

    setEditingMatchId(null);
    setWinnerChoice('');
  };

  const handleDelete = (matchId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este partido del historial?")) {
      onDeleteMatch(matchId);
    }
  };

  const toggleExpand = (matchId) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 'S/F';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-12">
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2 font-display">
        <Trophy className="w-4.5 h-4.5 text-brand-orange" /> Historial de Partidos ({matches.length})
      </h3>

      {matches.length === 0 ? (
        <div className="bg-brand-slate border border-brand-steel rounded-xl p-8 text-center text-gray-500 text-xs font-mono">
          <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-600 stroke-1" />
          <span>Aún no hay partidos confirmados en este deporte.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => {
            const isPending = match.status === 'pendiente';
            const isEditing = editingMatchId === match.id;
            const isExpanded = expandedMatchId === match.id;
            
            // Determinar ganador
            const t1Score = match.score?.team1 ?? 0;
            const t2Score = match.score?.team2 ?? 0;
            const hasWinner = !isPending;
            const winnerIndex = t1Score > t2Score ? 0 : t2Score > t1Score ? 1 : -1; // -1 es empate

            return (
              <div
                key={match.id}
                className={`bg-brand-slate border rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-all duration-300 ${
                  isPending 
                    ? 'border-brand-steel hover:border-yellow-500/20' 
                    : 'border-brand-lime/15 hover:border-brand-lime/30'
                }`}
              >
                {/* Encabezado de la Tarjeta */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-brand-obsidian/20 border-b border-brand-steel/40 font-mono">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" /> {formatDate(match.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-orange" /> {match.time} hs
                    </span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPending 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                        : 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                    }`}>
                      {isPending ? 'Pendiente' : 'Finalizado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                    <button
                      onClick={() => toggleExpand(match.id)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-brand-obsidian/60 rounded border border-brand-steel cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Contraer Roster <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Ver Formaciones <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(match.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                        title="Eliminar partido del historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contenido / VS */}
                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-b from-transparent to-brand-obsidian/10">
                  
                  {/* Equipo 1 */}
                  <div className="flex-1 text-center md:text-right w-full">
                    <h4 className={`text-sm font-extrabold font-display ${hasWinner && winnerIndex === 0 ? 'text-brand-orange' : 'text-gray-300'}`}>
                      Equipo 1
                    </h4>
                    {hasWinner && winnerIndex === 0 && (
                      <span className="text-[10px] text-brand-orange font-bold inline-flex items-center gap-0.5 mt-0.5 bg-brand-orange/5 px-1.5 py-0.5 rounded border border-brand-orange/10 font-mono">
                        <Award className="w-2.5 h-2.5" /> Ganador
                      </span>
                    )}
                    {hasWinner && winnerIndex === 1 && (
                      <span className="text-[10px] text-gray-400 font-bold inline-flex items-center gap-0.5 mt-0.5 bg-gray-500/5 px-1.5 py-0.5 rounded border border-gray-500/10 font-mono">
                        Perdedor
                      </span>
                    )}
                    {hasWinner && winnerIndex === -1 && (
                      <span className="text-[10px] text-yellow-500 font-bold inline-flex items-center gap-0.5 mt-0.5 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10 font-mono">
                        Empate
                      </span>
                    )}
                  </div>

                  {/* Marcador Central */}
                  <div className="flex items-center justify-center gap-4 bg-brand-obsidian/40 px-6 py-3 rounded-2xl border border-brand-steel shadow-inner w-full md:w-auto">
                    {isEditing ? (
                      <div className="flex items-center gap-2 font-mono">
                        <select
                          value={winnerChoice}
                          onChange={(e) => setWinnerChoice(e.target.value)}
                          className="bg-brand-slate border border-brand-steel focus:border-brand-orange outline-none text-xs font-semibold text-white rounded-lg py-1.5 px-2.5 cursor-pointer"
                        >
                          <option value="">Seleccionar resultado</option>
                          <option value="0">Ganador: Equipo 1</option>
                          <option value="1">Ganador: Equipo 2</option>
                          <option value="-1">Empate</option>
                        </select>
                        <button
                          onClick={() => handleSaveScore(match.id)}
                          className="ml-2 px-3 py-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs rounded transition-all cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingMatchId(null);
                            setWinnerChoice('');
                          }}
                          className="px-2 py-1 bg-transparent border border-brand-steel hover:bg-white/5 text-gray-400 text-xs rounded transition-all cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {isPending ? (
                          <div className="flex flex-col items-center font-mono">
                            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Resultado</span>
                            <button
                              onClick={() => handleStartEditScore(match)}
                              className="px-4 py-1.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-black text-xs rounded-lg transition-all shadow-md shadow-brand-orange/5 active:scale-95 cursor-pointer"
                            >
                              Cargar Resultado
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs text-gray-400 font-bold font-mono px-3 py-1 bg-brand-obsidian rounded-lg border border-brand-steel">
                              Finalizado
                            </span>
                            <button
                              onClick={() => handleStartEditScore(match)}
                              className="p-1 text-gray-600 hover:text-brand-orange rounded transition-all cursor-pointer"
                              title="Editar Resultado"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Equipo 2 */}
                  <div className="flex-1 text-center md:text-left w-full">
                    <h4 className={`text-sm font-extrabold font-display ${hasWinner && winnerIndex === 1 ? 'text-brand-orange' : 'text-gray-300'}`}>
                      Equipo 2
                    </h4>
                    {hasWinner && winnerIndex === 1 && (
                      <span className="text-[10px] text-brand-orange font-bold inline-flex items-center gap-0.5 mt-0.5 bg-brand-orange/5 px-1.5 py-0.5 rounded border border-brand-orange/10 font-mono">
                        <Award className="w-2.5 h-2.5" /> Ganador
                      </span>
                    )}
                    {hasWinner && winnerIndex === 0 && (
                      <span className="text-[10px] text-gray-400 font-bold inline-flex items-center gap-0.5 mt-0.5 bg-gray-500/5 px-1.5 py-0.5 rounded border border-gray-500/10 font-mono">
                        Perdedor
                      </span>
                    )}
                    {hasWinner && winnerIndex === -1 && (
                      <span className="text-[10px] text-yellow-500 font-bold inline-flex items-center gap-0.5 mt-0.5 bg-yellow-500/5 px-1.5 py-0.5 rounded border border-yellow-500/10 font-mono">
                        Empate
                      </span>
                    )}
                  </div>

                </div>

                {/* Listados de Formaciones Expandidas */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-brand-steel/30 bg-brand-slate/40 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Lista Equipo 1 */}
                    <div className="bg-brand-obsidian/10 p-3.5 rounded-lg border border-brand-steel/20">
                      <h5 className="text-xs font-bold text-gray-300 mb-3 border-b border-brand-steel/30 pb-2 font-display">Equipo 1</h5>
                      <ul className="space-y-2">
                        {match.teams[0]?.players?.map((p) => (
                          <li key={p.id} className="text-sm text-gray-200 flex items-center justify-between p-1 hover:bg-white/5 rounded-lg transition-all">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onViewAvatar) {
                                    onViewAvatar(p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`, p.name);
                                  }
                                }}
                                className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded border uppercase text-[8px] font-bold font-mono ${
                              p.gender?.toLowerCase() === 'femenino'
                                ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                            }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Lista Equipo 2 */}
                    <div className="bg-brand-obsidian/10 p-3.5 rounded-lg border border-brand-steel/20">
                      <h5 className="text-xs font-bold text-gray-300 mb-3 border-b border-brand-steel/30 pb-2 font-display">Equipo 2</h5>
                      <ul className="space-y-2">
                        {match.teams[1]?.players?.map((p) => (
                          <li key={p.id} className="text-sm text-gray-200 flex items-center justify-between p-1 hover:bg-white/5 rounded-lg transition-all">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onViewAvatar) {
                                    onViewAvatar(p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`, p.name);
                                  }
                                }}
                                className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded border uppercase text-[8px] font-bold font-mono ${
                              p.gender?.toLowerCase() === 'femenino'
                                ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                            }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suplentes si existen */}
                    {match.substitutes && match.substitutes.length > 0 && (
                      <div className="md:col-span-2 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10 font-mono">
                        <h5 className="text-xs font-bold text-yellow-400/90 mb-2 flex items-center gap-1 font-display">
                          <Users className="w-3.5 h-3.5" /> Suplentes ({match.substitutes.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {match.substitutes.map(p => (
                            <div key={p.id} className="text-xs bg-brand-obsidian/85 text-gray-300 px-3 py-1.5 rounded-full border border-brand-steel flex items-center gap-2">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onViewAvatar) {
                                    onViewAvatar(p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`, p.name);
                                  }
                                }}
                                className="w-5 h-5 rounded-full border border-brand-steel object-cover cursor-zoom-in hover:scale-105 transition-all"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                              <span className={`px-1.5 py-0.2 rounded border uppercase text-[8px] font-bold ${
                                p.gender?.toLowerCase() === 'femenino'
                                  ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                  : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                              }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

