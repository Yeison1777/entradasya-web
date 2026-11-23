import type { IScannerControls } from '@zxing/browser'
import { Camera, CameraOff, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface QrScannerProps {
  disabled?: boolean
  onDetected: (code: string) => void
}

export function QrScanner({ disabled = false, onDetected }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const onDetectedRef = useRef(onDetected)
  const [active, setActive] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  useEffect(() => {
    if (!active) return

    let cancelled = false
    async function start() {
      if (!window.isSecureContext) {
        setError('La cámara requiere HTTPS o abrir la aplicación desde localhost.')
        setActive(false)
        return
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Este navegador no permite acceder a la cámara.')
        setActive(false)
        return
      }

      setStarting(true)
      setError(null)
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        const reader = new BrowserQRCodeReader()
        const controls = await reader.decodeFromConstraints(
          {
            audio: false,
            video: { facingMode: { ideal: 'environment' } },
          },
          videoRef.current ?? undefined,
          (result, _scanError, scannerControls) => {
            if (!result || cancelled) return
            scannerControls.stop()
            controlsRef.current = null
            setActive(false)
            onDetectedRef.current(result.getText())
          },
        )
        if (cancelled) {
          controls.stop()
        } else {
          controlsRef.current = controls
        }
      } catch (scanError) {
        if (!cancelled) {
          setError(cameraErrorMessage(scanError))
          setActive(false)
        }
      } finally {
        if (!cancelled) setStarting(false)
      }
    }

    void start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [active])

  function closeCamera() {
    controlsRef.current?.stop()
    controlsRef.current = null
    setActive(false)
    setStarting(false)
  }

  if (!active) {
    return (
      <div className="grid gap-2">
        <Button
          className="h-11 border-orange-200 text-orange-700 hover:bg-orange-50"
          disabled={disabled}
          onClick={() => setActive(true)}
          type="button"
          variant="outline"
        >
          <Camera />
          Abrir cámara y escanear QR
        </Button>
        {disabled ? <p className="text-xs text-slate-500">Selecciona un evento antes de abrir la cámara.</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p> : null}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
        <video className="size-full object-cover" muted playsInline ref={videoRef} />
        <div className="pointer-events-none absolute inset-[15%] rounded-2xl border-2 border-orange-400 shadow-[0_0_0_999px_rgba(0,0,0,.35)]" />
        {starting ? (
          <div className="absolute inset-0 grid place-items-center bg-black/50 text-sm font-medium text-white">
            <span className="flex items-center gap-2"><LoaderCircle className="animate-spin" />Iniciando cámara…</span>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-center text-sm text-slate-300">Coloca el código QR dentro del recuadro.</p>
      <Button className="mt-3 h-10 w-full border-slate-600 text-white hover:bg-slate-800" onClick={closeCamera} type="button" variant="outline">
        <CameraOff />
        Cerrar cámara
      </Button>
    </div>
  )
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Permiso de cámara rechazado. Habilítalo en la configuración del navegador.'
    if (error.name === 'NotFoundError') return 'No se encontró una cámara disponible.'
    if (error.name === 'NotReadableError') return 'La cámara está siendo utilizada por otra aplicación.'
  }
  return 'No se pudo iniciar la cámara. Puedes pegar el código manualmente.'
}
