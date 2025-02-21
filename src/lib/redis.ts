import { randomInt } from "crypto";
import { createClient } from "redis";

let client: any;

export function generateOTP() {
  return randomInt(0, 1000000).toString().padStart(6, "0");
}

async function getRedisClient() {
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
    console.log("Redis Client Error", error)
    return false;
  }
}

export async function getOTP(email: string) {
  try {
    const redis = await getRedisClient();
    return await redis.get(`otp:${email}`);
  } catch (error) {
    console.log("Redis Client Error", error)
    return null;
  }
}

export async function deleteOTP(email: string) {
  try {
    const redis = await getRedisClient();
    await redis.del(`otp:${email}`);
    return true;
  } catch (error) {
    console.log("Redis Client Error", error)
    return null;
  }
}


export function generateSessionToken() {}
