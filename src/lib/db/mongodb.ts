/**
 * MongoDB connection singleton with DNS-over-HTTPS SRV resolution.
 * This permanently bypasses querySrv ECONNREFUSED issues on Windows,
 * local ISPs, and restrictive routers.
 *
 * @module lib/db/mongodb
 */
import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * Automatically resolves mongodb+srv:// URIs using DNS-over-HTTPS (DoH)
 */
async function resolveMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) {
    return uri;
  }

  try {
    const raw = uri.replace('mongodb+srv://', 'http://');
    const parsed = new URL(raw);
    const auth = parsed.username
      ? `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}@`
      : '';
    const host = parsed.hostname;
    const pathname = parsed.pathname || '';
    const searchParams = new URLSearchParams(parsed.search);

    // 1. Resolve SRV records (type 33) via Google DoH with Cloudflare fallback
    let srvData: any = null;
    try {
      const res = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${host}&type=SRV`, {
        cache: 'no-store',
      });
      srvData = await res.json();
    } catch (e) {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`, {
        headers: { Accept: 'application/dns-json' },
        cache: 'no-store',
      });
      srvData = await res.json();
    }

    if (!srvData?.Answer || srvData.Answer.length === 0) {
      return uri;
    }

    const hostList = srvData.Answer
      .filter((ans: any) => ans.data)
      .map((ans: any) => {
        const parts = ans.data.trim().split(/\s+/);
        const port = parts[2] || '27017';
        const target = (parts[3] || '').replace(/\.$/, '');
        return `${target}:${port}`;
      })
      .filter((h: string) => !h.startsWith(':'))
      .join(',');

    if (!hostList) {
      return uri;
    }

    // 2. Resolve TXT records (type 16) for replicaSet & authSource
    try {
      const res = await fetch(`https://dns.google/resolve?name=${host}&type=TXT`, {
        cache: 'no-store',
      });
      const txtData = await res.json();
      if (txtData?.Answer) {
        for (const ans of txtData.Answer) {
          const txt = (ans.data || '').replace(/^"|"$/g, '');
          const params = new URLSearchParams(txt);
          params.forEach((val, key) => {
            if (!searchParams.has(key)) {
              searchParams.set(key, val);
            }
          });
        }
      }
    } catch (e) {
      // ignore
    }

    if (!searchParams.has('ssl') && !searchParams.has('tls')) {
      searchParams.set('ssl', 'true');
    }

    const queryStr = searchParams.toString();
    const finalUri = `mongodb://${auth}${hostList}${pathname}${queryStr ? `?${queryStr}` : ''}`;
    return finalUri;
  } catch (err) {
    console.error('DoH resolution error (falling back to standard URI):', err);
    return uri;
  }
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = (async () => {
      const targetUri = await resolveMongoUri(uri);
      return mongoose.connect(targetUri, opts);
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
