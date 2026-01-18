// @/lib/callEdge.ts

type CallEdgeOptions<TBody = any> = {
  functionName: string;
  body?: TBody;
  method?: 'POST' | 'GET';
  expectBlob?: boolean; // ✨ Tambahan untuk handle binary response
};

export async function callEdge<TResponse = any>({
  functionName,
  body,
  method = 'POST',
  expectBlob = false, // ✨ Default false (backward compatible)
}: CallEdgeOptions): Promise<TResponse | Blob | null> {
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
  
  // ✨ Handle binary response (blob)
  if (expectBlob) {
    try {
      return await res.blob() as any; // Cast to any untuk type compatibility
    } catch {
      return null;
    }
  }
  
  // Default: handle JSON response (backward compatible)
  try {
    return await res.json();
  } catch {
    return null;
  }
}
