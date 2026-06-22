// Función auxiliar para mezclar un arreglo aleatoriamente (Algoritmo Fisher-Yates)
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Algoritmo Smart-Draft para balancear equipos equitativamente por género.
 * 
 * @param {Array} players - Listado de jugadores seleccionados: { id, name, gender, isSpecial }
 * @param {number} playersPerTeam - Número de jugadores requeridos por equipo (ej: 5 para Fútbol 5)
 * @param {number} forcedTeamCount - Opcional. Forzar una cantidad específica de equipos.
 * @returns {Object} { teams: Array<Array>, substitutes: Array, stats: Array }
 */
export function generateBalancedTeams(players, playersPerTeam, forcedTeamCount = null) {
  if (!players || players.length === 0) {
    return { teams: [], substitutes: [], stats: [] };
  }

  // Determinar cuántos equipos se van a formar
  const totalPlayers = players.length;
  let numTeams = forcedTeamCount;
  
  if (!numTeams) {
    numTeams = Math.floor(totalPlayers / playersPerTeam);
    // Garantizar al menos 2 equipos si hay suficientes jugadores
    if (numTeams < 2 && totalPlayers >= 2) {
      numTeams = 2;
    }
  }

  if (numTeams < 1) {
    return { teams: [], substitutes: [...players], stats: [] };
  }

  // Mezclar aleatoriamente el conjunto de jugadores
  const shuffledPlayers = shuffle(players);

  // Separar posiciones especiales y regulares
  const specialPlayers = shuffledPlayers.filter(p => p.isSpecial);
  const regularPlayers = shuffledPlayers.filter(p => !p.isSpecial);

  // Agrupar los regulares por género y mezclarlos por separado
  const femalePlayers = shuffle(regularPlayers.filter(p => p.gender?.toLowerCase() === 'femenino'));
  const malePlayers = shuffle(regularPlayers.filter(p => p.gender?.toLowerCase() !== 'femenino'));

  // Concatenar primero femeninos y luego masculinos para que el snake draft los distribuya equitativamente
  const finalRegularPool = [...femalePlayers, ...malePlayers];

  // Inicializar equipos vacíos
  const teams = Array.from({ length: numTeams }, () => []);

  // Función para distribuir un grupo de jugadores usando Snake Draft
  let currentTeamIndex = 0;
  let goingForward = true;

  function distributeSnake(pool, maxTeamSize) {
    for (const player of pool) {
      // Buscar si todos los equipos ya están llenos para esta fase
      const availableTeams = teams.map((team, idx) => ({ idx, length: team.length }))
        .filter(t => t.length < maxTeamSize);

      if (availableTeams.length === 0) {
        return pool.slice(pool.indexOf(player));
      }

      let iterations = 0;
      while (teams[currentTeamIndex].length >= maxTeamSize && iterations < numTeams) {
        if (goingForward) {
          if (currentTeamIndex < numTeams - 1) {
            currentTeamIndex++;
          } else {
            goingForward = false;
          }
        } else {
          if (currentTeamIndex > 0) {
            currentTeamIndex--;
          } else {
            goingForward = true;
          }
        }
        iterations++;
      }

      // Añadir jugador
      teams[currentTeamIndex].push(player);

      // Avanzar el índice de la serpiente
      if (goingForward) {
        if (currentTeamIndex < numTeams - 1) {
          currentTeamIndex++;
        } else {
          goingForward = false;
        }
      } else {
        if (currentTeamIndex > 0) {
          currentTeamIndex--;
        } else {
          goingForward = true;
        }
      }
    }
    return [];
  }

  // 1. Distribuir arqueros primero (máximo 1 por equipo si es posible)
  const remainingSpecial = distributeSnake(specialPlayers, 1);

  // Unir arqueros sobrantes con la lista regular
  const finalPool = [...remainingSpecial, ...finalRegularPool];

  // 2. Distribuir el resto de los jugadores hasta completar el tamaño de equipo requerido
  const remainingPlayers = distributeSnake(finalPool, playersPerTeam);

  // Calcular estadísticas de balanceo de géneros de los equipos resultantes
  const stats = teams.map((team, idx) => {
    const femaleCount = team.filter(p => p.gender?.toLowerCase() === 'femenino').length;
    const maleCount = team.length - femaleCount;
    return {
      teamIndex: idx,
      femaleCount,
      maleCount
    };
  });

  return {
    teams,
    substitutes: remainingPlayers,
    stats
  };
}

