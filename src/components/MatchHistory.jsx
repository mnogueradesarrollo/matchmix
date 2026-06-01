import React, { useState } from 'react';
import { Calendar, Clock, Trophy, Trash2, Award, CheckCircle, ChevronDown, ChevronUp, Edit2, Users } from 'lucide-react';

export default function MatchHistory({ matches, sport, isAdmin, onUpdateMatchScore, onDeleteMatch }) {
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const handleStartEditScore = (match) => {
    setEditingMatchId(match.id);
    setScore1(match.score?.team1 ?? '');
    setScore2(match.score?.team2 ?? '');
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
    setScore1('');
    setScore2('');
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
      <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Trophy className="w-4.5 h-4.5 text-neonGreen" /> Historial de Partidos ({matches.length})
      </h3>

      {matches.length === 0 ? (
        <div className="bg-darkBg-card border border-darkBg-border/60 rounded-xl p-8 text-center text-gray-500 text-xs">
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
                className={`bg-darkBg-card border rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isPending 
                    ? 'border-darkBg-border hover:border-yellow-500/20' 
                    : 'border-neonGreen/15 hover:border-neonGreen/30'
                }`}
              >
                {/* Encabezado de la Tarjeta */}
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-darkBg-input/20 border-b border-darkBg-border/40">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-200">
                      <Calendar className="w-3.5 h-3.5 text-neonGreen" /> {formatDate(match.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-neonGreen" /> {match.time} hs
                    </span>
                    
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isPending 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                        : 'bg-neonGreen/10 text-neonGreen border border-neonGreen/20'
                    }`}>
                      {isPending ? 'Pendiente' : 'Finalizado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
                    <button
                      onClick={() => toggleExpand(match.id)}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2.5 py-1 bg-darkBg-input/60 rounded border border-darkBg-border"
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
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                        title="Eliminar partido del historial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Contenido / VS */}
                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-b from-transparent to-darkBg-input/10">
                  
                  {/* Equipo 1 */}
                  <div className="flex-1 text-center md:text-right w-full">
                    <h4 className={`text-sm font-extrabold ${hasWinner && winnerIndex === 0 ? 'text-neonGreen' : 'text-gray-300'}`}>
                      Equipo 1
                    </h4>
                    {hasWinner && winnerIndex === 0 && (
                      <span className="text-[10px] text-neonGreen font-semibold inline-flex items-center gap-0.5 mt-0.5 bg-neonGreen/5 px-1.5 py-0.5 rounded border border-neonGreen/10">
                        <Award className="w-2.5 h-2.5" /> Ganador
                      </span>
                    )}
                  </div>

                  {/* Marcador Central */}
                  <div className="flex items-center justify-center gap-4 bg-darkBg-input/40 px-6 py-3 rounded-2xl border border-darkBg-border shadow-inner w-full md:w-auto">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={score1}
                          onChange={(e) => setScore1(e.target.value)}
                          className="w-12 text-center bg-darkBg-card border border-darkBg-border focus:border-neonGreen outline-none text-lg font-black text-white rounded-lg py-1"
                        />
                        <span className="text-gray-500 font-bold">-</span>
                        <input
                          type="number"
                          min="0"
                          value={score2}
                          onChange={(e) => setScore2(e.target.value)}
                          className="w-12 text-center bg-darkBg-card border border-darkBg-border focus:border-neonGreen outline-none text-lg font-black text-white rounded-lg py-1"
                        />
                        <button
                          onClick={() => handleSaveScore(match.id)}
                          className="ml-2 px-3 py-1 bg-neonGreen hover:bg-neonGreen-dark text-darkBg font-bold text-xs rounded transition-all"
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => setEditingMatchId(null)}
                          className="px-2 py-1 bg-transparent border border-darkBg-border hover:bg-white/5 text-gray-400 text-xs rounded transition-all"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        {isPending ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-1">Resultado</span>
                            <button
                              onClick={() => handleStartEditScore(match)}
                              className="px-4 py-1.5 bg-neonGreen hover:bg-neonGreen-dark text-darkBg font-black text-xs rounded-lg transition-all shadow-md shadow-neonGreen/5 active:scale-95"
                            >
                              Cargar Score
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className={`text-2xl font-black ${winnerIndex === 0 ? 'text-neonGreen font-extrabold' : 'text-gray-300'}`}>
                              {t1Score}
                            </span>
                            <span className="text-gray-600 font-bold">vs</span>
                            <span className={`text-2xl font-black ${winnerIndex === 1 ? 'text-neonGreen font-extrabold' : 'text-gray-300'}`}>
                              {t2Score}
                            </span>
                            <button
                              onClick={() => handleStartEditScore(match)}
                              className="p-1 text-gray-600 hover:text-neonGreen rounded transition-all"
                              title="Editar Score"
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
                    <h4 className={`text-sm font-extrabold ${hasWinner && winnerIndex === 1 ? 'text-neonGreen' : 'text-gray-300'}`}>
                      Equipo 2
                    </h4>
                    {hasWinner && winnerIndex === 1 && (
                      <span className="text-[10px] text-neonGreen font-semibold inline-flex items-center gap-0.5 mt-0.5 bg-neonGreen/5 px-1.5 py-0.5 rounded border border-neonGreen/10">
                        <Award className="w-2.5 h-2.5" /> Ganador
                      </span>
                    )}
                  </div>

                </div>

                {/* Listados de Formaciones Expandidas */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-darkBg-border/30 bg-darkBg-card/40 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Lista Equipo 1 */}
                    <div className="bg-darkBg-input/10 p-3.5 rounded-lg border border-darkBg-border/20">
                      <h5 className="text-xs font-bold text-gray-300 mb-3 border-b border-darkBg-border/30 pb-2">Equipo 1</h5>
                      <ul className="space-y-2">
                        {match.teams[0]?.players?.map((p) => (
                          <li key={p.id} className="text-sm text-gray-200 flex items-center justify-between p-1 hover:bg-white/5 rounded-lg transition-all">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                className="w-8 h-8 rounded-full border border-darkBg-border/50 object-cover bg-darkBg-card"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                            <span className="text-[10px] bg-darkBg-input px-2 py-0.5 rounded-full text-neonGreen font-bold border border-darkBg-border/40">
                              {p.skillLevel}★
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Lista Equipo 2 */}
                    <div className="bg-darkBg-input/10 p-3.5 rounded-lg border border-darkBg-border/20">
                      <h5 className="text-xs font-bold text-gray-300 mb-3 border-b border-darkBg-border/30 pb-2">Equipo 2</h5>
                      <ul className="space-y-2">
                        {match.teams[1]?.players?.map((p) => (
                          <li key={p.id} className="text-sm text-gray-200 flex items-center justify-between p-1 hover:bg-white/5 rounded-lg transition-all">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                className="w-8 h-8 rounded-full border border-darkBg-border/50 object-cover bg-darkBg-card"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                            <span className="text-[10px] bg-darkBg-input px-2 py-0.5 rounded-full text-neonGreen font-bold border border-darkBg-border/40">
                              {p.skillLevel}★
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Suplentes si existen */}
                    {match.substitutes && match.substitutes.length > 0 && (
                      <div className="md:col-span-2 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10">
                        <h5 className="text-xs font-bold text-yellow-400/90 mb-2 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> Suplentes ({match.substitutes.length})
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {match.substitutes.map(p => (
                            <div key={p.id} className="text-xs bg-darkBg-input/80 text-gray-300 px-3 py-1.5 rounded-full border border-darkBg-border flex items-center gap-2">
                              <img
                                src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                                alt={p.name}
                                className="w-5 h-5 rounded-full border border-darkBg-border/30 object-cover"
                                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                              />
                              <span className="font-semibold">{p.name}</span>
                              <span className="text-[10px] text-yellow-400 font-bold">({p.skillLevel}★)</span>
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
