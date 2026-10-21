export function formatRaceTime(seconds) {
  const milliseconds = Math.round(Math.max(0, seconds || 0) * 1000);
  return `${Math.floor(milliseconds / 60000)}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}
