import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Pause, Download } from 'lucide-react'

type GenerationStatus = {
  id: string
  master_id: string
  jenis: 'prota' | 'prosem' | 'rpm' | 'lkpd'
  bab_id: string | null
  status: string
  current_step: number | null
  total_steps: number | null
  file_path: string | null
  babs?: {
    nomor: number
    judul: string
  } | null
}

export default function GeneratePage() {
  const [masterId, setMasterId] = useState<string | null>(null)
  const [rows, setRows] = useState<GenerationStatus[]>([])
  const [loading, setLoading] = useState(false)

  /* -------------------------------------------------- */
  /* INIT */
  /* -------------------------------------------------- */

  useEffect(() => {
    // ambil master aktif (contoh: dari localStorage / route state)
    const stored = localStorage.getItem('active_master_id')
    if (stored) setMasterId(stored)
  }, [])

  useEffect(() => {
    if (!masterId) return
    fetchStatuses()
  }, [masterId])

  async function fetchStatuses() {
    const { data, error } = await supabase
      .from('generation_status')
      .select(`
        *,
        babs (
          nomor,
          judul
        )
      `)
      .eq('master_id', masterId)
      .order('jenis', { ascending: true })

    if (!error && data) setRows(data)
  }

  /* -------------------------------------------------- */
  /* GENERATE SEMUA (FASE 1) */
  /* -------------------------------------------------- */

  async function handleGenerateAll() {
    if (!masterId) return
    setLoading(true)

    // ambil bab
    const { data: babs } = await supabase
      .from('babs')
      .select('id')
      .eq('master_id', masterId)

    const inserts: any[] = []

    // prota & prosem
    inserts.push(
      {
        master_id: masterId,
        jenis: 'prota',
        status: 'pending',
        current_step: 0
      },
      {
        master_id: masterId,
        jenis: 'prosem',
        status: 'pending',
        current_step: 0
      }
    )

    // rpm & lkpd per bab
    babs?.forEach((bab) => {
      inserts.push(
        {
          master_id: masterId,
          bab_id: bab.id,
          jenis: 'rpm',
          status: 'pending',
          current_step: 0
        },
        {
          master_id: masterId,
          bab_id: bab.id,
          jenis: 'lkpd',
          status: 'pending',
          current_step: 0
        }
      )
    })

    // insert (idempotent: conflict di-handle di DB)
    await supabase
      .from('generation_status')
      .upsert(inserts, {
        onConflict: 'master_id,jenis,bab_id'
      })

    // trigger orchestrator (1 kali)
    await supabase.functions.invoke('run_generation_orchestrator', {
      body: { master_id: masterId }
    })

    await fetchStatuses()
    setLoading(false)
  }

  /* -------------------------------------------------- */
  /* HELPERS */
  /* -------------------------------------------------- */

  function renderProgress(row: GenerationStatus) {
    if (!row.total_steps) return '–'
    return `${row.current_step ?? 0} / ${row.total_steps}`
  }

  function renderBab(row: GenerationStatus) {
    if (!row.babs) return '–'
    return `Bab ${row.babs.nomor}`
  }

  function renderAction(row: GenerationStatus) {
    if (row.status === 'done' && row.file_path) {
      return (
        <a href={row.file_path} target="_blank">
          <Download className="w-4 h-4" />
        </a>
      )
    }

    if (row.status === 'generating' || row.status === 'generating_ai') {
      return <Pause className="w-4 h-4 text-gray-400" />
    }

    return <Play className="w-4 h-4 text-gray-600" />
  }

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Generate Administrasi</h1>

        <Button onClick={handleGenerateAll} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Generate Semua
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Dokumen</th>
              <th className="p-3 text-left">Bab</th>
              <th className="p-3 text-left">Progress</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="p-3 uppercase">{row.jenis}</td>
                <td className="p-3">{renderBab(row)}</td>
                <td className="p-3">{renderProgress(row)}</td>
                <td className="p-3">{row.status}</td>
                <td className="p-3 text-center">
                  {renderAction(row)}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Belum ada data generate
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
