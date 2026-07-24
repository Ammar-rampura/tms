import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Users,
  Download,
} from 'lucide-react'
import { useData } from '@/context/DataContext'
import { exportToCsv } from '@/lib/export'
import { SearchBar } from '@/components/SearchBar'
import { FeeStatusBadge, MarhalaBadge } from '@/components/StatusBadge'
import { getMarhalaStatus } from '@/lib/quran'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog'
import { Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Program, Student } from '@/types'
import { toast } from 'sonner'

const PAGE_SIZE = 8

type SortKey = 'name' | 'createdDate' | 'dueAmount'

export function JanabStudents() {
  const { students, loading, updateStudent, deleteStudent } = useData()
  const [query, setQuery] = useState('')
  const [marhalaFilter, setMarhalaFilter] = useState<string>('all')
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [customAgeRange, setCustomAgeRange] = useState<{min: number, max: number}>({ min: 0, max: 100 })
  const [sortKey, setSortKey] = useState<SortKey>('createdDate')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Student | null>(null)
  const [deleting, setDeleting] = useState<Student | null>(null)

  const filtered = useMemo(() => {
    let list = students.filter((s) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.its.includes(q)
      
      const mStatus = getMarhalaStatus(s.completedJuz || [])
      const matchesMarhala = marhalaFilter === 'all' || mStatus.type === marhalaFilter
      let matchesAge = true
      if (ageFilter === '0-10') matchesAge = s.age >= 0 && s.age <= 10
      else if (ageFilter === '11-20') matchesAge = s.age >= 11 && s.age <= 20
      else if (ageFilter === '21-30') matchesAge = s.age >= 21 && s.age <= 30
      else if (ageFilter === '31-40') matchesAge = s.age >= 31 && s.age <= 40
      else if (ageFilter === '41-50') matchesAge = s.age >= 41 && s.age <= 50
      else if (ageFilter === '51-60') matchesAge = s.age >= 51 && s.age <= 60
      else if (ageFilter === '61-70') matchesAge = s.age >= 61 && s.age <= 70
      else if (ageFilter === '71-80') matchesAge = s.age >= 71 && s.age <= 80
      else if (ageFilter === '80+') matchesAge = s.age > 80
      else if (ageFilter === 'custom') {
        matchesAge = s.age >= (customAgeRange.min || 0) && s.age <= (customAgeRange.max || 999)
      }

      return matchesQuery && matchesMarhala && matchesAge
    })
    list = list.slice().sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name)
      if (sortKey === 'dueAmount') return b.dueAmount - a.dueAmount
      return a.createdDate < b.createdDate ? 1 : -1
    })
    return list
  }, [students, query, marhalaFilter, ageFilter, customAgeRange, sortKey])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changePage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages))
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteStudent(deleting.id)
    toast.success(`${deleting.name} removed from records`)
    setDeleting(null)
  }

  function handleExport() {
    const data = filtered.map(s => ({
      ID: s.id,
      Name: s.name,
      ITS: s.its,
      Age: s.age,
      Program: s.program,
      'Marhala Status': getMarhalaStatus(s.completedJuz || []).text,
      Mobile: s.mobile,
      'Father Name': s.fatherName,
      'Mother Name': s.motherName,
      'Parent Number': s.parentNumber,
      Email: s.email,
      Address: s.address,
      'Monthly Fee': s.monthlyFee,
      'Paid Amount': s.paidAmount,
      'Due Amount': s.dueAmount,
      'Fee Status': s.feeStatus,
      Remarks: s.remarks || '',
      'Registered Date': formatDate(s.createdDate)
    }))
    exportToCsv('janab_students.csv', data)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink dark:text-primary-50">Students</h2>
          <p className="text-sm text-ink/50 dark:text-primary-100/50">{filtered.length} of {students.length} students</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="sm" onClick={handleExport} className="h-10">
            <Download className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <SearchBar value={query} onChange={(v) => { setQuery(v); setPage(1) }} className="sm:w-72" />
          <Select value={marhalaFilter} onValueChange={(v) => { setMarhalaFilter(v); setPage(1) }}>
            <SelectTrigger className="sm:w-44"><SelectValue placeholder="Hifz Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hifz Statuses</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Not Started">Not Started</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ageFilter} onValueChange={(v) => { setAgeFilter(v); setPage(1) }}>
            <SelectTrigger className="sm:w-36"><SelectValue placeholder="Age Group" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="0-10">0 - 10</SelectItem>
              <SelectItem value="11-20">11 - 20</SelectItem>
              <SelectItem value="21-30">21 - 30</SelectItem>
              <SelectItem value="31-40">31 - 40</SelectItem>
              <SelectItem value="41-50">41 - 50</SelectItem>
              <SelectItem value="51-60">51 - 60</SelectItem>
              <SelectItem value="61-70">61 - 70</SelectItem>
              <SelectItem value="71-80">71 - 80</SelectItem>
              <SelectItem value="80+">80+</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {ageFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                className="w-16 px-2 py-1 h-10"
                value={customAgeRange.min === 0 ? '' : customAgeRange.min}
                onChange={(e) => setCustomAgeRange({ ...customAgeRange, min: parseInt(e.target.value) || 0 })}
              />
              <span className="text-ink/40 dark:text-primary-100/40">-</span>
              <Input
                type="number"
                placeholder="Max"
                className="w-16 px-2 py-1 h-10"
                value={customAgeRange.max === 0 ? '' : customAgeRange.max}
                onChange={(e) => setCustomAgeRange({ ...customAgeRange, max: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="sm:w-44"><ArrowUpDown className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdDate">Newest First</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="dueAmount">Highest Due</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center gap-2 p-16 text-center">
          <Users className="h-9 w-9 text-ink/25" />
          <p className="font-medium text-ink/60 dark:text-primary-100/60">No students match your search</p>
          <p className="text-sm text-ink/40 dark:text-primary-100/40">Try adjusting filters or search terms.</p>
        </div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-primary-900/10 text-left text-xs uppercase tracking-wide text-ink/45 dark:border-primary-100/10 dark:text-primary-100/45">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">ITS</th>
                <th className="px-4 py-3 font-semibold">Age</th>
                <th className="px-4 py-3 font-semibold">Hifz</th>
                <th className="px-4 py-3 font-semibold">Fee</th>
                <th className="px-4 py-3 font-semibold">Paid / Due</th>
                <th className="px-4 py-3 font-semibold">Registered</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-primary-900/[0.05] last:border-0 hover:bg-primary-900/[0.02] dark:border-primary-100/[0.06] dark:hover:bg-primary-100/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink dark:text-primary-50">{student.name}</p>
                    <p className="font-mono text-xs text-ink/45 dark:text-primary-100/45">{student.id}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink/70 dark:text-primary-100/70">{student.its}</td>
                  <td className="px-4 py-3 text-ink/70 dark:text-primary-100/70">{student.age}</td>
                  <td className="px-4 py-3"><MarhalaBadge status={getMarhalaStatus(student.completedJuz || [])} /></td>
                  <td className="px-4 py-3"><FeeStatusBadge status={student.feeStatus} /></td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="text-primary-600 dark:text-primary-300">{formatCurrency(student.paidAmount)}</span>
                    {' / '}
                    <span className="text-red-500">{formatCurrency(student.dueAmount)}</span>
                  </td>
                  <td className="px-4 py-3 text-ink/55 dark:text-primary-100/55">{formatDate(student.createdDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/janab/students/${student.id}`}>
                        <Button variant="ghost" size="icon" title="View profile"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Quick edit" onClick={() => setEditing(student)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleting(student)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink/50 dark:text-primary-100/50">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => changePage(page - 1)} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" onClick={() => changePage(page + 1)} disabled={page === totalPages}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update contact and status details for {editing?.name}.</DialogDescription>
          {editing && (
            <form
              className="mt-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = new FormData(e.currentTarget)
                await updateStudent(editing.id, {
                  mobile: String(form.get('mobile')),
                  address: String(form.get('address')),
                  remarks: String(form.get('remarks') || ''),
                  program: form.get('program') as Program,
                })
                toast.success('Student updated')
                setEditing(null)
              }}
            >
              <div>
                <Label>Mobile Number</Label>
                <Input name="mobile" defaultValue={editing.mobile} required />
              </div>
              <div>
                <Label>Address</Label>
                <Input name="address" defaultValue={editing.address} required />
              </div>
              <div>
                <Label>Program</Label>
                <select
                  name="program"
                  defaultValue={editing.program}
                  className="h-11 w-full rounded-xl border border-primary-900/12 bg-white/70 px-3.5 text-sm dark:border-primary-100/12 dark:bg-primary-900/40"
                >
                  <option value="Tahfeez">Tahfeez</option>
                  <option value="Taiseer">Taiseer</option>
                </select>
              </div>
              <div>
                <Label>Remarks</Label>
                <Input name="remarks" defaultValue={editing.remarks} />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the student's record, including fee and payment history. This action cannot be undone.
          </AlertDialogDescription>
          <div className="mt-5 flex justify-end gap-3">
            <AlertDialogCancel asChild><Button variant="outline">Cancel</Button></AlertDialogCancel>
            <AlertDialogAction asChild><Button variant="danger" onClick={handleDelete}>Delete</Button></AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
