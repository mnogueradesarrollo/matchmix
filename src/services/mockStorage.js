const DEFAULT_SPORTS = [
  { id: 'futbol-5', name: 'Fútbol 5', playersPerTeam: 5, specialPositions: ['arquero'] },
  { id: 'basquet-3', name: 'Básquet 3x3', playersPerTeam: 3, specialPositions: [] },
  { id: 'padel', name: 'Pádel (Dobles)', playersPerTeam: 2, specialPositions: ['revés', 'drive'] },
  { id: 'voley', name: 'Vóley', playersPerTeam: 6, specialPositions: ['líbero'] }
];

const DEFAULT_PLAYERS = [
  // Fútbol 5
  { id: 'f1', name: 'Emiliano Martínez', skillLevel: 5, sportId: 'futbol-5', isSpecial: true, specialPositionType: 'arquero', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Martinez' },
  { id: 'f2', name: 'Lionel Messi', skillLevel: 5, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Messi' },
  { id: 'f3', name: 'Rodrigo De Paul', skillLevel: 4, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DePaul' },
  { id: 'f4', name: 'Cristian Romero', skillLevel: 5, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Romero' },
  { id: 'f5', name: 'Nicolás Tagliafico', skillLevel: 3, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tagliafico' },
  { id: 'f6', name: 'Gerónimo Rulli', skillLevel: 4, sportId: 'futbol-5', isSpecial: true, specialPositionType: 'arquero', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rulli' },
  { id: 'f7', name: 'Lautaro Martínez', skillLevel: 4, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lautaro' },
  { id: 'f8', name: 'Julián Álvarez', skillLevel: 4, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Julian' },
  { id: 'f9', name: 'Enzo Fernández', skillLevel: 4, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Enzo' },
  { id: 'f10', name: 'Alexis Mac Allister', skillLevel: 4, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alexis' },
  { id: 'f11', name: 'Angel Di María', skillLevel: 5, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiMaria' },
  { id: 'f12', name: 'Gonzalo Montiel', skillLevel: 3, sportId: 'futbol-5', isSpecial: false, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Montiel' },

  // Pádel
  { id: 'p1', name: 'Alejandro Galán', skillLevel: 5, sportId: 'padel', isSpecial: true, specialPositionType: 'revés', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Galan' },
  { id: 'p2', name: 'Juan Lebrón', skillLevel: 5, sportId: 'padel', isSpecial: true, specialPositionType: 'drive', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lebron' },
  { id: 'p3', name: 'Agustín Tapia', skillLevel: 5, sportId: 'padel', isSpecial: true, specialPositionType: 'revés', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tapia' },
  { id: 'p4', name: 'Arturo Coello', skillLevel: 5, sportId: 'padel', isSpecial: true, specialPositionType: 'drive', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Coello' },
  { id: 'p5', name: 'Fernando Belasteguín', skillLevel: 4, sportId: 'padel', isSpecial: true, specialPositionType: 'drive', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bela' },
  { id: 'p6', name: 'Martín Di Nenno', skillLevel: 4, sportId: 'padel', isSpecial: true, specialPositionType: 'drive', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=DiNenno' },
  { id: 'p7', name: 'Franco Stupaczuk', skillLevel: 4, sportId: 'padel', isSpecial: true, specialPositionType: 'revés', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Stupa' },
  { id: 'p8', name: 'Paquito Navarro', skillLevel: 3, sportId: 'padel', isSpecial: true, specialPositionType: 'revés', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Paquito' }
];

export const mockStorage = {
  getSports: () => {
    const sports = localStorage.getItem('matchmix_sports');
    if (!sports) {
      localStorage.setItem('matchmix_sports', JSON.stringify(DEFAULT_SPORTS));
      return DEFAULT_SPORTS;
    }
    return JSON.parse(sports);
  },

  addSport: (sport) => {
    const sports = mockStorage.getSports();
    const newSport = { ...sport, id: sport.name.toLowerCase().replace(/\s+/g, '-') };
    sports.push(newSport);
    localStorage.setItem('matchmix_sports', JSON.stringify(sports));
    return newSport;
  },

  updateSport: (sportId, updatedSport) => {
    const sports = mockStorage.getSports();
    const index = sports.findIndex(s => s.id === sportId);
    if (index !== -1) {
      sports[index] = {
        ...sports[index],
        ...updatedSport,
        // No cambiamos el ID para evitar romper relaciones de jugadores existentes
      };
      localStorage.setItem('matchmix_sports', JSON.stringify(sports));
      return sports[index];
    }
    return null;
  },

  deleteSport: (sportId) => {
    const sports = mockStorage.getSports();
    const filtered = sports.filter(s => s.id !== sportId);
    localStorage.setItem('matchmix_sports', JSON.stringify(filtered));
    
    // También borrar jugadores asociados a ese deporte
    const players = localStorage.getItem('matchmix_players');
    const allPlayers = players ? JSON.parse(players) : DEFAULT_PLAYERS;
    const filteredPlayers = allPlayers.filter(p => p.sportId !== sportId);
    localStorage.setItem('matchmix_players', JSON.stringify(filteredPlayers));
    
    return true;
  },

  getPlayers: (sportId) => {
    const players = localStorage.getItem('matchmix_players');
    let allPlayers = players ? JSON.parse(players) : null;
    
    if (!allPlayers) {
      localStorage.setItem('matchmix_players', JSON.stringify(DEFAULT_PLAYERS));
      allPlayers = DEFAULT_PLAYERS;
    }
    
    return allPlayers.filter(p => p.sportId === sportId);
  },

  addPlayer: (player) => {
    const players = localStorage.getItem('matchmix_players');
    const allPlayers = players ? JSON.parse(players) : DEFAULT_PLAYERS;
    
    const newPlayer = {
      ...player,
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skillLevel: parseInt(player.skillLevel, 10),
      isSpecial: !!player.isSpecial,
      avatar: player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`
    };
    
    allPlayers.push(newPlayer);
    localStorage.setItem('matchmix_players', JSON.stringify(allPlayers));
    return newPlayer;
  },

  updatePlayer: (playerId, updatedPlayer) => {
    const players = localStorage.getItem('matchmix_players');
    const allPlayers = players ? JSON.parse(players) : DEFAULT_PLAYERS;
    
    const index = allPlayers.findIndex(p => p.id === playerId);
    if (index !== -1) {
      allPlayers[index] = {
        ...allPlayers[index],
        ...updatedPlayer,
        skillLevel: parseInt(updatedPlayer.skillLevel, 10),
        isSpecial: !!updatedPlayer.isSpecial
      };
      localStorage.setItem('matchmix_players', JSON.stringify(allPlayers));
      return allPlayers[index];
    }
    return null;
  },

  deletePlayer: (playerId) => {
    const players = localStorage.getItem('matchmix_players');
    const allPlayers = players ? JSON.parse(players) : DEFAULT_PLAYERS;
    
    const filtered = allPlayers.filter(p => p.id !== playerId);
    localStorage.setItem('matchmix_players', JSON.stringify(filtered));
    return true;
  },

  getMatches: (sportId) => {
    const matches = localStorage.getItem('matchmix_matches');
    const allMatches = matches ? JSON.parse(matches) : [];
    return allMatches.filter(m => m.sportId === sportId);
  },

  addMatch: (match) => {
    const matches = localStorage.getItem('matchmix_matches');
    const allMatches = matches ? JSON.parse(matches) : [];
    const newMatch = {
      ...match,
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    allMatches.push(newMatch);
    localStorage.setItem('matchmix_matches', JSON.stringify(allMatches));
    return newMatch;
  },

  updateMatch: (matchId, updatedFields) => {
    const matches = localStorage.getItem('matchmix_matches');
    const allMatches = matches ? JSON.parse(matches) : [];
    const index = allMatches.findIndex(m => m.id === matchId);
    if (index !== -1) {
      allMatches[index] = {
        ...allMatches[index],
        ...updatedFields
      };
      localStorage.setItem('matchmix_matches', JSON.stringify(allMatches));
      return allMatches[index];
    }
    return null;
  },

  deleteMatch: (matchId) => {
    const matches = localStorage.getItem('matchmix_matches');
    const allMatches = matches ? JSON.parse(matches) : [];
    const filtered = allMatches.filter(m => m.id !== matchId);
    localStorage.setItem('matchmix_matches', JSON.stringify(filtered));
    return true;
  }
};
