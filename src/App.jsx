import React, { useState, useEffect } from 'react';
import { dbService } from './services/dbService';
import SportSelector from './components/SportSelector';
import PlayerRoster from './components/PlayerRoster';
import MatchGenerator from './components/MatchGenerator';
import MatchHistory from './components/MatchHistory';
import AuthModal from './components/AuthModal';
import { Sparkles, Trophy, Users, ShieldAlert, Cpu, X } from 'lucide-react';
import { USE_LOCAL_MOCK, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [sports, setSports] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState(null);
  const [activePhotoName, setActivePhotoName] = useState('');

  // Escuchar estado de autenticación en Firebase
  useEffect(() => {
    if (!USE_LOCAL_MOCK && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser(user);
          const userEmail = user.email.toLowerCase();
          const adminEnvEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase() || '';
          
          setIsAdmin(
            userEmail.includes('admin') || 
            userEmail === 'admin@matchmix.com' ||
            (adminEnvEmail && userEmail === adminEnvEmail)
          );
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      });
      return unsubscribe;
    }
  }, []);

  // Cargar deportes iniciales
  useEffect(() => {
    const initSports = async () => {
      const loadedSports = await dbService.getSports();
      setSports(loadedSports);
      if (loadedSports.length > 0) {
        setSelectedSportId(loadedSports[0].id);
      }
    };
    initSports();
  }, []);

  // Cargar jugadores y partidos al cambiar el deporte seleccionado
  useEffect(() => {
    const loadData = async () => {
      if (selectedSportId) {
        const [loadedPlayers, loadedMatches] = await Promise.all([
          dbService.getPlayers(selectedSportId),
          dbService.getMatches(selectedSportId)
        ]);
        setPlayers(loadedPlayers);
        setMatches(loadedMatches);
        // Pre-seleccionar todos por defecto para agilizar la experiencia de usuario
        setSelectedPlayerIds(loadedPlayers.map(p => p.id));
      } else {
        setPlayers([]);
        setMatches([]);
        setSelectedPlayerIds([]);
      }
    };
    loadData();
  }, [selectedSportId]);

  const handleAddSport = async (newSportData) => {
    const createdSport = await dbService.addSport(newSportData);
    setSports([...sports, createdSport]);
    setSelectedSportId(createdSport.id);
  };

  const handleUpdateSport = async (sportId, updatedSportData) => {
    await dbService.updateSport(sportId, updatedSportData);
    const updatedSports = await dbService.getSports();
    setSports(updatedSports);
  };

  const handleDeleteSport = async (sportId) => {
    await dbService.deleteSport(sportId);
    const updatedSports = await dbService.getSports();
    setSports(updatedSports);
    if (updatedSports.length > 0) {
      setSelectedSportId(updatedSports[0].id);
    } else {
      setSelectedSportId('');
    }
  };

  const handleAddPlayer = async (newPlayerData) => {
    const createdPlayer = await dbService.addPlayer(newPlayerData);
    setPlayers([...players, createdPlayer]);
    setSelectedPlayerIds([...selectedPlayerIds, createdPlayer.id]);
  };

  const handleUpdatePlayer = async (playerId, updatedPlayerData) => {
    await dbService.updatePlayer(playerId, updatedPlayerData);
    const loadedPlayers = await dbService.getPlayers(selectedSportId);
    setPlayers(loadedPlayers);
  };

  const handleDeletePlayer = async (playerId) => {
    await dbService.deletePlayer(playerId);
    setPlayers(players.filter(p => p.id !== playerId));
    setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== playerId));
  };

  const handleToggleSelectPlayer = (playerId) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPlayerIds(players.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPlayerIds([]);
  };

  // Handlers para el Historial de Partidos
  const handleConfirmMatch = async (matchData) => {
    const createdMatch = await dbService.addMatch(matchData);
    setMatches([createdMatch, ...matches]);
  };

  const handleUpdateMatchScore = async (matchId, updatedFields) => {
    await dbService.updateMatch(matchId, updatedFields);
    const loadedMatches = await dbService.getMatches(selectedSportId);
    setMatches(loadedMatches);
  };

  const handleDeleteMatch = async (matchId) => {
    await dbService.deleteMatch(matchId);
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAdmin(true);
  };

  const handleAdminClick = async () => {
    if (isAdmin) {
      if (window.confirm("¿Deseas cerrar la sesión de administrador?")) {
        if (!USE_LOCAL_MOCK && auth) {
          await signOut(auth);
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const selectedSport = sports.find(s => s.id === selectedSportId);
  const activePlayersToDraft = players.filter(p => selectedPlayerIds.includes(p.id));

  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col">
      {/* Header Banner */}
      <header className="border-b border-darkBg-border/80 bg-darkBg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Custom Premium Logo */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 bg-neonGreen/20 blur-md rounded-xl animate-pulse"></div>
              <div className="relative w-11 h-11 bg-darkBg-card border border-neonGreen/30 rounded-xl flex items-center justify-center shadow-lg shadow-neonGreen/10 hover:border-neonGreen transition-all duration-300">
                <svg className="w-7 h-7 text-neonGreen" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 22 72 L 22 35 L 50 63 L 78 35 L 78 72" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="50" cy="24" r="7" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                MATCH<span className="text-neonGreen drop-shadow-[0_0_10px_rgba(222,255,154,0.4)]">MIX</span>
              </h1>
              <p className="text-[10px] text-neonGreen/80 font-bold tracking-widest uppercase">
                Generador y Balanceador de Equipos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Toggle */}
            <button 
              onClick={handleAdminClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${
                isAdmin 
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-md shadow-red-500/5' 
                  : 'bg-darkBg-input text-gray-400 border-darkBg-border hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {isAdmin ? 'Cerrar Admin' : 'Modo Admin'}
            </button>

            <div className="flex items-center gap-2 border-l border-darkBg-border pl-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonGreen opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neonGreen"></span>
              </span>
              <span className="text-xs font-semibold text-gray-300">
                {USE_LOCAL_MOCK ? 'Modo Local' : 'Firebase'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-8">
        
        {/* Selector de Deporte */}
        <SportSelector
          sports={sports}
          selectedSportId={selectedSportId}
          onSelectSport={setSelectedSportId}
          onAddSport={handleAddSport}
          onUpdateSport={handleUpdateSport}
          isAdmin={isAdmin}
          onDeleteSport={handleDeleteSport}
        />

        {selectedSport && (
          <>
            {/* Roster de Jugadores */}
            <PlayerRoster
              players={players}
              sport={selectedSport}
              onAddPlayer={handleAddPlayer}
              onUpdatePlayer={handleUpdatePlayer}
              onDeletePlayer={handleDeletePlayer}
              selectedPlayerIds={selectedPlayerIds}
              onToggleSelectPlayer={handleToggleSelectPlayer}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              isAdmin={isAdmin}
              onViewAvatar={(url, name) => { setActivePhotoUrl(url); setActivePhotoName(name); }}
            />

            {/* Generador de Partidos (Solo Admin) */}
            {isAdmin && (
              <MatchGenerator
                selectedPlayers={activePlayersToDraft}
                sport={selectedSport}
                onConfirmMatch={handleConfirmMatch}
                onViewAvatar={(url, name) => { setActivePhotoUrl(url); setActivePhotoName(name); }}
              />
            )}

            {/* Historial de Partidos */}
            <MatchHistory
              matches={matches}
              sport={selectedSport}
              isAdmin={isAdmin}
              onUpdateMatchScore={handleUpdateMatchScore}
              onDeleteMatch={handleDeleteMatch}
              onViewAvatar={(url, name) => { setActivePhotoUrl(url); setActivePhotoName(name); }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-darkBg-border/40 py-6 bg-darkBg-card/20 text-center text-xs text-gray-500">
        <p>© 2026 MatchMix. Balanceador inteligente para ligas y torneos deportivos.</p>
      </footer>

      {/* Modal de Autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Visor Zoom de Foto de Perfil */}
      {activePhotoUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
          onClick={() => { setActivePhotoUrl(null); setActivePhotoName(''); }}
        >
          <div 
            className="relative max-w-sm w-full bg-darkBg-card border border-darkBg-border/80 rounded-2xl p-4 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setActivePhotoUrl(null); setActivePhotoName(''); }}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-gray-400 hover:text-white rounded-full transition-all border border-darkBg-border/50"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={activePhotoUrl}
              alt={activePhotoName}
              className="w-full h-auto aspect-square rounded-xl object-cover border border-darkBg-border bg-darkBg shadow-inner"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=fallback' }}
            />
            <div className="mt-3 text-center">
              <p className="text-sm font-bold text-white tracking-wide">{activePhotoName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
