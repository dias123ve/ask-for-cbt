import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Play, Zap } from 'lucide-react'
import { callEdge } from '@/lib/callEdge'

type MasterRow = {
  id: string
  nama_guru: string
  mapel: string
  kelas: string
  jumlah_bab: number
  generation_status: string | null
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [masters, setMasters] = useState<MasterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [invoking, setInvoking] = useState(false)

  /* =========================
     INIT + AUTH GUARD
     ========================= */
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()

      if (!sessionData.session) {
        navigate('/login', { replace: true })
        return
      }

      await fetchMasters()
      setLoading(false)
    }

    init()
  }, [navigate])

  /* =========================
     FETCH MASTERS
     ========================= */
  const fetchMasters = async () => {
    const { data, error } = await supabase
      .from('masters')
      .select('id, nama_guru, mapel, kelas, jumlah_bab, generation_status')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMasters(data)
    }
  }

  /* =========================
     LOGOUT
     ========================= */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  /* =========================
     INVOKE CRON RUNNER
     ========================= */
  const handleInvokeCron = async () => {
    setInvoking(true)

    try {
      const result = await callEdge<{
        success: boolean
        message?: string
        processed?: number
        skipped?: boolean
        results?: any[]
        error?: string
      }>({
        functionName: 'cron_generation_runner',
      })

      if (!result) {
        throw new Error('Gagal invoke cron')
      }

      if (result.success) {
        console.log('Cron invoked:', result)
        
        // Refresh data setelah invoke
        await fetchMasters()

        // Tampilkan notifikasi sukses
        if (result.processed && result.processed > 0) {
          alert(`✅ Berhasil memproses ${result.processed} master(s)`)
        } else if (result.skipped) {
          alert(`ℹ️ ${result.message || 'Quota penuh atau tidak ada yang perlu diproses'}`)
        } else {
          alert('ℹ️ Tidak ada master yang perlu diproses')
        }
      } else {
        throw new Error(result.error || 'Cron runner error')
      }
    } catch (err) {
      console.error('Invoke cron error:', err)
      alert('❌ Gagal menjalankan cron runner')
    } finally {
      setInvoking(false)
    }
  }

  /* =========================
     RENDER
     ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          Dashboard Administrasi
        </h1>
        
        <div className="flex gap-3">
          {/* Tombol Invoke Cron */}
          <Button
            onClick={handleInvokeCron}
            disabled={invoking}
            className="gap-2"
          >
            <Zap className={`w-4 h-4 ${invoking ? 'animate-pulse' : ''}`} />
            {invoking ? 'Memproses...' : 'Run Generation'}
          </Button>

          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Guru</th>
              <th className="px-4 py-3 text-left">Mapel</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">Bab</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {masters.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  Belum ada data
                </td>
              </tr>
            )}

            {masters.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-3">{row.nama_guru}</td>
                <td className="px-4 py-3">{row.mapel}</td>
                <td className="px-4 py-3">{row.kelas}</td>
                <td className="px-4 py-3">{row.jumlah_bab}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      row.generation_status === 'selesai'
                        ? 'bg-green-100 text-green-700'
                        : row.generation_status === 'sedang_jalan'
                        ? 'bg-blue-100 text-blue-700'
                        : row.generation_status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : row.generation_status === 'belum_siap'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {row.generation_status || 'belum_siap'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="icon"
                    onClick={() => navigate(`/generate/${row.id}`)}
                    title="Lihat Detail Generate"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
