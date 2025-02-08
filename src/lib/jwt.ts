import jwt from "jsonwebtoken";

export interface TokenPayload {
  teamID: string;
  userID: string;
  role: "leader" | "member" | "teacher";
}

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key_here";

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3 * 7 * 24 * 60 * 60, // 21 days
    },
    SECRET_KEY
  );
};

export const generateEmailVerificationToken = (payload: TokenPayload): string => {
  let token = jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3 * 7 * 24 * 60 * 60, // 21 days
    },
    SECRET_KEY
  );
  return `${process.env.BASE_URL}/apply/email-verify?auth=${token}`
  // INFO: Don't we have a shortlink service?
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload;
    if (decoded && decoded.userID && decoded.teamID && decoded.role) {
      return {
        teamID: decoded.teamID,
        userID: decoded.userID,
        role: decoded.role,
      };
    }
    return null;
  } catch (error) {
    console.error("Invalid or expired token:", error);
    return null;
  }
};
