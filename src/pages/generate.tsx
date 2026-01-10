import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Pause, Download } from 'lucide-react'
import { callEdge } from '@/lib/callEdge'

type GenerationRow = {
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
  } | null
}

export default function GeneratePage() {
  /* ================================================== */
  /* ROUTE PARAM (FIXED)                                */
  /* ================================================== */
  const { master_id } = useParams<{ master_id: string }>()
  const masterId = master_id

  const [rows, setRows] = useState<GenerationRow[]>([])
  const [loading, setLoading] = useState(false)

  /* ================================================== */
  /* FETCH DATA                                         */
  /* ================================================== */
  useEffect(() => {
    if (!masterId) return
    fetchStatuses()
  }, [masterId])

  async function fetchStatuses() {
    if (!masterId) return

    const { data, error } = await supabase
      .from('generation_status')
      .select(`
        id,
        master_id,
        jenis,
        bab_id,
        status,
        current_step,
        total_steps,
        file_path,
        babs:babs!generation_status_bab_id_fkey (
          nomor
        )
      `)
      .eq('master_id', masterId)
      .order('jenis', { ascending: true })

    if (error) {
      console.error('❌ fetchStatuses error:', error)
      setRows([])
      return
    }

    setRows(data ?? [])
  }

  /* ================================================== */
  /* GENERATE (TRIGGER ORCHESTRATOR)                    */
  /* ================================================== */
  async function handleGenerateAll() {
    if (!masterId) return
    setLoading(true)

    // 1️⃣ init struktur data (BAB + generation_status)
    const { error } = await supabase.rpc(
      'init_generation_for_master',
      { p_master_id: masterId }
    )

    if (error) {
      console.error('❌ init_generation_for_master error:', error)
      alert('Gagal inisialisasi data')
      setLoading(false)
      return
    }

    // 2️⃣ trigger orchestrator (dispatcher only)
    await callEdge({
      functionName: 'run_generation_orchestrator',
      body: { master_id: masterId },
    })

    await fetchStatuses()
    setLoading(false)
  }

  /* ================================================== */
  /* HELPERS                                            */
  /* ================================================== */
  function renderBab(row: GenerationRow) {
    if (!row.babs) return '–'
    return `Bab ${row.babs.nomor}`
  }

  function renderProgress(row: GenerationRow) {
    if (!row.total_steps) return '–'
    return `${row.current_step ?? 0} / ${row.total_steps}`
  }

  function renderAction(row: GenerationRow) {
    if (row.status === 'done' && row.file_path) {
      return (
        <a href={row.file_path} target="_blank" rel="noreferrer">
          <Download className="w-4 h-4" />
        </a>
      )
    }

    if (row.status === 'generating' || row.status === 'generating_ai') {
      return <Pause className="w-4 h-4 text-gray-400" />
    }

    return <Play className="w-4 h-4 text-gray-600" />
  }

  /* ================================================== */
  /* UI                                                 */
  /* ================================================== */
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Generate Administrasi
        </h1>

        <Button onClick={handleGenerateAll} disabled={loading}>
          {loading && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Generate Semua
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
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
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
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
