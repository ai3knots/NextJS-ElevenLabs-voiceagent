export function isChatOngoing(updatedAt?: string | Date | null, idleMinutes = 15) {
  if (!updatedAt) return false;
  const ts = new Date(updatedAt).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < idleMinutes * 60 * 1000;
}
