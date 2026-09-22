import connectDB from '@/lib/mongodb';
import AppSettingModel from '@/models/AppSetting';

const GLOBAL_KEY = 'messenger_emma';

export async function isEmmaAutoReplyEnabled(): Promise<boolean> {
  await connectDB();
  const doc = await AppSettingModel.findOne({ key: GLOBAL_KEY }).lean();
  if (!doc) return true;
  return doc.emmaAutoReplyEnabled !== false;
}

export async function setEmmaAutoReplyEnabled(enabled: boolean): Promise<boolean> {
  await connectDB();
  const doc = await AppSettingModel.findOneAndUpdate(
    { key: GLOBAL_KEY },
    { $set: { emmaAutoReplyEnabled: enabled, key: GLOBAL_KEY } },
    { upsert: true, new: true }
  );
  return doc.emmaAutoReplyEnabled !== false;
}

/** Serialize Emma work per customer, but never block other chats. */
const sessionQueues = new Map<string, Promise<unknown>>();

export async function withChatSessionLock<T>(sessionId: string, task: () => Promise<T>): Promise<T> {
  const previous = sessionQueues.get(sessionId) || Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const chained = previous.catch(() => undefined).then(() => gate);
  sessionQueues.set(sessionId, chained);

  await previous.catch(() => undefined);
  try {
    return await task();
  } finally {
    release();
    if (sessionQueues.get(sessionId) === chained) {
      sessionQueues.delete(sessionId);
    }
  }
}
