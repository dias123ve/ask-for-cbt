import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const MAX_CONCURRENT = 3

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
  try {
    /* ============================================ */
    /* 1️⃣ CEK BERAPA YANG SEDANG JALAN            */
    /* ============================================ */

    const { count: sedangJalanCount } = await supabase
      .from("masters")
      .select("id", { count: "exact", head: true })
      .eq("generate_status", "sedang_jalan")

    const runningCount = sedangJalanCount ?? 0

    // 🚫 Jika sudah 3 sedang_jalan → SKIP SEMUA
    if (runningCount >= MAX_CONCURRENT) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Quota full: ${runningCount} sedang_jalan`,
          skipped: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 📊 Hitung slot tersisa
    const availableSlots = MAX_CONCURRENT - runningCount

    console.log(`🎯 Available slots: ${availableSlots} (${runningCount} sedang_jalan)`)

    /* ============================================ */
    /* 2️⃣ AMBIL ELIGIBLE MASTERS (PRIORITAS)      */
    /* ============================================ */

    // A. belum_siap (tertua dulu)
    const { data: belumSiapList } = await supabase
      .from("masters")
      .select("id, generate_status, generate_updated_at")
      .eq("generate_status", "belum_siap")
      .order("generate_updated_at", { ascending: true })
      .limit(availableSlots)

    // B. belum_mulai / menunggu (tertua dulu)
    const { data: readyList } = await supabase
      .from("masters")
      .select("id, generate_status, percobaan, generate_updated_at")
      .in("generate_status", ["belum_mulai", "menunggu"])
      .order("generate_updated_at", { ascending: true })
      .limit(availableSlots)

    // C. sedang_jalan timeout (>10 menit)
    const timeout = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: stuckList } = await supabase
      .from("masters")
      .select("id, generate_status, percobaan, generate_updated_at")
      .eq("generate_status", "sedang_jalan")
      .lt("generate_updated_at", timeout)
      .order("generate_updated_at", { ascending: true })
      .limit(availableSlots)

    /* ============================================ */
    /* 3️⃣ PRIORITAS: belum_siap → ready → stuck   */
    /* ============================================ */

    const mastersToProcess: Array<{
      id: string
      action: "sync" | "orchestrate"
      generate_status?: string
      percobaan?: number
    }> = []

    // Priority 1: belum_siap
    if (belumSiapList && belumSiapList.length > 0) {
      for (const m of belumSiapList.slice(0, availableSlots)) {
        mastersToProcess.push({ id: m.id, action: "sync" })
      }
    }

    // Priority 2: belum_mulai / menunggu (jika masih ada slot)
    if (mastersToProcess.length < availableSlots && readyList && readyList.length > 0) {
      const remaining = availableSlots - mastersToProcess.length
      for (const m of readyList.slice(0, remaining)) {
        mastersToProcess.push({
          id: m.id,
          action: "orchestrate",
          generate_status: m.generate_status,
          percobaan: m.percobaan,
        })
      }
    }

    // Priority 3: stuck (jika masih ada slot)
    if (mastersToProcess.length < availableSlots && stuckList && stuckList.length > 0) {
      const remaining = availableSlots - mastersToProcess.length
      for (const m of stuckList.slice(0, remaining)) {
        mastersToProcess.push({
          id: m.id,
          action: "orchestrate",
          generate_status: m.generate_status,
          percobaan: m.percobaan,
        })
      }
    }

    /* ============================================ */
    /* 4️⃣ TIDAK ADA YANG BISA DIPROSES            */
    /* ============================================ */

    if (mastersToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No eligible masters to process",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    /* ============================================ */
    /* 5️⃣ PROSES PARALLEL (SESUAI SLOT)           */
    /* ============================================ */

    const results = await Promise.allSettled(
      mastersToProcess.map(async (master) => {
        if (master.action === "sync") {
          console.log(`🔄 Syncing: ${master.id}`)

          // Update status → sedang_jalan SEBELUM sync
          await supabase
            .from("masters")
            .update({ generate_status: "sedang_jalan" })
            .eq("id", master.id)

          await performSync(master.id)

          return { id: master.id, action: "sync", success: true }
        } else {
          console.log(`▶️ Orchestrating: ${master.id}`)

          const res = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/run_generation_orchestrator`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
              },
              body: JSON.stringify({ master_id: master.id }),
            }
          )

          const text = await res.text()

          if (!res.ok) {
            throw new Error(`Orchestrator error: ${res.status} ${text}`)
          }

          return { id: master.id, action: "orchestrate", success: true, response: text }
        }
      })
    )

    /* ============================================ */
    /* 6️⃣ RETURN SUMMARY                          */
    /* ============================================ */

    const summary = results.map((r, idx) => {
      if (r.status === "fulfilled") {
        return r.value
      } else {
        return {
          id: mastersToProcess[idx].id,
          action: mastersToProcess[idx].action,
          success: false,
          error: r.reason?.message || String(r.reason),
        }
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        processed: summary.length,
        available_slots: availableSlots,
        results: summary,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("CRON ERROR:", error)
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

/* ============================================== */
/* 🔧 SYNC LOGIC                                 */
/* ============================================== */

async function performSync(masterId: string) {
  try {
    // 1️⃣ Init generation
    await supabase.rpc('init_generation_for_master', {
      p_master_id: masterId,
    })

    // 2️⃣ Ambil semua BAB
    const { data: babs, error } = await supabase
      .from('babs')
      .select('id')
      .eq('master_id', masterId)
      .order('nomor')

    if (error || !babs) {
      throw new Error('Gagal mengambil data bab')
    }

    // 3️⃣ Generate struktur BAB (AI) — serial
    for (const bab of babs) {
      const res = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate_bab_ai_structure`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          },
          body: JSON.stringify({ bab_id: bab.id }),
        }
      )

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`Failed to generate bab ${bab.id}: ${err}`)
      }
    }

    // 4️⃣ Sync progress LKPD
    await supabase.rpc('sync_lkpd_generation_progress', {
      p_master_id: masterId,
    })

    // 5️⃣ Finalize master
    await supabase.rpc('finalize_master_after_bab_sync', {
      p_master_id: masterId,
    })

    console.log(`✅ Sync completed for master ${masterId}`)
  } catch (err) {
    console.error(`❌ Sync failed for master ${masterId}:`, err)
    
    // Rollback status jika gagal
    await supabase
      .from("masters")
      .update({ generate_status: "belum_siap" })
      .eq("id", masterId)
    
    throw err
  }
}
