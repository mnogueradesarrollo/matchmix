import React, { useState } from 'react';
import { Plus, Trophy, Users, Trash2, Edit2, Lock } from 'lucide-react';

export default function SportSelector({ sports, selectedSportId, onSelectSport, onAddSport, onUpdateSport, isAdmin, onDeleteSport, isLockedByUrl }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [hasGoalkeeper, setHasGoalkeeper] = useState(true);

  const selectedSport = sports.find(s => s.id === selectedSportId);

  const handleStartAdd = () => {
    setIsEditing(false);
    setNewSportName('');
    setPlayersPerTeam(5);
    setHasGoalkeeper(true);
    setShowAddModal(true);
  };

  const handleStartEdit = () => {
    if (!selectedSport) return;
    setIsEditing(true);
    setNewSportName(selectedSport.name);
    setPlayersPerTeam(selectedSport.playersPerTeam);
    setHasGoalkeeper(selectedSport.specialPositions && selectedSport.specialPositions.length > 0);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSportName.trim()) return;

    const sportData = {
      name: newSportName,
      playersPerTeam: parseInt(playersPerTeam, 10),
      specialPositions: hasGoalkeeper 
        ? (selectedSport?.specialPositions?.length > 0 ? selectedSport.specialPositions : ['arquero']) 
        : []
    };

    if (isEditing) {
      onUpdateSport(selectedSportId, sportData);
    } else {
      onAddSport(sportData);
    }

    setNewSportName('');
    setPlayersPerTeam(5);
    setHasGoalkeeper(true);
    handleCloseModal();
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el deporte "${selectedSport?.name}" y todos sus jugadores?`)) {
      onDeleteSport(selectedSportId);
    }
  };

  if (isLockedByUrl && !isAdmin) {
    return (
      <div className="w-full max-w-md mx-auto mb-6 px-4">
        <div className="bg-brand-slate p-4 rounded-xl border border-brand-steel shadow-lg shadow-black/30 flex items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-brand-orange uppercase font-mono">
                Grupo Activo
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
              {selectedSport ? selectedSport.name : 'Deporte Seleccionado'}
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-brand-obsidian border border-brand-steel px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-brand-orange" />
            Enlace Protegido
          </div>
        </div>

        {/* Info Card */}
        {selectedSport && (
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-between px-2 font-mono">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-brand-orange" /> {selectedSport.playersPerTeam} jugadores por equipo
            </span>
            {selectedSport.specialPositions && selectedSport.specialPositions.length > 0 && (
              <span className="bg-brand-lime/10 text-brand-lime px-2 py-0.5 rounded-full border border-brand-lime/20 font-bold">
                Posición especial: {selectedSport.specialPositions.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mb-6 px-4">
      <div className="flex items-center justify-between gap-3 bg-brand-slate p-4 rounded-xl border border-brand-steel shadow-lg shadow-black/30">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between gap-1.5 font-mono">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Seleccionar Deporte
            </span>
            {isLockedByUrl && (
              <span className="text-[9px] text-brand-orange flex items-center gap-1 bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20 font-bold animate-pulse">
                <Lock className="w-2.5 h-2.5" /> Enlace Bloqueado (Admin Mode)
              </span>
            )}
          </label>
          
          <div className="flex gap-2">
            <select
              value={selectedSportId || ''}
              onChange={(e) => onSelectSport(e.target.value)}
              className="flex-1 bg-brand-obsidian text-gray-100 rounded-lg py-2.5 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm font-medium cursor-pointer"
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id} className="bg-brand-slate">
                  {sport.name} ({sport.playersPerTeam} vs {sport.playersPerTeam})
                </option>
              ))}
            </select>

            {isAdmin && selectedSport && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleStartEdit}
                  className="p-2.5 bg-brand-obsidian text-gray-300 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg border border-brand-steel hover:border-brand-orange/30 transition-all duration-300 cursor-pointer"
                  title="Editar Deporte seleccionado (Rol Administrador)"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {sports.length > 1 && (
                  <button
                    onClick={handleDelete}
                    className="p-2.5 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/30 hover:border-red-500 transition-all duration-300 cursor-pointer"
                    title="Eliminar Deporte seleccionado (Rol Administrador)"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleStartAdd}
          className="self-end p-2.5 bg-brand-obsidian text-brand-orange hover:bg-brand-orange hover:text-brand-obsidian rounded-lg border border-brand-steel hover:border-brand-orange transition-all duration-300 cursor-pointer"
          title="Agregar Deporte"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Info Card */}
      {selectedSport && (
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between px-2 font-mono">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-brand-orange" /> {selectedSport.playersPerTeam} jugadores por equipo
          </span>
          {selectedSport.specialPositions && selectedSport.specialPositions.length > 0 && (
            <span className="bg-brand-lime/10 text-brand-lime px-2 py-0.5 rounded-full border border-brand-lime/20 font-bold">
              Posición especial: {selectedSport.specialPositions.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Modal para añadir/editar deporte */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-brand-slate border border-brand-steel rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2 font-display">
              <Trophy className="w-5 h-5 text-brand-orange" /> {isEditing ? 'Editar Deporte' : 'Nuevo Deporte'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-mono">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fútbol 8, Básquet 5v5"
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2.5 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-mono">Jugadores por Equipo</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2.5 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-brand-steel">
                <span className="text-sm text-gray-300">¿Requiere Posición Especial (Arquero/Líbero/etc)?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGoalkeeper}
                    onChange={(e) => setHasGoalkeeper(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-obsidian peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange peer-checked:after:bg-brand-obsidian peer-checked:after:border-none"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 px-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-brand-steel transition-all text-sm font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-lg transition-all text-sm font-mono cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

