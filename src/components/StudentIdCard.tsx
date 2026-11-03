import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { BookOpenText, QrCode, ShieldCheck, Printer } from 'lucide-react'
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
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
        dark: '#173832',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err))
  }, [student])

  const marhala = getMarhalaStatus(student.completedJuz)
  const completedCount = student.completedJuz?.length || 0

  function handlePrint() {
    if (!cardRef.current) return

    // Create an isolated printable window to print ONLY the ID card
    const printWindow = window.open('', '_blank', 'width=500,height=700')
    if (!printWindow) {
      window.print()
      return
    }

    const cardHtml = cardRef.current.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Card - ${student.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
            
            @page {
              size: auto;
              margin: 15mm;
            }

            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              background: #FFFFFF;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }

            .id-card-wrapper {
              width: 360px;
              border-radius: 18px;
              border: 2px solid #D6B355;
              background: #FFFFFF;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0,0,0,0.12);
              page-break-inside: avoid;
            }

            .lanyard-hole {
              display: flex;
              justify-content: center;
              padding-top: 10px;
            }
            .lanyard-bar {
              height: 7px;
              width: 48px;
              border-radius: 9999px;
              background: #E5E7EB;
              border: 1px solid #D1D5DB;
            }

            .header-ribbon {
              background: linear-gradient(135deg, #173832 0%, #1F4B43 50%, #0A1917 100%);
              color: #FFFFFF;
              padding: 14px 18px;
              margin-top: 8px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo-icon {
              width: 34px;
              height: 34px;
              border-radius: 10px;
              background: linear-gradient(135deg, #D6B355, #C29B3E);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            }
            .header-title {
              font-family: 'Fraunces', serif;
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.5px;
              color: #F3E6BE;
              line-height: 1.2;
            }
            .header-sub {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #A6C9C0;
            }
            .program-pill {
              background: rgba(214, 179, 85, 0.2);
              border: 1px solid rgba(214, 179, 85, 0.4);
              color: #F3E6BE;
              padding: 3px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 600;
              font-family: 'JetBrains Mono', monospace;
            }

            .card-body {
              padding: 18px;
            }
            .profile-row {
              display: flex;
              align-items: flex-start;
              gap: 14px;
            }
            .avatar-box {
              width: 74px;
              height: 74px;
              border-radius: 16px;
              border: 2px solid #D6B355;
              background: linear-gradient(135deg, #1F4B43, #173832);
              color: #F3E6BE;
              font-family: 'Fraunces', serif;
              font-size: 28px;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            .name-box {
              flex: 1;
              min-width: 0;
            }
            .student-name {
              font-family: 'Fraunces', serif;
              font-size: 16px;
              font-weight: 700;
              color: #1B2422;
              line-height: 1.25;
              margin-bottom: 6px;
            }
            .field-label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              color: #8C9491;
              margin-bottom: 1px;
            }
            .field-val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              font-weight: 700;
              color: #173832;
              margin-bottom: 4px;
            }
            .field-val-gold {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              font-weight: 700;
              color: #8E6F2F;
            }

            .progress-strip {
              margin-top: 14px;
              padding: 10px 12px;
              border-radius: 12px;
              background: #F6F4EE;
              border: 1px solid rgba(27, 36, 34, 0.08);
            }
            .strip-header {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              font-weight: 600;
              color: #1B2422;
              margin-bottom: 6px;
            }
            .progress-track {
              height: 6px;
              width: 100%;
              background: #E5E7EB;
              border-radius: 9999px;
              overflow: hidden;
            }
            .progress-fill {
              height: 100%;
              background: linear-gradient(90deg, #256B5B, #D6B355);
              border-radius: 9999px;
            }
            .strip-sub {
              display: flex;
              justify-content: space-between;
              margin-top: 4px;
              font-size: 9px;
              color: #6B7280;
            }

            .footer-row {
              margin-top: 14px;
              padding-top: 10px;
              border-top: 1px dashed #E5E7EB;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .footer-info {
              font-size: 10px;
              color: #4B5563;
              line-height: 1.4;
            }
            .qr-container {
              padding: 3px;
              border-radius: 8px;
              border: 1px solid #E5E7EB;
              background: #FFFFFF;
            }
            .qr-container img {
              width: 48px;
              height: 48px;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="id-card-wrapper">
            <div class="lanyard-hole">
              <div class="lanyard-bar"></div>
            </div>

            <div class="header-ribbon">
              <div class="header-left">
                <div class="logo-icon">📖</div>
                <div>
                  <div class="header-title">TAHFEEZ-UL-QURAN</div>
                  <div class="header-sub">Official Student ID</div>
                </div>
              </div>
              <div class="program-pill">${student.program}</div>
            </div>

            <div class="card-body">
              <div class="profile-row">
                <div class="avatar-box">
                  ${student.name.charAt(0).toUpperCase()}
                </div>
                <div class="name-box">
                  <div class="student-name">${student.name}</div>
                  <div>
                    <div class="field-label">Student ID</div>
                    <div class="field-val">${student.id}</div>
                  </div>
                  <div>
                    <div class="field-label">ITS Number</div>
                    <div class="field-val-gold">${student.its}</div>
                  </div>
                </div>
              </div>

              <div class="progress-strip">
                <div class="strip-header">
                  <span>Hifz Progress</span>
                  <span><strong>${completedCount}</strong> / 30 Juz</span>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${Math.round((completedCount / 30) * 100)}%;"></div>
                </div>
                <div class="strip-sub">
                  <span>${marhala.text}</span>
                  <span>${Math.round((completedCount / 30) * 100)}% Complete</span>
                </div>
              </div>

              <div class="footer-row">
                <div class="footer-info">
                  <div><strong>Phone:</strong> ${student.mobile}</div>
                  <div style="font-size: 8px; color: #8C9491;">Issued by Tahfeez Management</div>
                </div>
                <div class="qr-container">
                  <img src="${qrCodeUrl}" alt="QR" />
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Physical-Style ID Card Container */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-[360px] overflow-hidden rounded-2xl border-2 border-brass-400/35 bg-gradient-to-b from-white via-paper to-white shadow-card dark:from-primary-900 dark:via-primary-850 dark:to-primary-900 dark:border-brass-400/25"
      >
        {/* Lanyard Punch Hole Decoration */}
        <div className="flex justify-center pt-2.5">
          <div className="h-2 w-12 rounded-full border border-primary-900/20 bg-primary-900/10 dark:border-primary-100/20 dark:bg-primary-100/10" />
        </div>

        {/* Top Header Ribbon with Emblem */}
        <div className="relative mt-2 bg-gradient-to-r from-primary-800 via-primary-700 to-primary-900 px-5 py-3.5 text-white shadow-soft">
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
                <p className="text-[9px] uppercase tracking-widest text-primary-200/80">
                  Official Student ID
                </p>
              </div>
            </div>
            <span className="rounded-full bg-brass-500/20 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-brass-300 border border-brass-400/30">
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

      {/* Action Button for Print */}
      {showActions && (
        <div className="mt-3 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-900/12 bg-white px-3.5 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-primary-900/[0.04] dark:border-primary-100/15 dark:bg-primary-800 dark:text-primary-50 dark:hover:bg-primary-750 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-primary-600 dark:text-brass-400" />
            Print ID Card
          </button>
        </div>
      )}
    </div>
  )
}
