export async function pushTokenForLogin(): Promise<string | undefined> {
  try {
    const { registerWebPushToken } = await import("./firebase-push");
    return (await registerWebPushToken()) ?? undefined;
  } catch {
    return undefined;
  }
}
