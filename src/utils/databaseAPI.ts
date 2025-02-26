export function databasePost(path: string, data: object): Promise<Response> {
  return fetch(`${process.env.DATABASE_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DATABASE_AUTH_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
