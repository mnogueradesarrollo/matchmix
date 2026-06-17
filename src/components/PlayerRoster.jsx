import React, { useState, useEffect, useRef } from 'react';
import { Star, Plus, Shield, User, Trash2, CheckSquare, Square, Search, RefreshCw, Image, Edit2, X, Upload, Camera } from 'lucide-react';

export default function PlayerRoster({ players, sport, onAddPlayer, onUpdatePlayer, onDeletePlayer, selectedPlayerIds, onToggleSelectPlayer, onSelectAll, onDeselectAll, isAdmin = false, onViewAvatar }) {
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
  const [photoUploadingPlayerId, setPhotoUploadingPlayerId] = useState(null);
  const fileInputRef = useRef(null);
  const guestFileInputRef = useRef(null);

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
        // Redimensionar la imagen a un avatar cuadrado de 400x400px
        const canvas = document.createElement('canvas');
        const maxDim = 400;
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

  const handleGuestFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !photoUploadingPlayerId) return;

    const playerToUpdate = players.find(p => p.id === photoUploadingPlayerId);
    if (!playerToUpdate) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 400;
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        onUpdatePlayer(photoUploadingPlayerId, {
          ...playerToUpdate,
          avatar: compressedBase64
        });
        setPhotoUploadingPlayerId(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerGuestFileSelect = (playerId) => {
    setPhotoUploadingPlayerId(playerId);
    setTimeout(() => {
      guestFileInputRef.current.click();
    }, 50);
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
      <input
        type="file"
        ref={guestFileInputRef}
        accept="image/*"
        onChange={handleGuestFileChange}
        className="hidden"
      />

      {/* Columna Izquierda: Formulario de Carga Rápida o Edición (Solo Admin) */}
      {isAdmin && (
        <div className="md:col-span-5 bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/35 h-fit">
          <div className="flex items-center justify-between mb-4 border-b border-brand-steel pb-2">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 font-display">
              {editingPlayer ? (
                <>
                  <Edit2 className="w-4 h-4 text-brand-orange" /> Editar Jugador
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-brand-orange" /> Agregar Jugador
                </>
              )}
            </h3>
            {editingPlayer && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-red-400 transition-all cursor-pointer"
                title="Cancelar Edición"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-brand-obsidian/30 border border-brand-steel/50 rounded-lg gap-3">
              <div className="relative group cursor-pointer" onClick={triggerFileSelect} title="Haga clic para seleccionar foto de galería">
                <img
                  src={getAvatarUrl()}
                  alt="Avatar Preview"
                  className="w-20 h-20 rounded-full border-2 border-brand-orange object-cover bg-brand-slate transition-all duration-300 group-hover:scale-105 group-hover:border-white shadow-lg"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Upload className="w-5 h-5 text-brand-orange mb-0.5" />
                  <span className="text-[9px] text-white font-bold uppercase tracking-wider">Subir Foto</span>
                </div>
                {!showCustomAvatarInput && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRandomizeAvatar();
                    }}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-brand-orange text-white rounded-full hover:scale-110 active:scale-95 transition-all shadow-md z-10 cursor-pointer"
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
                  className="px-4 py-1.5 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Seleccionar de Galería
                </button>
                
                <span className="text-[10px] text-gray-400 mt-1">O toca la foto de arriba</span>

                <button
                  type="button"
                  onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                  className="text-[10px] text-gray-500 hover:text-brand-orange transition-all font-semibold mt-2 underline underline-offset-2 cursor-pointer"
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
                  className="w-full bg-brand-obsidian text-gray-100 rounded py-1.5 px-2 border border-brand-steel focus:border-brand-orange outline-none text-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase mb-1 font-mono">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej: Alejandro G."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2 px-3 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase mb-1 font-mono">Habilidad (1-5)</label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSkillLevel(star)}
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(null)}
                    className="transition-transform active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-all ${
                        (hoverStar !== null ? star <= hoverStar : star <= skillLevel)
                          ? 'fill-brand-orange text-brand-orange drop-shadow-[0_0_4px_rgba(255,94,58,0.3)]'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Posición especial inteligente */}
            {hasSpecialPosition && (
              <div className="space-y-2.5 bg-brand-obsidian/50 p-2.5 rounded-lg border border-brand-steel">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 flex items-center gap-1.5 font-semibold font-mono">
                    <Shield className="w-3.5 h-3.5 text-brand-orange" /> ¿Tiene Rol Especial?
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
                    <div className="w-9 h-5 bg-brand-obsidian peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange peer-checked:after:bg-brand-obsidian peer-checked:after:border-none"></div>
                  </label>
                </div>

                {isSpecial && (
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase mb-1 font-mono">Posición/Rol</label>
                    <select
                      value={specialPositionType}
                      onChange={(e) => setSpecialPositionType(e.target.value)}
                      className="w-full bg-brand-slate text-gray-200 rounded py-1.5 px-2 border border-brand-steel focus:border-brand-orange outline-none text-xs font-semibold cursor-pointer"
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
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-brand-steel transition-all text-sm font-semibold cursor-pointer font-mono"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-[2] py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-brand-orange/10 active:scale-98 cursor-pointer font-mono"
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
      )}

      {/* Columna Derecha: Lista de Convocatoria */}
      <div className={`${isAdmin ? 'md:col-span-7' : 'md:col-span-12'} bg-brand-slate border border-brand-steel rounded-xl p-5 shadow-lg shadow-black/35 flex flex-col min-h-[300px]`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 font-display">
            {isAdmin ? `Lista de Jugadores (${selectedPlayerIds.length}/${players.length} listos)` : `Plantilla de Jugadores (${players.length})`}
          </h3>
          {isAdmin && (
            <div className="flex gap-2 text-xs font-mono">
              <button
                onClick={onSelectAll}
                className="px-2.5 py-1.5 bg-brand-obsidian text-gray-300 border border-brand-steel rounded hover:border-brand-orange hover:text-brand-orange transition-all flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" /> Todos
              </button>
              <button
                onClick={onDeselectAll}
                className="px-2.5 py-1.5 bg-brand-obsidian text-gray-300 border border-brand-steel rounded hover:border-red-500/50 hover:text-red-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" /> Ninguno
              </button>
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="relative mb-3.5">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar jugador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-obsidian text-gray-100 rounded-lg py-2 pl-9 pr-4 border border-brand-steel focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all text-xs"
          />
        </div>

        {/* Lista Scrollable */}
        <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2 pr-1">
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-xs font-mono">
              <User className="w-8 h-8 mb-2 stroke-1 opacity-50 text-brand-orange" />
              <span>{searchQuery ? 'No se encontraron resultados.' : 'Sin jugadores registrados en este deporte.'}</span>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <div
                  key={player.id}
                  onClick={() => isAdmin && onToggleSelectPlayer(player.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 select-none ${
                    isAdmin
                      ? isSelected
                        ? 'bg-brand-orange/5 border-brand-orange/30 hover:bg-brand-orange/10 cursor-pointer shadow-[0_0_12px_rgba(255,94,58,0.05)]'
                        : 'bg-brand-obsidian/40 border-brand-steel/50 hover:bg-brand-obsidian/80 cursor-pointer'
                      : 'bg-brand-obsidian/40 border-brand-steel/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <div className={`p-1 rounded ${isSelected ? 'text-brand-orange' : 'text-gray-600'}`}>
                        {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                      </div>
                    )}

                    <img
                      src={player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`}
                      alt={player.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAvatar) {
                          onViewAvatar(player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`, player.name);
                        }
                      }}
                      className="w-10 h-10 rounded-full border border-brand-steel object-cover bg-brand-slate cursor-zoom-in hover:scale-105 transition-all"
                      onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
                    />

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-semibold transition-colors ${isAdmin && isSelected ? 'text-white' : 'text-gray-200'}`}>
                          {player.name}
                        </span>
                        {player.isSpecial && player.specialPositionType && (
                          <span className="text-[9px] bg-brand-lime/10 text-brand-lime font-bold px-1.5 py-0.5 rounded border border-brand-lime/20 flex items-center gap-0.5 uppercase font-mono">
                            <Shield className="w-2.5 h-2.5" /> {player.specialPositionType}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < player.skillLevel ? 'fill-brand-orange text-brand-orange' : 'text-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(player);
                          }}
                          className="p-1.5 text-gray-500 hover:text-brand-orange hover:bg-brand-orange/10 rounded transition-all cursor-pointer"
                          title="Editar jugador"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePlayer(player.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                          title="Eliminar jugador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerGuestFileSelect(player.id);
                        }}
                        className="px-2.5 py-1.5 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange border border-brand-orange/25 hover:border-brand-orange/50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm shadow-brand-orange/5 cursor-pointer font-mono"
                        title="Subir tu foto de perfil desde tu celular"
                      >
                        <Camera className="w-3.5 h-3.5" /> Subir Foto
                      </button>
                    )}
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

