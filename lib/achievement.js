export function getAchievements(stats) {
  const badges = [];

  if (stats?.paidOff >= 1) {
    badges.push("Hutang Pertama Lunas 🏆");
  }

  if (stats?.progress >= 50) {
    badges.push("Progress 50% 🚀");
  }
  
  if (badges.length === 0) {
    badges.push("Mulai Perjalanan 🌟");
  }

  return badges;
}
