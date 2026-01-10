import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'

type GeneratedFile = {
  id: string
  type: 'prota' | 'prosem' | 'modul' | 'lkpd'
  bab_label: string | null
  status: 'pending' | 'generating' | 'success' | 'error'
  file_url: string | null
  error_msg: string | null
  order_index: number
}

export default function GeneratePage() {
  const { master_id } = useParams()
  const navigate = useNavigate()

  const [files, setFiles] = useState<GeneratedFile[]>([])
  const [loading, setLoading] = useState(true)

  // BAB generation state
  const [babGenerated, setBabGenerated] = useState(false)
  const [generatingBab, setGeneratingBab] = useState(false)

  const [runningAll, setRunningAll] = useState(false)

  // ===============================
  // INIT
  // ===============================
  useEffect(() => {
    const init = async () => {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        navigate('/login', { replace: true })
        return
      }

      await Promise.all([
        fetchFiles(),
        checkBabGenerated(),
      ])

      setLoading(false)
    }

    init()
  }, [master_id, navigate])

  // ===============================
  // FETCHERS
  // ===============================
  const fetchFiles = async () => {
    const { data } = await supabase
      .from('generated_files')
      .select('*')
      .eq('master_id', master_id)
      .order('order_index')

    if (data) setFiles(data)
  }

  const checkBabGenerated = async () => {
    const { count } = await supabase
      .from('babs')
      .select('*', { count: 'exact', head: true })
      .eq('master_id', master_id)

    setBabGenerated((count ?? 0) > 0)
  }

  // ===============================
  // ACTIONS
  // ===============================
  const generateBabOnce = async () => {
    if (babGenerated || generatingBab) return

    setGeneratingBab(true)

    const { error } = await supabase.rpc(
      'generate_babs_from_master',
      { p_master_id: master_id }
    )

    setGeneratingBab(false)

    if (error) {
      alert('Gagal generate BAB')
      console.error(error)
      return
    }

    setBabGenerated(true)
    alert('BAB berhasil digenerate')
  }

  const generateOne = async (file: GeneratedFile) => {
    const endpoint = `/functions/v1/generate_${file.type}`

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generated_file_id: file.id }),
    })

    await fetchFiles()
  }

  const generateAll = async () => {
    setRunningAll(true)

    await fetch('/functions/v1/generate_all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ master_id }),
    })

    setRunningAll(false)
    await fetchFiles()
  }

  const doneCount = files.filter(f => f.status === 'success').length

  // ===============================
  // RENDER
  // ===============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            Generate Administrasi
          </h1>
          <p className="text-sm text-slate-500">
            {doneCount} / {files.length} file selesai
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={generateBabOnce}
            disabled={babGenerated || generatingBab}
          >
            {babGenerated
              ? 'BAB Sudah Digenerate'
              : generatingBab
                ? 'Mengenerate BAB...'
                : 'Generate BAB'}
          </Button>

          <Button
            onClick={generateAll}
            disabled={runningAll || !babGenerated}
          >
            {runningAll ? 'Menjalankan...' : 'Generate Semua'}
          </Button>
        </div>
      </div>

      {/* FILE LIST */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">File</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {files.map(file => (
              <tr key={file.id} className="border-t">
                <td className="px-4 py-3">
                  {file.type.toUpperCase()}
                  {file.bab_label && ` – ${file.bab_label}`}
                </td>

                <td className="px-4 py-3">
                  {file.status === 'pending' && 'Belum dibuat'}
                  {file.status === 'generating' && 'Sedang dibuat...'}
                  {file.status === 'success' && 'Selesai'}
                  {file.status === 'error' && (
                    <span className="text-red-600">
                      Error
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  {file.status !== 'success' && (
                    <Button
                      size="sm"
                      onClick={() => generateOne(file)}
                      disabled={
                        file.status === 'generating' ||
                        !babGenerated
                      }
                    >
                      Generate
                    </Button>
                  )}

                  {file.status === 'success' && file.file_url && (
                    <a
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm underline"
                    >
                      Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
