export async function readBody(response: Response) {
  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  const contentType = response.headers.get("Content-Type");

  if (contentType?.toLowerCase().includes("json")) {
    const data: unknown = JSON.parse(text);
    return data;
  }

  return text;
}
