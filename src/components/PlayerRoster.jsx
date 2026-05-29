import React, { useState, useEffect, useRef } from 'react';
import { Star, Plus, Shield, User, Trash2, CheckSquare, Square, Search, RefreshCw, Image, Edit2, X, Upload } from 'lucide-react';

export default function PlayerRoster({ players, sport, onAddPlayer, onUpdatePlayer, onDeletePlayer, selectedPlayerIds, onToggleSelectPlayer, onSelectAll, onDeselectAll }) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialPositionType, setSpecialPositionType] = useState(sport.specialPositions?.[0] || '');
  const [avatarSeed, setAvatarSeed] = useState(() => Math.floor(Math.random() * 1000).toString());
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [hoverStar, setHoverStar] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const fileInputRef = useRef(null);

  // Reiniciar estado si cambia de deporte
  useEffect(() => {
    cancelEdit();
  }, [sport.id]);

  const handleRandomizeAvatar = () => {
    setAvatarSeed(Math.floor(Math.random() * 10000).toString());
    setCustomAvatarUrl('');
  };

  const getAvatarUrl = () => {
    if (customAvatarUrl.trim()) return customAvatarUrl;
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarSeed}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Redimensionar la imagen a un avatar cuadrado de 150x150px
        const canvas = document.createElement('canvas');
        const maxDim = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a Base64 optimizado (JPEG a 70% calidad)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setCustomAvatarUrl(compressedBase64);
        setShowCustomAvatarInput(false); // Ocultar input de texto ya que cargamos archivo
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const startEdit = (player) => {
    setEditingPlayer(player);
    setNewPlayerName(player.name);
    setSkillLevel(player.skillLevel);
    setIsSpecial(player.isSpecial);
    setSpecialPositionType(player.specialPositionType || sport.specialPositions?.[0] || '');
    if (player.avatar.includes('dicebear.com')) {
      const url = new URL(player.avatar);
      const seed = url.searchParams.get('seed') || '123';
      setAvatarSeed(seed);
      setCustomAvatarUrl('');
      setShowCustomAvatarInput(false);
    } else {
      setCustomAvatarUrl(player.avatar);
      // Si es base64, no mostramos el input de URL
      setShowCustomAvatarInput(!player.avatar.startsWith('data:image'));
    }
  };

  const cancelEdit = () => {
    setEditingPlayer(null);
    setNewPlayerName('');
    setSkillLevel(3);
    setIsSpecial(false);
    setSpecialPositionType(sport.specialPositions?.[0] || '');
    setAvatarSeed(Math.floor(Math.random() * 10000).toString());
    setCustomAvatarUrl('');
    setShowCustomAvatarInput(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const playerData = {
      name: newPlayerName.trim(),
      skillLevel,
      isSpecial: sport.specialPositions?.length > 0 ? isSpecial : false,
      specialPositionType: (sport.specialPositions?.length > 0 && isSpecial) ? specialPositionType : '',
      sportId: sport.id,
      avatar: getAvatarUrl()
    };

    if (editingPlayer) {
      onUpdatePlayer(editingPlayer.id, playerData);
    } else {
      onAddPlayer(playerData);
    }

    cancelEdit();
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSpecialPosition = sport.specialPositions?.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
      
      {/* Columna Izquierda: Formulario de Carga Rápida o Edición */}
      <div className="md:col-span-5 bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg h-fit">
        <div className="flex items-center justify-between mb-4 border-b border-darkBg-border pb-2">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            {editingPlayer ? (
              <>
                <Edit2 className="w-4 h-4 text-neonGreen" /> Editar Jugador
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-neonGreen" /> Agregar Jugador
              </>
            )}
          </h3>
          {editingPlayer && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-gray-400 hover:text-red-400 transition-all"
              title="Cancelar Edición"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center p-4 bg-darkBg-input/30 border border-darkBg-border/50 rounded-lg gap-3">
            <div className="relative group cursor-pointer" onClick={triggerFileSelect} title="Haga clic para seleccionar foto de galería">
              <img
                src={getAvatarUrl()}
                alt="Avatar Preview"
                className="w-20 h-20 rounded-full border-2 border-neonGreen object-cover bg-darkBg-card transition-all duration-300 group-hover:scale-105 group-hover:border-white shadow-lg"
                onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Upload className="w-5 h-5 text-neonGreen mb-0.5" />
                <span className="text-[9px] text-white font-bold uppercase tracking-wider">Subir Foto</span>
              </div>
              {!showCustomAvatarInput && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRandomizeAvatar();
                  }}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-neonGreen text-darkBg rounded-full hover:scale-110 active:scale-95 transition-all shadow-md z-10"
                  title="Generar avatar aleatorio"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {/* Controles de Carga */}
            <div className="flex flex-col items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={triggerFileSelect}
                className="px-4 py-1.5 bg-neonGreen/10 border border-neonGreen/30 text-neonGreen hover:bg-neonGreen/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Seleccionar de Galería
              </button>
              
              <span className="text-[10px] text-gray-400 mt-1">O toca la foto de arriba</span>

              <button
                type="button"
                onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                className="text-[10px] text-gray-500 hover:text-neonGreen transition-all font-semibold mt-2 underline underline-offset-2"
              >
                {showCustomAvatarInput ? 'Ocultar campo de URL' : 'Ingresar URL en su lugar'}
              </button>
            </div>

            {showCustomAvatarInput && (
              <input
                type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                value={customAvatarUrl}
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full bg-darkBg-input text-gray-100 rounded py-1.5 px-2 border border-darkBg-border focus:border-neonGreen outline-none text-xs"
              />
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase mb-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej: Alejandro G."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2 px-3 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase mb-1">Habilidad (1-5)</label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSkillLevel(star)}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(null)}
                  className="transition-transform active:scale-95"
                >
                  <Star
                    className={`w-6 h-6 transition-all ${
                      (hoverStar !== null ? star <= hoverStar : star <= skillLevel)
                        ? 'fill-neonGreen text-neonGreen drop-shadow-[0_0_4px_rgba(222,255,154,0.3)]'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Posición especial inteligente */}
          {hasSpecialPosition && (
            <div className="space-y-2.5 bg-darkBg-input/50 p-2.5 rounded-lg border border-darkBg-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300 flex items-center gap-1.5 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-neonGreen" /> ¿Tiene Rol Especial?
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => {
                      setIsSpecial(e.target.checked);
                      if (e.target.checked && !specialPositionType) {
                        setSpecialPositionType(sport.specialPositions[0]);
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-darkBg-input peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neonGreen peer-checked:after:bg-darkBg peer-checked:after:border-none"></div>
                </label>
              </div>

              {isSpecial && (
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase mb-1">Posición/Rol</label>
                  <select
                    value={specialPositionType}
                    onChange={(e) => setSpecialPositionType(e.target.value)}
                    className="w-full bg-darkBg-card text-gray-200 rounded py-1.5 px-2 border border-darkBg-border focus:border-neonGreen outline-none text-xs font-semibold cursor-pointer"
                  >
                    {sport.specialPositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {editingPlayer && (
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-darkBg-border transition-all text-sm font-semibold"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="flex-[2] py-2.5 bg-neonGreen hover:bg-neonGreen-dark text-darkBg font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-neonGreen/10 active:scale-98"
            >
              {editingPlayer ? 'Guardar Cambios' : (
                <>
                  <Plus className="w-4 h-4" /> Registrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Columna Derecha: Lista de Convocatoria */}
      <div className="md:col-span-7 bg-darkBg-card border border-darkBg-border rounded-xl p-5 shadow-lg flex flex-col min-h-[300px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            Lista de Jugadores ({selectedPlayerIds.length}/{players.length} listos)
          </h3>
          <div className="flex gap-2 text-xs">
            <button
              onClick={onSelectAll}
              className="px-2.5 py-1.5 bg-darkBg-input text-gray-300 border border-darkBg-border rounded hover:border-neonGreen hover:text-neonGreen transition-all flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Todos
            </button>
            <button
              onClick={onDeselectAll}
              className="px-2.5 py-1.5 bg-darkBg-input text-gray-300 border border-darkBg-border rounded hover:border-red-500/50 hover:text-red-400 transition-all flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Ninguno
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-3.5">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-darkBg-input text-gray-100 rounded-lg py-2 pl-9 pr-4 border border-darkBg-border focus:border-neonGreen focus:ring-1 focus:ring-neonGreen outline-none transition-all text-xs"
          />
        </div>

        {/* Lista Scrollable */}
        <div className="flex-1 overflow-y-auto max-h-[320px] space-y-2 pr-1">
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-xs">
              <User className="w-8 h-8 mb-2 stroke-1 opacity-50" />
              <span>{searchQuery ? 'No se encontraron resultados.' : 'Sin jugadores registrados en este deporte.'}</span>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => onToggleSelectPlayer(player.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-neonGreen/5 border-neonGreen/30 hover:bg-neonGreen/10'
                      : 'bg-darkBg-input/40 border-darkBg-border/50 hover:bg-darkBg-input/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${isSelected ? 'text-neonGreen' : 'text-gray-600'}`}>
                      {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                    </div>

                    {/* Foto de Perfil */}
                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      className="w-10 h-10 rounded-full border border-darkBg-border object-cover bg-darkBg-card"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                    />

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                          {player.name}
                        </span>
                        {player.isSpecial && player.specialPositionType && (
                          <span className="text-[9px] bg-neonGreen/10 text-neonGreen font-semibold px-1.5 py-0.5 rounded border border-neonGreen/20 flex items-center gap-0.5 uppercase">
                            <Shield className="w-2.5 h-2.5" /> {player.specialPositionType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < player.skillLevel ? 'fill-neonGreen text-neonGreen' : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(player);
                      }}
                      className="p-1.5 text-gray-500 hover:text-neonGreen hover:bg-neonGreen/10 rounded transition-all"
                      title="Editar jugador"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlayer(player.id);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      title="Eliminar jugador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
}
