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
 * Algoritmo Smart-Draft para balancear equipos.
 * 
 * @param {Array} players - Listado de jugadores seleccionados: { id, name, skillLevel, isSpecial }
 * @param {number} playersPerTeam - Número de jugadores requeridos por equipo (ej: 5 para Fútbol 5)
 * @param {number} forcedTeamCount - Opcional. Forzar una cantidad específica de equipos.
 * @returns {Object} { teams: Array<Array>, substitutes: Array, averageSkills: Array }
 */
export function generateBalancedTeams(players, playersPerTeam, forcedTeamCount = null) {
  if (!players || players.length === 0) {
    return { teams: [], substitutes: [], averageSkills: [] };
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
    return { teams: [], substitutes: [...players], averageSkills: [] };
  }

  // Mezclar aleatoriamente el conjunto de jugadores antes de ordenar para romper empates al azar
  const shuffledPlayers = shuffle(players);

  // Separar posiciones especiales (ej: arqueros) y jugadores regulares
  const specialPlayers = shuffledPlayers.filter(p => p.isSpecial);
  const regularPlayers = shuffledPlayers.filter(p => !p.isSpecial);

  // Ordenar ambos grupos por nivel de habilidad de mayor a menor (5 -> 1)
  // Al haber mezclado antes, los empates se resuelven de forma aleatoria y fresca en cada ejecución
  const sortDesc = (a, b) => b.skillLevel - a.skillLevel;
  specialPlayers.sort(sortDesc);
  regularPlayers.sort(sortDesc);

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
        // No hay más espacio en ningún equipo bajo el límite actual
        return pool.slice(pool.indexOf(player));
      }

      // Si la dirección actual del snake apunta a un equipo lleno, ajustamos el índice
      // hasta encontrar un equipo con espacio
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

      // Añadir jugador al equipo
      teams[currentTeamIndex].push(player);

      // Avanzar el índice de la serpiente
      if (goingForward) {
        if (currentTeamIndex < numTeams - 1) {
          currentTeamIndex++;
        } else {
          goingForward = false; // Cambiar dirección en el extremo derecho
        }
      } else {
        if (currentTeamIndex > 0) {
          currentTeamIndex--;
        } else {
          goingForward = true; // Cambiar dirección en el extremo izquierdo
        }
      }
    }
    return [];
  }

  // 1. Distribuir arqueros primero (máximo 1 por equipo si es posible)
  const remainingSpecial = distributeSnake(specialPlayers, 1);

  // Unir arqueros sobrantes con los jugadores regulares
  const finalRegularPool = [...remainingSpecial, ...regularPlayers];

  // 2. Distribuir el resto de los jugadores hasta completar el tamaño de equipo requerido
  const remainingPlayers = distributeSnake(finalRegularPool, playersPerTeam);

  // Calcular estadísticas de balanceo de los equipos resultantes
  const teamStats = teams.map((team, idx) => {
    const totalSkill = team.reduce((sum, p) => sum + p.skillLevel, 0);
    const avgSkill = team.length > 0 ? (totalSkill / team.length).toFixed(1) : 0;
    return {
      teamIndex: idx,
      totalSkill,
      avgSkill: parseFloat(avgSkill)
    };
  });

  return {
    teams,
    substitutes: remainingPlayers,
    stats: teamStats
  };
}
