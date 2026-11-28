import { useEffect, useRef, useState } from 'react'
import { profile } from './content'
import { OPEN_CV } from './events'
import { lockScroll } from './scroll'
import { cn } from './lib/utils'

const BASE = import.meta.env.BASE_URL

/**
 * A link to the CV PDF. A plain click opens the CV dialog instead. A middle click,
 * a modifier click or "open in new tab" still gets the PDF.
 */
export function CvLink({ className, children }: { className?: string; children: React.ReactNode }) {
  if (!profile.cv) return null
  return (
    <a
      href={BASE + profile.cv.pdf}
      aria-haspopup="dialog"
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        window.dispatchEvent(new Event(OPEN_CV))
      }}
      className={className}
    >
      {children}
    </a>
  )
}

/** The CV in a modal dialog. Mount once; open it with a CvLink. */
export function CvDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_CV, onOpen)
    return () => window.removeEventListener(OPEN_CV, onOpen)
  }, [])

  useEffect(() => {
    const d = ref.current
    if (!d || !open) return
    d.showModal()
    body.current?.focus() // so the arrow keys and Page Down scroll the CV straight away
    lockScroll(true)
    return () => {
      lockScroll(false)
      if (d.open) d.close()
    }
  }, [open])

  const cv = profile.cv
  if (!cv) return null
  const btn = 'rounded-full border px-4 py-2 font-mono text-xs transition'
  return (
    <dialog
      ref={ref}
      onClose={() => setOpen(false)}
      // A click that lands on the <dialog> itself (not its content) is a click on the backdrop.
      onClick={(ev) => ev.target === ref.current && ref.current.close()}
      aria-labelledby="cv-title"
      className="m-auto max-h-none w-[min(94vw,52rem)] max-w-none bg-transparent p-0 text-fg backdrop:bg-black/80"
    >
      {open && (
        // Sized to the CV, up to the screen height; the CV scrolls inside when it's taller.
        <div className="flex max-h-[94svh] flex-col rounded-3xl border border-line bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
            <h2 id="cv-title" className="font-mono text-sm font-bold uppercase tracking-widest">
              Curriculum vitae
            </h2>
            <div className="flex gap-2">
              <a href={BASE + cv.pdf} download className={cn(btn, 'border-fg bg-fg text-bg hover:border-accent-fill hover:bg-accent-fill hover:text-on-fill')}>
                Download PDF
              </a>
              <button type="button" onClick={() => ref.current?.close()} className={cn(btn, 'border-line hover:border-accent hover:text-accent')}>
                Close
              </button>
            </div>
          </div>
          <div
            ref={body}
            tabIndex={0}
            aria-label="CV, scrollable"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-b-3xl p-3 md:p-4"
          >
            <img
              src={BASE + cv.image}
              width={cv.w}
              height={cv.h}
              alt={`Two-page CV of ${profile.name}, aspiring software developer from Esperanza, Sultan Kudarat. Page 1: profile and three projects (ExploreNDMU, an AR campus navigation app; SSG Payment System, a full-stack payment portal; a Java point-of-sale system). Page 2: technical skills, education (BS Information Technology at Notre Dame of Marbel University, 2023 to present), leadership in PSITS and the Muslim Students Organization, and links.`}
              decoding="async"
              className="block h-auto w-full rounded-xl bg-white"
            />
          </div>
        </div>
      )}
    </dialog>
  )
}
