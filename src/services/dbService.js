import { db, USE_LOCAL_MOCK } from '../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { mockStorage } from './mockStorage';

export const dbService = {
  // Sports API
  getSports: async () => {
    if (USE_LOCAL_MOCK) return mockStorage.getSports();
    try {
      const querySnapshot = await getDocs(collection(db, 'sports'));
      const sports = [];
      querySnapshot.forEach((doc) => {
        sports.push({ id: doc.id, ...doc.data() });
      });
      return sports;
    } catch (e) {
      console.error("Error fetching sports from Firebase, using fallback", e);
      return mockStorage.getSports();
    }
  },

  addSport: async (sport) => {
    if (USE_LOCAL_MOCK) return mockStorage.addSport(sport);
    try {
      const docRef = await addDoc(collection(db, 'sports'), sport);
      return { id: docRef.id, ...sport };
    } catch (e) {
      console.error("Error adding sport to Firebase", e);
      return mockStorage.addSport(sport);
    }
  },

  updateSport: async (sportId, sportData) => {
    if (USE_LOCAL_MOCK) return mockStorage.updateSport(sportId, sportData);
    try {
      const sportRef = doc(db, 'sports', sportId);
      await updateDoc(sportRef, sportData);
      return { id: sportId, ...sportData };
    } catch (e) {
      console.error("Error updating sport in Firebase", e);
      return mockStorage.updateSport(sportId, sportData);
    }
  },

  deleteSport: async (sportId) => {
    if (USE_LOCAL_MOCK) return mockStorage.deleteSport(sportId);
    try {
      const sportRef = doc(db, 'sports', sportId);
      await deleteDoc(sportRef);
      return true;
    } catch (e) {
      console.error("Error deleting sport in Firebase", e);
      return mockStorage.deleteSport(sportId);
    }
  },

  // Players API
  getPlayers: async (sportId) => {
    if (USE_LOCAL_MOCK) return mockStorage.getPlayers(sportId);
    try {
      const q = query(collection(db, 'players'), where('sportId', '==', sportId));
      const querySnapshot = await getDocs(q);
      const players = [];
      querySnapshot.forEach((doc) => {
        players.push({ id: doc.id, ...doc.data() });
      });
      return players;
    } catch (e) {
      console.error("Error fetching players from Firebase", e);
      return mockStorage.getPlayers(sportId);
    }
  },

  addPlayer: async (player) => {
    if (USE_LOCAL_MOCK) return mockStorage.addPlayer(player);
    try {
      const finalPlayer = {
        ...player,
        skillLevel: parseInt(player.skillLevel, 10),
        isSpecial: !!player.isSpecial,
        avatar: player.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(player.name)}`
      };
      const docRef = await addDoc(collection(db, 'players'), finalPlayer);
      return { id: docRef.id, ...finalPlayer };
    } catch (e) {
      console.error("Error adding player to Firebase", e);
      return mockStorage.addPlayer(player);
    }
  },

  updatePlayer: async (playerId, playerData) => {
    if (USE_LOCAL_MOCK) return mockStorage.updatePlayer(playerId, playerData);
    try {
      const playerRef = doc(db, 'players', playerId);
      const finalData = {
        ...playerData,
        skillLevel: parseInt(playerData.skillLevel, 10),
        isSpecial: !!playerData.isSpecial
      };
      await updateDoc(playerRef, finalData);
      return { id: playerId, ...finalData };
    } catch (e) {
      console.error("Error updating player in Firebase", e);
      return mockStorage.updatePlayer(playerId, playerData);
    }
  },

  deletePlayer: async (playerId) => {
    if (USE_LOCAL_MOCK) return mockStorage.deletePlayer(playerId);
    try {
      const playerRef = doc(db, 'players', playerId);
      await deleteDoc(playerRef);
      return true;
    } catch (e) {
      console.error("Error deleting player in Firebase", e);
      return mockStorage.deletePlayer(playerId);
    }
  },

  // Matches API
  getMatches: async (sportId) => {
    if (USE_LOCAL_MOCK) return mockStorage.getMatches(sportId);
    try {
      const q = query(collection(db, 'matches'), where('sportId', '==', sportId));
      const querySnapshot = await getDocs(q);
      const matches = [];
      querySnapshot.forEach((doc) => {
        matches.push({ id: doc.id, ...doc.data() });
      });
      return matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      console.error("Error fetching matches from Firebase", e);
      return mockStorage.getMatches(sportId);
    }
  },

  addMatch: async (match) => {
    if (USE_LOCAL_MOCK) return mockStorage.addMatch(match);
    try {
      const finalMatch = {
        ...match,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'matches'), finalMatch);
      return { id: docRef.id, ...finalMatch };
    } catch (e) {
      console.error("Error adding match to Firebase", e);
      return mockStorage.addMatch(match);
    }
  },

  updateMatch: async (matchId, updatedFields) => {
    if (USE_LOCAL_MOCK) return mockStorage.updateMatch(matchId, updatedFields);
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, updatedFields);
      return { id: matchId, ...updatedFields };
    } catch (e) {
      console.error("Error updating match in Firebase", e);
      return mockStorage.updateMatch(matchId, updatedFields);
    }
  },

  deleteMatch: async (matchId) => {
    if (USE_LOCAL_MOCK) return mockStorage.deleteMatch(matchId);
    try {
      const matchRef = doc(db, 'matches', matchId);
      await deleteDoc(matchRef);
      return true;
    } catch (e) {
      console.error("Error deleting match in Firebase", e);
      return mockStorage.deleteMatch(matchId);
    }
  }
};
