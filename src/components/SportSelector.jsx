import React, { useState } from 'react';
import { Plus, Trophy, Users, Trash2, Edit2 } from 'lucide-react';

export default function SportSelector({ sports, selectedSportId, onSelectSport, onAddSport, onUpdateSport, isAdmin, onDeleteSport }) {
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

  return (
    <div className="w-full max-w-md mx-auto mb-6 px-4">
      <div className="flex items-center justify-between gap-3 bg-darkBg-card p-4 rounded-xl border border-darkBg-border shadow-lg">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-neonGreen" /> Seleccionar Deporte
          </label>
          
          <div className="flex gap-2">
            <select
              value={selectedSportId || ''}
              onChange={(e) => onSelectSport(e.target.value)}
              className="flex-1 bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm font-medium cursor-pointer"
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id} className="bg-darkBg-card">
                  {sport.name} ({sport.playersPerTeam} vs {sport.playersPerTeam})
                </option>
              ))}
            </select>

            {isAdmin && selectedSport && (
              <div className="flex gap-1.5">
                <button
                  onClick={handleStartEdit}
                  className="p-2.5 bg-darkBg-input text-gray-300 hover:text-neonGreen hover:bg-neonGreen/10 rounded-lg border border-darkBg-border hover:border-neonGreen/30 transition-all duration-300"
                  title="Editar Deporte seleccionado (Rol Administrador)"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                {sports.length > 1 && (
                  <button
                    onClick={handleDelete}
                    className="p-2.5 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/30 hover:border-red-500 transition-all duration-300"
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
          className="self-end p-2.5 bg-darkBg-input text-neonGreen hover:bg-neonGreen hover:text-darkBg rounded-lg border border-darkBg-border hover:border-neonGreen transition-all duration-300"
          title="Agregar Deporte"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Info Card */}
      {selectedSport && (
        <div className="mt-2 text-xs text-gray-400 flex items-center justify-between px-2">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3 text-neonGreen" /> {selectedSport.playersPerTeam} jugadores por equipo
          </span>
          {selectedSport.specialPositions && selectedSport.specialPositions.length > 0 && (
            <span className="bg-neonGreen/10 text-neonGreen px-2 py-0.5 rounded-full border border-neonGreen/20">
              Posición especial: {selectedSport.specialPositions.join(', ')}
            </span>
          )}
        </div>
      )}

      {/* Modal para añadir/editar deporte */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-darkBg-card border border-darkBg-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-neonGreen" /> {isEditing ? 'Editar Deporte' : 'Nuevo Deporte'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fútbol 8, Básquet 5v5"
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Jugadores por Equipo</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={playersPerTeam}
                  onChange={(e) => setPlayersPerTeam(e.target.value)}
                  className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2.5 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-darkBg-border">
                <span className="text-sm text-gray-300">¿Requiere Posición Especial (Arquero/Líbero/etc)?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGoalkeeper}
                    onChange={(e) => setHasGoalkeeper(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-darkBg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neonGreen peer-checked:after:bg-darkBg peer-checked:after:border-none"></div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 px-4 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-darkBg-border transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-neonGreen hover:bg-neonGreen-dark text-darkBg font-bold rounded-lg transition-all text-sm"
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
