export function getAchievements(stats) {
  const badges = [];

  if (stats?.progress >= 100) {
    badges.push("BEBAS HUTANG! 🎉");
  }

  if (stats?.progress >= 90 && stats?.progress < 100) {
    badges.push("Hampir Bebas! ⚡");
  }

  if (stats?.progress >= 75) {
    badges.push("Progress 75% 🔥");
  } else if (stats?.progress >= 50) {
    badges.push("Progress 50% 🚀");
  } else if (stats?.progress >= 25) {
    badges.push("Progress 25% 💪");
  }

  if (stats?.paidOff >= 3) {
    badges.push("3 Hutang Lunas 👑");
  } else if (stats?.paidOff >= 1) {
    badges.push("Hutang Pertama Lunas 🏆");
  }

  if (badges.length === 0) {
    badges.push("Mulai Perjalanan 🌟");
  }

  return badges;
}
