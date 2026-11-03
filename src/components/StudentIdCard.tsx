import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, QrCode, ShieldCheck, Printer, Download, Sparkles } from 'lucide-react'
import QRCode from 'qrcode'
import type { Student } from '@/types'
import { getMarhalaStatus } from '@/lib/quran'

interface StudentIdCardProps {
  student: Student
  className?: string
  showActions?: boolean
}

export function StudentIdCard({ student, className = '', showActions = true }: StudentIdCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    // Generate QR code encoding student identity & verification URL
    const payload = JSON.stringify({
      id: student.id,
      name: student.name,
      its: student.its,
      program: student.program,
    })

    QRCode.toDataURL(payload, {
      margin: 1,
      width: 160,
      color: {
        dark: '#173832', // primary-700
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err))
  }, [student])

  const marhala = getMarhalaStatus(student.completedJuz)
  const completedCount = student.completedJuz?.length || 0

  function handlePrint() {
    window.print()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Physical-Style ID Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[380px] overflow-hidden rounded-2xl border-2 border-brass-400/30 bg-gradient-to-b from-white via-paper to-white shadow-2xl dark:from-primary-900 dark:via-primary-850 dark:to-primary-900 dark:border-brass-400/20"
      >
        {/* Lanyard Punch Hole Decoration */}
        <div className="flex justify-center pt-2">
          <div className="h-2 w-12 rounded-full border border-primary-900/20 bg-primary-900/10 dark:border-primary-100/20 dark:bg-primary-100/10" />
        </div>

        {/* Top Header Ribbon with Emblem */}
        <div className="relative mt-2 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 px-5 py-4 text-white shadow-soft">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-brass-400/20 blur-xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brass-400 to-brass-600 text-white shadow-glow">
                <BookOpenText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold tracking-wide text-brass-200">
                  TAHFEEZ-UL-QURAN
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-primary-200/80">
                  Official Student ID
                </p>
              </div>
            </div>
            <span className="rounded-full bg-brass-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-brass-300 border border-brass-400/30">
              {student.program}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Student Avatar / Photo Box */}
            <div className="relative flex flex-col items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-brass-400/40 bg-gradient-to-tr from-primary-700 to-primary-600 font-display text-2xl font-bold text-brass-200 shadow-soft">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Active
              </span>
            </div>

            {/* Student Identity Information */}
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-display text-base font-bold text-ink dark:text-primary-50 line-clamp-2 leading-tight">
                {student.name}
              </h4>
              <div className="pt-1 space-y-1">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 dark:text-primary-100/40">
                    Student ID
                  </span>
                  <p className="font-mono text-xs font-bold text-primary-700 dark:text-primary-300">
                    {student.id}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40 dark:text-primary-100/40">
                    ITS Number
                  </span>
                  <p className="font-mono text-xs font-bold text-brass-700 dark:text-brass-300">
                    {student.its}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hifz Status Strip */}
          <div className="mt-4 rounded-xl border border-primary-900/10 bg-primary-900/[0.03] p-2.5 dark:border-primary-100/10 dark:bg-primary-100/[0.03]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink/60 dark:text-primary-100/60 font-medium">Hifz Progress</span>
              <span className="font-mono font-bold text-primary-700 dark:text-primary-300">
                {completedCount} / 30 Juz
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary-900/[0.06] dark:bg-primary-100/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-brass-400"
                style={{ width: `${Math.round((completedCount / 30) * 100)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-ink/45 dark:text-primary-100/45">
              <span>{marhala.text}</span>
              <span>{Math.round((completedCount / 30) * 100)}% Complete</span>
            </div>
          </div>

          {/* Bottom Card Footer: QR Code & Verification Watermark */}
          <div className="mt-4 flex items-center justify-between border-t border-primary-900/[0.06] pt-3 dark:border-primary-100/[0.08]">
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold text-ink/60 dark:text-primary-100/60">
                Phone: {student.mobile}
              </p>
              <p className="text-[9px] text-ink/40 dark:text-primary-100/40">
                Issued by Tahfeez Management
              </p>
            </div>

            {qrCodeUrl ? (
              <div className="rounded-lg border border-primary-900/10 bg-white p-1 shadow-sm dark:border-primary-100/10">
                <img src={qrCodeUrl} alt="Student QR Code" className="h-12 w-12" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-900/5 text-ink/40">
                <QrCode className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Action Buttons for Print / Save */}
      {showActions && (
        <div className="mt-4 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-900/12 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-sm hover:bg-primary-900/[0.04] dark:border-primary-100/15 dark:bg-primary-800 dark:text-primary-50 dark:hover:bg-primary-750 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-primary-600 dark:text-brass-400" />
            Print ID Card
          </button>
        </div>
      )}
    </div>
  )
}
