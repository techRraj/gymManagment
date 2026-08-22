import User from '../models/User.js';

// Cache for match scores (clears on server restart)
const matchScoreCache = new Map();

export const calculateMatchScore = (user1, user2) => {
  const cacheKey = `${user1._id}-${user2._id}`;
  if (matchScoreCache.has(cacheKey)) {
    return matchScoreCache.get(cacheKey);
  }

  let score = 0;
  const maxScore = 100;

  // 1. Location proximity (30 points)
  const coord1 = user1.location?.coordinates?.coordinates || user1.location?.coords;
  const coord2 = user2.location?.coordinates?.coordinates || user2.location?.coords;

  if (coord1 && coord2 && Array.isArray(coord1) && Array.isArray(coord2)) {
    try {
      const dist = calculateDistance(coord1, coord2);
      if (dist < 5) score += 30;
      else if (dist < 15) score += 20;
      else if (dist < 30) score += 10;
      else score += 5;
    } catch (e) { /* Ignore */ }
  }

  // 2. Shared goals (25 points)
  if (user1.goals && user2.goals && user1.goals.length > 0 && user2.goals.length > 0) {
    const sharedGoals = user1.goals.filter(goal => user2.goals.includes(goal));
    score += (sharedGoals.length / Math.max(user1.goals.length, user2.goals.length)) * 25;
  }

  // 3. Training volume (15 points)
  if (user1.trainingVolume === user2.trainingVolume) {
    score += 15;
  } else {
    const vol1 = parseVolume(user1.trainingVolume);
    const vol2 = parseVolume(user2.trainingVolume);
    if (Math.abs(vol1 - vol2) <= 1) score += 8;
  }

  // 4. Availability overlap (20 points)
  if (user1.availability && user2.availability && user1.availability.length > 0 && user2.availability.length > 0) {
    const overlap = user1.availability.filter(av1 =>
      user2.availability.some(av2 => av1.day === av2.day && av1.time === av2.time)
    );
    score += (overlap.length / 7) * 20;
  }

  // 5. Experience compatibility (10 points)
  const expLevels = { beginner: 1, intermediate: 2, advanced: 3, elite: 4 };
  const exp1 = expLevels[user1.experience] || 2;
  const exp2 = expLevels[user2.experience] || 2;
  const diff = Math.abs(exp1 - exp2);
  
  if (diff === 0) score += 10;
  else if (diff === 1) score += 6;
  else if (diff === 2) score += 3;

  const finalScore = Math.min(Math.round(score), maxScore);
  matchScoreCache.set(cacheKey, finalScore);
  
  return finalScore;
};

const calculateDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg || 0) * (Math.PI / 180);
const parseVolume = (volume) => {
  if (!volume) return 0;
  const match = String(volume).match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

export const findMatches = async (user, limit = 20) => {
  try {
    const query = {
      _id: { $ne: user._id },
      isActive: true,
      gender: user.matchPreferences?.gender || { $in: ['male', 'female', 'other'] }
    };

    const users = await User.find(query).lean().limit(50); // Limit to 50 for speed

    const scored = users
      .map(u => ({ user: u, score: calculateMatchScore(user, u) }))
      .filter(m => m.score > 10)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  } catch (error) {
    console.error('Error in findMatches:', error);
    return [];
  }
};