import jwt from "jsonwebtoken";

export interface TokenPayload {
  teamId: string;
  userId: string;
  role: "leader" | "member" | "teacher";
}

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here";

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3 * 7 * 24 * 60 * 60,
    },
    SECRET_KEY
  );
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    if (decoded && decoded.userId && decoded.username && decoded.role) {
      return {
        teamId: decoded.username,
        userId: decoded.userId,
        role: decoded.role,
      };
    }
    return null;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
};
