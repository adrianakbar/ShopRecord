import { getUser } from '@/lib/auth';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return Response.json({ 
      authenticated: false,
      message: 'No user logged in',
      mockUserId: '00000000-0000-0000-0000-000000000001',
      instruction: 'Run: npm run db:seed:real to seed with your user ID',
      user: null
    });
  }

  // Return user data from Supabase auth
  const userData = {
    id: user.id,
    email: user.email,
    name: user.email?.split('@')[0] || 'User', // Extract name from email
  };

  return Response.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
    mockUserId: '00000000-0000-0000-0000-000000000001',
    match: user.id === '00000000-0000-0000-0000-000000000001',
    instruction: user.id !== '00000000-0000-0000-0000-000000000001' 
      ? `Run: USER_ID="${user.id}" npm run db:seed:real` 
      : 'User ID matches seed data - history page should work',
    user: userData
  });
}
