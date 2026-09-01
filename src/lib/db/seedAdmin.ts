/**
 * Seeds the default admin user into MongoDB on first run.
 * @module lib/db/seedAdmin
 */
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

const ADMIN_EMAIL = 'developer@marketingandpublishinghousellc.com';
const ADMIN_PASSWORD = 'Agent.@786';

export async function seedAdminUser() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    return { created: false, message: 'Admin user already exists' };
  }

  const { hash, salt } = hashPassword(ADMIN_PASSWORD);

  const admin = await User.create({
    email: ADMIN_EMAIL.toLowerCase(),
    passwordHash: hash,
    salt,
    role: 'admin',
    name: 'Admin Developer',
  });

  console.log(`✅ [SeedAdmin] Successfully seeded admin account: ${admin.email}`);
  return { created: true, message: 'Admin user seeded successfully' };
}
