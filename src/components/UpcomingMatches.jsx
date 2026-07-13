import React, { useState } from 'react';
import { Calendar, Clock, Award, Shield, CheckCircle, Edit2, Trash2, Users, X } from 'lucide-react';

export default function UpcomingMatches({ matches, players, isAdmin, onUpdateMatchScore, onDeleteMatch, onViewAvatar }) {
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [winnerChoice, setWinnerChoice] = useState('');
  
  const [editingRosterMatchId, setEditingRosterMatchId] = useState(null);
  const [editedTeams, setEditedTeams] = useState([]);
  const [editedSubstitutes, setEditedSubstitutes] = useState([]);

  const pendingMatches = matches.filter(m => m.status === 'pendiente');

  if (pendingMatches.length === 0) return null;

  const handleStartEditScore = (match) => {
    setEditingMatchId(match.id);
    setWinnerChoice('');
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

  const handleStartEditRoster = (match) => {
    setEditingRosterMatchId(match.id);
    setEditedTeams(JSON.parse(JSON.stringify(match.teams || [ { players: [] }, { players: [] } ])));
    setEditedSubstitutes(JSON.parse(JSON.stringify(match.substitutes || [])));
  };

  const handleSaveRoster = (matchId) => {
    onUpdateMatchScore(matchId, {
      teams: editedTeams,
      substitutes: editedSubstitutes
    });
    setEditingRosterMatchId(null);
    setEditedTeams([]);
    setEditedSubstitutes([]);
  };

  const handleCancelEditRoster = () => {
    setEditingRosterMatchId(null);
    setEditedTeams([]);
    setEditedSubstitutes([]);
  };

  const movePlayerToTeam = (player, fromTeamIndex, toTeamIndex) => {
    let newSubstitutes = [...editedSubstitutes];
    let newTeams = editedTeams.map(t => ({ players: [...t.players] }));
    
    if (fromTeamIndex === -1) {
      newSubstitutes = newSubstitutes.filter(p => p.id !== player.id);
    } else {
      newTeams[fromTeamIndex].players = newTeams[fromTeamIndex].players.filter(p => p.id !== player.id);
    }
    
    const playerCopy = { ...player };
    if (toTeamIndex === -1) {
      newSubstitutes.push(playerCopy);
    } else {
      newTeams[toTeamIndex].players.push(playerCopy);
    }
    
    setEditedTeams(newTeams);
    setEditedSubstitutes(newSubstitutes);
  };

  const removePlayerFromMatch = (player, fromTeamIndex) => {
    let newSubstitutes = [...editedSubstitutes];
    let newTeams = editedTeams.map(t => ({ players: [...t.players] }));
    
    if (fromTeamIndex === -1) {
      newSubstitutes = newSubstitutes.filter(p => p.id !== player.id);
    } else {
      newTeams[fromTeamIndex].players = newTeams[fromTeamIndex].players.filter(p => p.id !== player.id);
    }
    
    setEditedTeams(newTeams);
    setEditedSubstitutes(newSubstitutes);
  };

  const addPlayerToMatch = (player, toTeamIndex) => {
    const isInMatch = editedTeams.some(t => t.players.some(p => p.id === player.id)) || editedSubstitutes.some(p => p.id === player.id);
    if (isInMatch) return;
    
    const playerCopy = {
      id: player.id,
      name: player.name,
      gender: player.gender || null,
      avatar: player.avatar || null
    };
    
    let newSubstitutes = [...editedSubstitutes];
    let newTeams = editedTeams.map(t => ({ players: [...t.players] }));
    
    if (toTeamIndex === -1) {
      newSubstitutes.push(playerCopy);
    } else {
      newTeams[toTeamIndex].players.push(playerCopy);
    }
    
    setEditedTeams(newTeams);
    setEditedSubstitutes(newSubstitutes);
  };

  const getAvailablePlayers = () => {
    if (!players) return [];
    
    const matchPlayerIds = new Set([
      ...editedTeams.flatMap(t => t.players.map(p => p.id)),
      ...editedSubstitutes.map(p => p.id)
    ]);
    
    return players.filter(p => !matchPlayerIds.has(p.id));
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
          const isEditingRoster = editingRosterMatchId === match.id;
          
          const team1Players = isEditingRoster ? (editedTeams[0]?.players || []) : (match.teams[0]?.players || []);
          const team2Players = isEditingRoster ? (editedTeams[1]?.players || []) : (match.teams[1]?.players || []);
          const substitutesPlayers = isEditingRoster ? editedSubstitutes : (match.substitutes || []);
          
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
                        Formación: {team1Players.filter(p => p.gender?.toLowerCase() === 'femenino').length}F / {team1Players.length - team1Players.filter(p => p.gender?.toLowerCase() === 'femenino').length}M
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team1Players.map((p) => (
                        <li key={p.id} className="flex items-center gap-2.5 p-2 bg-brand-obsidian/45 border border-brand-steel/30 rounded-xl hover:border-brand-orange/30 transition-all relative">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => !isEditingRoster && onViewAvatar(p.avatar, p.name)}
                            className={`w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate ${!isEditingRoster ? 'cursor-zoom-in' : ''} animate-in fade-in`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-200 truncate">{p.name}</p>
                            {isEditingRoster ? (
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                                <button
                                  onClick={() => movePlayerToTeam(p, 0, 1)}
                                  className="text-brand-lime hover:underline cursor-pointer font-bold"
                                  title="Mover a Equipo 2"
                                >
                                  Mover a E2
                                </button>
                                <span className="text-gray-600">|</span>
                                <button
                                  onClick={() => movePlayerToTeam(p, 0, -1)}
                                  className="text-yellow-400 hover:underline cursor-pointer font-bold"
                                  title="Mover a Suplentes"
                                >
                                  Suplente
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] font-bold">
                                <span className={`px-1.5 py-0.2 rounded border uppercase ${
                                  p.gender?.toLowerCase() === 'femenino'
                                    ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                    : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                                }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                              </div>
                            )}
                          </div>
                          {isEditingRoster && (
                            <button
                              onClick={() => removePlayerFromMatch(p, 0)}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                              title="Quitar del partido"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                        Formación: {team2Players.filter(p => p.gender?.toLowerCase() === 'femenino').length}F / {team2Players.length - team2Players.filter(p => p.gender?.toLowerCase() === 'femenino').length}M
                      </span>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team2Players.map((p) => (
                        <li key={p.id} className="flex items-center gap-2.5 p-2 bg-brand-obsidian/45 border border-brand-steel/30 rounded-xl hover:border-brand-lime/30 transition-all relative">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => !isEditingRoster && onViewAvatar(p.avatar, p.name)}
                            className={`w-8 h-8 rounded-full border border-brand-steel object-cover bg-brand-slate ${!isEditingRoster ? 'cursor-zoom-in' : ''} animate-in fade-in`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-200 truncate">{p.name}</p>
                            {isEditingRoster ? (
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px]">
                                <button
                                  onClick={() => movePlayerToTeam(p, 1, 0)}
                                  className="text-brand-orange hover:underline cursor-pointer font-bold"
                                  title="Mover a Equipo 1"
                                >
                                  Mover a E1
                                </button>
                                <span className="text-gray-600">|</span>
                                <button
                                  onClick={() => movePlayerToTeam(p, 1, -1)}
                                  className="text-yellow-400 hover:underline cursor-pointer font-bold"
                                  title="Mover a Suplentes"
                                >
                                  Suplente
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 mt-1 font-mono text-[8px] font-bold">
                                <span className={`px-1.5 py-0.2 rounded border uppercase ${
                                  p.gender?.toLowerCase() === 'femenino'
                                    ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                    : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                                }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                              </div>
                            )}
                          </div>
                          {isEditingRoster && (
                            <button
                              onClick={() => removePlayerFromMatch(p, 1)}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                              title="Quitar del partido"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Substitutes if present */}
                {(substitutesPlayers.length > 0 || isEditingRoster) && (
                  <div className="mt-5 pt-4 border-t border-brand-steel/40 font-mono">
                    <p className="text-[10px] font-bold text-yellow-400 uppercase mb-2 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Suplentes Convencionales ({substitutesPlayers.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {substitutesPlayers.map(p => (
                        <div key={p.id} className="text-xs bg-brand-obsidian/60 text-gray-300 px-3 py-1 rounded-full border border-brand-steel flex items-center gap-2 relative">
                          <img
                            src={p.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(p.name)}`}
                            alt={p.name}
                            onClick={() => !isEditingRoster && onViewAvatar(p.avatar, p.name)}
                            className={`w-4.5 h-4.5 rounded-full object-cover bg-brand-slate ${!isEditingRoster ? 'cursor-zoom-in' : ''}`}
                          />
                          <span className="font-semibold text-[11px]">{p.name}</span>
                          {isEditingRoster ? (
                            <div className="flex items-center gap-1 font-mono text-[8px] font-bold">
                              <button
                                onClick={() => movePlayerToTeam(p, -1, 0)}
                                className="text-brand-orange hover:underline cursor-pointer"
                                title="Mover a Equipo 1"
                              >
                                E1
                              </button>
                              <span className="text-gray-600">|</span>
                              <button
                                onClick={() => movePlayerToTeam(p, -1, 1)}
                                className="text-brand-lime hover:underline cursor-pointer"
                                title="Mover a Equipo 2"
                              >
                                E2
                              </button>
                              <span className="text-gray-600">|</span>
                              <button
                                onClick={() => removePlayerFromMatch(p, -1)}
                                className="text-red-400 hover:text-red-300 cursor-pointer ml-0.5"
                                title="Quitar del partido"
                              >
                                <X className="w-3.5 h-3.5 inline" />
                              </button>
                            </div>
                          ) : (
                            <span className={`px-1.5 py-0.2 rounded border uppercase text-[8px] font-bold ${
                              p.gender?.toLowerCase() === 'femenino'
                                ? 'bg-brand-lime/10 text-brand-lime border-brand-lime/20'
                                : 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                            }`}>{p.gender === 'Femenino' ? 'FEM' : 'MASC'}</span>
                          )}
                        </div>
                      ))}
                      {isEditingRoster && substitutesPlayers.length === 0 && (
                        <span className="text-xs text-gray-500 font-mono italic">No hay suplentes en este partido.</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Players list (Only when editing roster) */}
                {isEditingRoster && (
                  <div className="mt-5 pt-4 border-t border-brand-steel/40 font-mono">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                      Jugadores Disponibles (No convocados)
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-brand-obsidian/20 rounded-lg border border-brand-steel/30">
                      {getAvailablePlayers().length === 0 ? (
                        <span className="text-xs text-gray-500 italic p-1">Todos los jugadores del roster ya están convocados.</span>
                      ) : (
                        getAvailablePlayers().map(p => (
                          <div key={p.id} className="text-xs bg-brand-slate text-gray-300 px-3 py-1 rounded-full border border-brand-steel/50 flex items-center gap-2">
                            <span className="font-semibold text-[11px]">{p.name}</span>
                            <div className="flex items-center gap-1.5 font-mono text-[8px] font-bold">
                              <button
                                onClick={() => addPlayerToMatch(p, 0)}
                                className="text-brand-orange hover:underline cursor-pointer"
                                title="Agregar a Equipo 1"
                              >
                                +E1
                              </button>
                              <span className="text-gray-600">|</span>
                              <button
                                onClick={() => addPlayerToMatch(p, 1)}
                                className="text-brand-lime hover:underline cursor-pointer"
                                title="Agregar a Equipo 2"
                              >
                                +E2
                              </button>
                              <span className="text-gray-600">|</span>
                              <button
                                onClick={() => addPlayerToMatch(p, -1)}
                                className="text-yellow-400 hover:underline cursor-pointer"
                                title="Agregar a Suplentes"
                              >
                                +Supl
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Action Area / Load Result or Edit Teams */}
                <div className="mt-6 pt-4 border-t border-brand-steel/40 flex flex-wrap items-center justify-between gap-3 font-mono">
                  {isEditingRoster ? (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleSaveRoster(match.id)}
                        className="px-5 py-2 bg-brand-lime text-brand-obsidian font-bold text-xs rounded-xl hover:bg-brand-lime-dark transition-all cursor-pointer"
                      >
                        Guardar Formaciones
                      </button>
                      <button
                        onClick={handleCancelEditRoster}
                        className="px-4 py-2 bg-transparent border border-brand-steel hover:bg-white/5 text-gray-400 text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditRoster(match)}
                          className="px-4 py-2 bg-brand-steel/30 hover:bg-brand-steel/50 text-white border border-brand-steel/50 transition-all text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Editar Equipos
                        </button>
                        
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditScore(match)}
                            className="px-6 py-2 bg-brand-orange/15 hover:bg-brand-orange text-brand-orange hover:text-white border border-brand-orange/30 hover:border-brand-orange transition-all duration-300 text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-brand-orange/5"
                          >
                            Registrar Resultado Final
                          </button>
                        )}
                      </div>
                    )
                  )}

                  {isEditing && (
                    <div className="flex items-center gap-3 bg-brand-obsidian/50 px-4 py-2 rounded-xl border border-brand-steel">
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
                        className="ml-1 px-3 py-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold text-xs rounded transition-all cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditingMatchId(null);
                          setWinnerChoice('');
                        }}
                        className="px-2.5 py-1 bg-transparent border border-brand-steel hover:bg-white/5 text-gray-400 text-xs rounded transition-all cursor-pointer"
                      >
                        X
                      </button>
                    </div>
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
