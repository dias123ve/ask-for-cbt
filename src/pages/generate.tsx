import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Pause, Download } from 'lucide-react'
import { callEdge } from '@/lib/callEdge'

type GenerationStatus = {
  id: string
  master_id: string
  jenis: 'prota' | 'prosem' | 'rpm' | 'lkpd'
  bab_id: string | null
  status: string
  current_step: number | null
  total_steps: number | null
  file_path: string | null
}

type Bab = {
  id: string
  nomor: number
  judul: string
}

export default function GeneratePage() {
  const { masterId } = useParams<{ masterId: string }>()

  const [rows, setRows] = useState<GenerationStatus[]>([])
  const [babsMap, setBabsMap] = useState<
    Record<string, { nomor: number; judul: string }>
  >({})
  const [loading, setLoading] = useState(false)

  /* -------------------------------------------------- */
  /* FETCH DATA */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!masterId) return
    fetchAll()
  }, [masterId])

  async function fetchAll() {
    await Promise.all([fetchStatuses(), fetchBabs()])
  }

  async function fetchStatuses() {
    if (!masterId) return

    const { data, error } = await supabase
      .from('generation_status')
      .select('*')
      .eq('master_id', masterId)
      .order('jenis', { ascending: true })

    console.log('FETCH generation_status:', data, error)

    if (!error && data) {
      setRows(data)
    }
  }

  async function fetchBabs() {
    if (!masterId) return

    const { data, error } = await supabase
      .from('babs')
      .select('id, nomor, judul')
      .eq('master_id', masterId)

    console.log('FETCH babs:', data, error)

    if (!error && data) {
      const map: Record<string, { nomor: number; judul: string }> = {}
      data.forEach((b: Bab) => {
        map[b.id] = { nomor: b.nomor, judul: b.judul }
      })
      setBabsMap(map)
    }
  }

  /* -------------------------------------------------- */
  /* GENERATE */
  /* -------------------------------------------------- */

  async function handleGenerateAll() {
    if (!masterId) return
    setLoading(true)

    const { error } = await supabase.rpc(
      'init_generation_for_master',
      { p_master_id: masterId }
    )

    if (error) {
      console.error(error)
      alert('Gagal inisialisasi data')
      setLoading(false)
      return
    }

    await callEdge({
      functionName: 'run_generation_orchestrator',
      body: { master_id: masterId },
    })

    await fetchAll()
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
    if (!row.bab_id) return '–'
    const bab = babsMap[row.bab_id]
    if (!bab) return '–'
    return `Bab ${bab.nomor}`
  }

  function renderAction(row: GenerationStatus) {
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

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

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
