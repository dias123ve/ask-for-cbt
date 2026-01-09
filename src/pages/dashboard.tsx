import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'

type MasterRow = {
  id: string
  nama_guru: string
  mapel: string
  kelas: string
  jumlah_bab: number
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [masters, setMasters] = useState<MasterRow[]>([])
  const [loading, setLoading] = useState(true)

  // Auth guard + fetch data
  useEffect(() => {
    const init = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        navigate('/login', { replace: true })
        return
      }

      const { data, error } = await supabase
        .from('masters')
        .select('id, nama_guru, mapel, kelas, jumlah_bab')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setMasters(data)
      }

      setLoading(false)
    }

    init()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

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
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
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
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {masters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
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
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/generate/${row.id}`)}
                  >
                    Generate
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
