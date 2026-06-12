import { Sparkles, Users, Shuffle, Shield, AlertTriangle, CheckCircle, Calendar, Clock, X } from 'lucide-react';
import { generateBalancedTeams } from '../utils/smartDraft';

export default function MatchGenerator({ selectedPlayers, sport, onConfirmMatch }) {
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
      'border-neonGreen/40 from-neonGreen/5 to-transparent',
      'border-blue-400/40 from-blue-400/5 to-transparent',
      'border-purple-400/40 from-purple-400/5 to-transparent',
      'border-orange-400/40 from-orange-400/5 to-transparent',
      'border-pink-400/40 from-pink-400/5 to-transparent',
    ];
    return colors[index % colors.length];
  };

  const getTeamHeaderBg = (index) => {
    const badges = [
      'bg-neonGreen/10 text-neonGreen border-neonGreen/20',
      'bg-blue-400/10 text-blue-400 border-blue-400/20',
      'bg-purple-400/10 text-purple-400 border-purple-400/20',
      'bg-orange-400/10 text-orange-400 border-orange-400/20',
      'bg-pink-400/10 text-pink-400 border-pink-400/20',
    ];
    return badges[index % badges.length];
  };

  const hasResults = draftMode === 'auto' 
    ? teams.length > 0 
    : Object.keys(manualAssignments).length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-10">
      
      {/* Panel de Controles */}
      <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg mb-6">
        {/* Selector de modo */}
        <div className="flex bg-darkBg-input p-1 rounded-xl border border-darkBg-border w-fit mb-4">
          <button
            onClick={() => { setDraftMode('auto'); handleClear(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${draftMode === 'auto' ? 'bg-neonGreen text-darkBg shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Balanceo Automático
          </button>
          <button
            onClick={() => { setDraftMode('manual'); handleClear(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${draftMode === 'manual' ? 'bg-neonGreen text-darkBg shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Armado Manual
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neonGreen" /> {draftMode === 'auto' ? 'Panel de Draft Inteligente' : 'Armador de Equipos Manual'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Seleccionados: <strong className="text-neonGreen">{selectedPlayers.length}</strong> jugadores.
              El deporte requiere equipos de <strong className="text-neonGreen">{sport.playersPerTeam}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasResults && (
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="py-2 px-4 bg-transparent hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 transition-all text-xs font-semibold rounded-lg active:scale-95"
                >
                  Limpiar Equipos
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="py-2 px-4 bg-neonGreen hover:bg-neonGreen-dark text-darkBg transition-all text-xs font-bold rounded-lg active:scale-95 flex items-center gap-1.5 shadow shadow-neonGreen/10"
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
                className="w-16 bg-darkBg-input text-gray-100 rounded-lg py-1.5 px-2.5 border border-darkBg-border focus:border-neonGreen outline-none text-xs text-center font-bold"
              />
            </div>

            {draftMode === 'auto' && (
              <button
                onClick={handleGenerate}
                disabled={selectedPlayers.length < 2 || isGenerating}
                className={`flex items-center gap-2 py-2.5 px-6 font-bold rounded-lg transition-all text-sm shadow-lg ${
                  selectedPlayers.length >= 2
                    ? 'bg-neonGreen hover:bg-neonGreen-dark text-darkBg shadow-neonGreen/10 active:scale-95'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-darkBg-border'
                }`}
              >
                <Shuffle className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Calculando Balanceo...' : 'Generar Equipos'}
              </button>
            )}
          </div>
        </div>

        {selectedPlayers.length < 2 && (
          <div className="mt-4 flex items-center gap-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Debes seleccionar al menos 2 jugadores para poder armar los equipos.</span>
          </div>
        )}
      </div>

      {/* RENDERIZADO DEL MODO MANUAL */}
      {draftMode === 'manual' && selectedPlayers.length >= 2 && (
        <div className="space-y-6">
          {/* Jugadores Disponibles para Asignar */}
          <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-neonGreen" /> Jugadores Disponibles ({unassignedPlayers.length})
            </h4>
            
            {unassignedPlayers.length === 0 ? (
              <p className="text-xs text-neonGreen/80 font-bold bg-neonGreen/5 py-3 px-4 rounded-lg border border-neonGreen/10 text-center">
                🎉 ¡Todos los jugadores han sido asignados a un equipo!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {unassignedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 bg-darkBg-input/40 border border-darkBg-border/50 rounded-lg text-xs hover:bg-darkBg-input/80 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <img
                        src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                        alt={player.name}
                        className="w-7 h-7 rounded-full border border-darkBg-border object-cover bg-darkBg-card"
                        onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                      />
                      <span className="font-semibold text-gray-300 truncate">{player.name}</span>
                      <span className="text-neonGreen font-bold flex-shrink-0">({player.skillLevel}★)</span>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                      {Array.from({ length: numTeams }).map((_, teamIdx) => (
                        <button
                          key={teamIdx}
                          onClick={() => handleAssignPlayer(player.id, teamIdx)}
                          className="px-1.5 py-1 bg-neonGreen/10 hover:bg-neonGreen/30 text-neonGreen hover:text-white border border-neonGreen/20 rounded font-bold transition-all text-[9px]"
                          title={`Asignar al Equipo ${teamIdx + 1}`}
                        >
                          E{teamIdx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handleAssignPlayer(player.id, 'sub')}
                        className="px-1.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/30 text-yellow-400 hover:text-white border border-yellow-500/20 rounded font-bold transition-all text-[9px]"
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
                  <div className="flex items-center justify-between border-b border-darkBg-border/50 pb-3 mb-4">
                    <h5 className="font-extrabold text-white text-lg flex items-center gap-2">
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
                    <div className="py-6 text-center text-xs text-gray-500 border border-dashed border-darkBg-border rounded-lg">
                      Sin jugadores asignados
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {team.map((player) => (
                        <li
                          key={player.id}
                          className="flex items-center justify-between py-2 px-3 bg-darkBg-input/30 rounded-lg border border-darkBg-border/20 text-sm hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 mr-2">
                            <img
                              src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                              alt={player.name}
                              className="w-8 h-8 rounded-full border border-darkBg-border/50 object-cover bg-darkBg-card"
                              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-gray-200 truncate">{player.name}</span>
                              {player.isSpecial && (
                                <span className="text-[8px] bg-neonGreen/10 text-neonGreen font-semibold px-1 rounded border border-neonGreen/20 flex items-center gap-0.5 w-fit mt-0.5 uppercase">
                                  <Shield className="w-2 h-2" /> {sport.specialPositions[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex gap-0.5">
                              {Array.from({ length: player.skillLevel }).map((_, i) => (
                                <span key={i} className="text-neonGreen text-xs">★</span>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(player.id)}
                              className="p-1 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-full transition-all"
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
            <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg">
              <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Suplentes ({manualSubstitutesList.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {manualSubstitutesList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 py-1 pl-2.5 pr-1 bg-darkBg-input/60 border border-darkBg-border rounded-full text-xs font-semibold"
                  >
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      className="w-5 h-5 rounded-full border border-darkBg-border/30 object-cover bg-darkBg-card"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                    />
                    <span className="text-gray-300">{player.name}</span>
                    <span className="text-yellow-400 font-bold">({player.skillLevel}★)</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      className="p-0.5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-full transition-all"
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
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
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
                  <div className="flex items-center justify-between border-b border-darkBg-border/50 pb-3 mb-4">
                    <h5 className="font-extrabold text-white text-lg flex items-center gap-2">
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
                        className="flex items-center justify-between py-2 px-3 bg-darkBg-input/30 rounded-lg border border-darkBg-border/20 text-sm hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                            alt={player.name}
                            className="w-8 h-8 rounded-full border border-darkBg-border/50 object-cover bg-darkBg-card"
                            onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-200">{player.name}</span>
                            {player.isSpecial && (
                              <span className="text-[8px] bg-neonGreen/10 text-neonGreen font-semibold px-1 rounded border border-neonGreen/20 flex items-center gap-0.5 w-fit mt-0.5 uppercase">
                                <Shield className="w-2 h-2" /> {sport.specialPositions[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-0.5">
                          {Array.from({ length: player.skillLevel }).map((_, i) => (
                            <span key={i} className="text-neonGreen text-xs">★</span>
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
            <div className="bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg">
              <h5 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Suplentes ({substitutes.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {substitutes.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 py-1 px-2.5 bg-darkBg-input/60 border border-darkBg-border rounded-full text-xs font-semibold"
                  >
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      className="w-5 h-5 rounded-full border border-darkBg-border/30 object-cover bg-darkBg-card"
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
          <div className="w-full max-w-sm bg-darkBg-card border border-darkBg-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-neonGreen" /> Programar Partido
            </h3>

            <form onSubmit={handleSubmitConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neonGreen" /> Fecha del Partido
                </label>
                <input
                  type="date"
                  required
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neonGreen" /> Horario
                </label>
                <input
                  type="time"
                  required
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-2 px-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-darkBg-border transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-neonGreen hover:bg-neonGreen-dark text-darkBg font-bold rounded-lg transition-all text-sm"
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
