import React, { useState } from 'react';
import { Calendar, Clock, Award, Shield, CheckCircle, Edit2, Trash2, Users } from 'lucide-react';

export default function UpcomingMatches({ matches, isAdmin, onUpdateMatchScore, onDeleteMatch, onViewAvatar }) {
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');

  const pendingMatches = matches.filter(m => m.status === 'pendiente');

  if (pendingMatches.length === 0) return null;

  const handleStartEditScore = (match) => {
    setEditingMatchId(match.id);
    setScore1('');
    setScore2('');
  };

  const handleSaveScore = (matchId) => {
    const s1 = parseInt(score1, 10);
    const s2 = parseInt(score2, 10);
    
    if (isNaN(s1) || isNaN(s2)) {
      alert("Por favor, ingresa puntuaciones válidas.");
      return;
    }

    onUpdateMatchScore(matchId, {
      status: 'finalizado',
      score: { team1: s1, team2: s2 }
    });

    setEditingMatchId(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return 'S/F';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-orange"></span>
        </span>
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">
          Cartelera de Partidos (Pendientes)
        </h3>
      </div>

      <div className="space-y-6">
        {pendingMatches.map((match) => {
          const isEditing = editingMatchId === match.id;
          
          return (
            <div 
              key={match.id}
              className="bg-gradient-to-b from-brand-slate to-brand-obsidian/90 border border-brand-orange/40 rounded-2xl overflow-hidden shadow-xl shadow-brand-orange/5"
            >
              {/* Telemetry Top Bar */}
              <div className="bg-brand-obsidian/40 border-b border-brand-steel/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3 font-mono">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-brand-orange">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(match.date)}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {match.time} hs
                  </span>
                  <span className="text-[10px] text-gray-400 bg-brand-steel/30 px-2 py-0.5 rounded border border-brand-steel">
                    {match.sportName || 'Deporte'}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm("¿Deseas eliminar este partido pendiente?")) {
                        onDeleteMatch(match.id);
                      }
                    }}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                    title="Eliminar partido"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Roster Matchup Layout */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Central Divider */}
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-brand-steel/40 -translate-x-1/2"></div>
                  
                  {/* Team 1 Lineup */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-steel/30 pb-2">
                      <h4 className="font-display font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-orange"></span>
                        Equipo 1
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400 font-bold bg-brand-steel/20 px-2 py-0.5 rounded">
                        Fuerza Promedio: {(match.teams[0]?.players?.reduce((sum, p) => sum + p.skillLevel, 0) / (match.teams[0]?.players?.length || 1)).toFixed(1)} ★
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {match.teams[0]?.players?.map((p) => (
                        <li key={p.id} className="flex items-center gap-2.5 p-2 bg-brand-obsidian/45 border border-brand-steel/30 rounded-xl hover:border-brand-orange/30 transition-all">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => onViewAvatar(p.avatar, p.name)}
                            className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in animate-in fade-in"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-200 truncate">{p.name}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {Array.from({ length: p.skillLevel }).map((_, i) => (
                                <span key={i} className="text-brand-orange text-[9px]">★</span>
                              ))}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Team 2 Lineup */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-brand-steel/30 pb-2">
                      <h4 className="font-display font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-lime"></span>
                        Equipo 2
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400 font-bold bg-brand-steel/20 px-2 py-0.5 rounded">
                        Fuerza Promedio: {(match.teams[1]?.players?.reduce((sum, p) => sum + p.skillLevel, 0) / (match.teams[1]?.players?.length || 1)).toFixed(1)} ★
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {match.teams[1]?.players?.map((p) => (
                        <li key={p.id} className="flex items-center gap-2.5 p-2 bg-brand-obsidian/45 border border-brand-steel/30 rounded-xl hover:border-brand-lime/30 transition-all">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => onViewAvatar(p.avatar, p.name)}
                            className="w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in animate-in fade-in"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-200 truncate">{p.name}</p>
                            <div className="flex gap-0.5 mt-0.5">
                              {Array.from({ length: p.skillLevel }).map((_, i) => (
                                <span key={i} className="text-brand-orange text-[9px]">★</span>
                              ))}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Substitutes if present */}
                {match.substitutes && match.substitutes.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-brand-steel/40 font-mono">
                    <p className="text-[10px] font-bold text-yellow-400 uppercase mb-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Suplentes Convencionales ({match.substitutes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {match.substitutes.map(p => (
                        <div key={p.id} className="text-xs bg-brand-obsidian/60 text-gray-300 px-3 py-1 rounded-full border border-brand-steel flex items-center gap-2">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => onViewAvatar(p.avatar, p.name)}
                            className="w-4.5 h-4.5 rounded-full object-cover bg-brand-slate cursor-zoom-in"
                          />
                          <span className="font-semibold text-[11px]">{p.name}</span>
                          <span className="text-yellow-400 text-[9px] font-bold">({p.skillLevel}★)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Area / Load Result */}
                <div className="mt-6 pt-4 border-t border-brand-steel/40 flex items-center justify-center">
                  {isEditing ? (
                    <div className="flex items-center gap-3 bg-brand-obsidian/50 px-4 py-2 rounded-xl border border-brand-steel font-mono">
                      <input
                        type="number"
                        min="0"
                        placeholder="E1"
                        value={score1}
                        onChange={(e) => setScore1(e.target.value)}
                        className="w-12 text-center bg-brand-slate border border-brand-steel focus:border-brand-orange outline-none text-sm font-black text-white rounded-lg py-1"
                      />
                      <span className="text-gray-500 font-bold">-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="E2"
                        value={score2}
                        onChange={(e) => setScore2(e.target.value)}
                        className="w-12 text-center bg-brand-slate border border-brand-steel focus:border-brand-orange outline-none text-sm font-black text-white rounded-lg py-1"
                      />
                      <button
                        onClick={() => handleSaveScore(match.id)}
                        className="ml-1 px-3 py-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs rounded transition-all cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingMatchId(null)}
                        className="px-2.5 py-1 bg-transparent border border-brand-steel hover:bg-white/5 text-gray-400 text-xs rounded transition-all cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => handleStartEditScore(match)}
                        className="px-6 py-2 bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-white border border-brand-orange/30 hover:border-brand-orange transition-all duration-300 text-xs font-bold font-mono rounded-xl cursor-pointer shadow-md shadow-brand-orange/5"
                      >
                        Registrar Resultado Final
                      </button>
                    )
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
