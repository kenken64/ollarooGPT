import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sdfdsfds3243hjsdfhd3##d';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = await jwt.verify(token, JWT_SECRET);
    // Ensure the returned value is of type JwtPayload, not string
    if (typeof decoded === 'object' && decoded !== null) {
      return decoded as JwtPayload;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}