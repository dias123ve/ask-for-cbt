type CallEdgeOptions<TBody = any> = {
  functionName: string;
  body?: TBody;
  method?: 'POST' | 'GET';
};

export async function callEdge<TResponse = any>({
  functionName,
  body,
  method = 'POST',
}: CallEdgeOptions): Promise<TResponse | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('Supabase env belum diset');
    return null;
  }

  const res = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(
      `Edge ${functionName} error:`,
      res.status,
      text
    );
    return null;
  }

  // Edge kamu mayoritas return { success: true }
  try {
    return await res.json();
  } catch {
    return null;
  }
}
