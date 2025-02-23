import { createClient } from "redis";

let client: any;

export function generateOTP() {
  // INFO: WebCrypto API :/
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
  return (randomValue % 1000000).toString().padStart(6, "0");
}

export function generateSessionToken() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(64));
  return Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function getRedisClient() {
  if (!client) {
    client = createClient({ url: process.env.REDIS_URI, pingInterval: 60 }); // INFO: delete pingInterval if you use TCP keep-alive
    client.on("error", (err: any) => console.log("Redis Client Error", err));
    await client.connect();
  }
  return client;
}

export async function storeOTP(email: string, OTP: string) {
  try {
    const redis = await getRedisClient();
    await redis.setEx(`otp:${email}`, 60 * 5, OTP);
    return true;
  } catch (error) {
    console.log("Redis Client Error", error);
    return false;
  }
}

export async function getOTP(email: string) {
  try {
    const redis = await getRedisClient();
    return await redis.get(`otp:${email}`);
  } catch (error) {
    console.log("Redis Client Error", error);
    return null;
  }
}

export async function deleteOTP(email: string) {
  try {
    const redis = await getRedisClient();
    await redis.del(`otp:${email}`);
    return true;
  } catch (error) {
    console.log("Redis Client Error", error);
    return null;
  }
}

export async function saveSessionToken(email: string) {
  // INFO: use redis-om if you need other than email
  const redis = await getRedisClient();
  const sessionToken = generateSessionToken();

  await redis.setEx(
    sessionToken,
    12 * 60 * 60,
    email,
  );

  return sessionToken;
}

export async function verifySessionToken(token: string) {
  const redis = await getRedisClient();
  const decryptSession = await redis.get(token);
  return decryptSession;
}
