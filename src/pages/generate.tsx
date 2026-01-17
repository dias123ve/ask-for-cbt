import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Pause, Download } from 'lucide-react'
import { callEdge } from '@/lib/callEdge'

type GenerateStatus = 
  | 'belum_siap' 
  | 'belum_mulai' 
  | 'menunggu' 
  | 'sedang_proses' 
  | 'selesai' 
  | 'error'

type MasterRow = {
  id: string
  generate_status: GenerateStatus
  generate_updated_at: string
}

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
  const [master, setMaster] = useState<MasterRow | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Prevent glitch during polling
  const isFetchingRef = useRef(false)

  /* ================================================== */
  /* FETCH DATA                                         */
  /* ================================================== */
  useEffect(() => {
    if (!masterId) return
    
    fetchData()

    // Polling setiap 3 detik untuk update status
    const interval = setInterval(() => {
      fetchData()
    }, 3000)

    return () => clearInterval(interval)
  }, [masterId])

  // Combine fetch operations to prevent glitch
  async function fetchData() {
    if (isFetchingRef.current) return // Skip if already fetching
    isFetchingRef.current = true

    try {
      await Promise.all([
        fetchMasterStatus(),
        fetchStatuses()
      ])
    } finally {
      isFetchingRef.current = false
    }
  }

  async function fetchMasterStatus() {
    if (!masterId) return

    const { data, error } = await supabase
      .from('masters')
      .select('id, generate_status, generate_updated_at')
      .eq('id', masterId)
      .single()

    if (error) {
      console.error('❌ fetchMasterStatus error:', error)
      return
    }

    setMaster(data)
  }

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
      .order('bab_id', { ascending: true, nullsFirst: true })

    if (error) {
      console.error('❌ fetchStatuses error:', error)
      return
    }

    // ✅ SORT DI FRONTEND (AMAN)
    const orderJenis = {
      prota: 1,
      prosem: 2,
      rpm: 3,
      lkpd: 4,
    }

    const sorted = (data ?? []).sort((a, b) => {
      const jenisDiff =
        orderJenis[a.jenis] - orderJenis[b.jenis]
      if (jenisDiff !== 0) return jenisDiff

      const babA = a.babs?.nomor ?? 0
      const babB = b.babs?.nomor ?? 0
      return babA - babB
    })

    setRows(sorted)
  }

  /* ================================================== */
  /* BUTTON STATE LOGIC                                 */
  /* ================================================== */
  function getButtonState(): {
    disabled: boolean
    loading: boolean
    text: string
  } {
    if (!master) {
      return { disabled: true, loading: false, text: 'Memuat...' }
    }

    const { generate_status, generate_updated_at } = master

    // Hitung selisih waktu dari generate_updated_at
    const updatedAt = new Date(generate_updated_at).getTime()
    const now = Date.now()
    const diffMinutes = (now - updatedAt) / 1000 / 60

    switch (generate_status) {
      case 'belum_mulai':
        // ✅ Buka (enabled)
        return { disabled: false, loading: false, text: 'Generate Semua' }

      case 'menunggu':
        if (diffMinutes > 1) {
          // ✅ Buka (sudah lebih dari 1 menit)
          return { disabled: false, loading: false, text: 'Generate Ulang' }
        } else {
          // ⏳ Loading (masih menunggu kurang dari 1 menit)
          return { disabled: false, loading: true, text: 'Menunggu...' }
        }

      case 'sedang_proses':
        // ⏳ Loading (sedang jalan)
        return { disabled: false, loading: true, text: 'Sedang Proses...' }

      case 'error':
      case 'selesai':
      case 'belum_siap':
      default:
        // 🚫 Disabled
        return { disabled: true, loading: false, text: 'Generate Semua' }
    }
  }

  /* ================================================== */
  /* GENERATE (TRIGGER ORCHESTRATOR)                    */
  /* ================================================== */
  async function handleGenerateAll() {
    if (!masterId) return
    setLoading(true)

    try {
      // Trigger orchestrator
      await callEdge({
        functionName: 'run_generation_orchestrator',
        body: { master_id: masterId },
      })

      await fetchData()
    } finally {
      setLoading(false)
    }
  }

  /* ================================================== */
  /* DOWNLOAD HANDLER                                   */
  /* ================================================== */
  async function handleDownload(row: GenerationRow) {
    if (!row.file_path) return

    try {
      // Dapatkan public URL dari storage
      const { data } = supabase.storage
        .from(row.jenis) // bucket name: prota, prosem, rpm, lkpd
        .getPublicUrl(row.file_path)

      if (data?.publicUrl) {
        // Buka di tab baru atau trigger download
        window.open(data.publicUrl, '_blank')
      }
    } catch (error) {
      console.error('❌ Download error:', error)
      alert('Gagal mengunduh file')
    }
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
        <button
          onClick={() => handleDownload(row)}
          className="hover:text-blue-600 transition-colors"
          title="Download file"
        >
          <Download className="w-4 h-4" />
        </button>
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
  const buttonState = getButtonState()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          Generate Administrasi
        </h1>

        <Button
          onClick={handleGenerateAll}
          disabled={buttonState.disabled}
        >
          {(buttonState.loading || loading) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          {loading ? 'Menunggu...' : buttonState.text}
        </Button>
      </div>

      {/* Status Info */}
      {master && (
        <div className="text-sm text-gray-600">
          Status: <span className="font-medium">{master.generate_status}</span>
        </div>
      )}

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
