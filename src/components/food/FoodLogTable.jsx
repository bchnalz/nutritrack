import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FoodLogDetailModal } from '@/components/food/FoodLogDetailModal'
import { formatDateId } from '@/lib/format'
import { KaloriValue } from '@/components/shared/KaloriValue'
import { MEAL_LOG_DAY_CARD_RADIUS_CLASS } from '@/lib/pageCard'
import { cn } from '@/lib/utils'
import { useFoodLogItems } from '@/hooks/useFoodLog'

export { MEAL_LOG_DAY_CARD_RADIUS_CLASS }

const WAKTU_KEYS = ['pagi', 'siang', 'malam', 'snack']

const WAKTU_LABELS = {
  pagi: 'Pagi',
  siang: 'Siang',
  malam: 'Malam',
  snack: 'Snack',
}

/** Light yellow accent for generated meal-log rows / cells (Pantau log, klien dashboard). */
const MEAL_LOG_DAY_SURFACE = cn(
  'border-amber-200/55 bg-amber-50/95 text-card-foreground ring-1 ring-amber-200/35',
  'hover:border-amber-300/55 hover:bg-amber-50',
)
const MEAL_LOG_MEAL_CELL_FILLED = cn(
  'border-amber-200/50 bg-amber-100/55 ring-1 ring-amber-200/25',
  'group-hover:bg-amber-100/70',
)
const MEAL_LOG_TABLE_ROW = cn(
  'border-amber-100/70 bg-amber-50/90 hover:bg-amber-50',
  'data-[state=selected]:bg-amber-100/60',
)

function groupLogsByDate(logs) {
  const map = new Map()
  for (const log of logs ?? []) {
    const d = log.tanggal
    if (!map.has(d)) map.set(d, {})
    map.get(d)[log.waktu_makan] = log
  }
  return map
}

function dayStats(byDate, tanggal) {
  const m = byDate.get(tanggal) ?? {}
  const vals = WAKTU_KEYS.map((k) => (m[k] ? Number(m[k].total_kalori) : null))
  const total = vals.reduce((a, v) => a + (v ?? 0), 0)
  return { m, vals, total }
}

export function FoodLogTable({ logs, pageSize = 10, embedded = false }) {
  const byDate = useMemo(() => groupLogsByDate(logs), [logs])
  const sortedDates = useMemo(
    () => [...byDate.keys()].sort((a, b) => b.localeCompare(a)),
    [byDate],
  )
  const [page, setPage] = useState(0)
  const start = page * pageSize
  const slice = sortedDates.slice(start, start + pageSize)

  const logIdsForPage = useMemo(() => {
    const ids = []
    for (const d of slice) {
      const m = byDate.get(d)
      for (const k of WAKTU_KEYS) {
        if (m[k]) ids.push(m[k].id)
      }
    }
    return ids
  }, [byDate, slice])

  const { data: items = [] } = useFoodLogItems(logIdsForPage, logIdsForPage.length > 0)

  const itemsByLogId = useMemo(() => {
    const acc = {}
    for (const it of items) {
      if (!acc[it.food_log_id]) acc[it.food_log_id] = []
      acc[it.food_log_id].push(it)
    }
    return acc
  }, [items])

  const [modal, setModal] = useState(null)

  const totalPages = Math.max(1, Math.ceil(sortedDates.length / pageSize))

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {slice.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground shadow-sm">
            Belum ada log.
          </p>
        ) : (
          slice.map((tanggal) => {
            const { vals, total } = dayStats(byDate, tanggal)
            const dateLabel = formatDateId(tanggal)
            return (
              <button
                key={tanggal}
                type="button"
                onClick={() => setModal(tanggal)}
                aria-label={`Buka detail log makan ${dateLabel}`}
                className={cn(
                  'group w-full cursor-pointer touch-manipulation select-none text-left outline-none transition-[transform,box-shadow,border-color] duration-200',
                  MEAL_LOG_DAY_CARD_RADIUS_CLASS,
                  'border p-3.5 shadow-sm',
                  MEAL_LOG_DAY_SURFACE,
                  'active:scale-[0.99]',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug tracking-tight text-foreground">
                    {dateLabel}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Total
                      </div>
                      <div className="text-base font-semibold tabular-nums text-primary">
                        {total > 0 ? <KaloriValue value={total} /> : '—'}
                      </div>
                    </div>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                      aria-hidden
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {WAKTU_KEYS.map((k, i) => (
                    <div
                      key={k}
                      className={cn(
                        'min-w-0 rounded-xl border px-1 py-2 text-center transition-colors',
                        vals[i] != null
                          ? MEAL_LOG_MEAL_CELL_FILLED
                          : 'border-border bg-muted group-hover:bg-muted/90',
                      )}
                    >
                      <div className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {WAKTU_LABELS[k]}
                      </div>
                      <div className="mt-1 min-w-0 truncate text-xs font-semibold tabular-nums text-foreground">
                        {vals[i] != null ? <KaloriValue value={vals[i]} /> : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            )
          })
        )}
      </div>

      <Card
        className={cn(
          'hidden overflow-hidden md:block',
          embedded && 'border-0 bg-transparent shadow-none',
        )}
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Pagi</TableHead>
                  <TableHead className="text-right">Siang</TableHead>
                  <TableHead className="text-right">Malam</TableHead>
                  <TableHead className="text-right">Snack</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((tanggal) => {
                  const { vals, total } = dayStats(byDate, tanggal)
                  return (
                    <TableRow key={tanggal} className={MEAL_LOG_TABLE_ROW}>
                      <TableCell>{formatDateId(tanggal)}</TableCell>
                      {vals.map((v, i) => (
                        <TableCell key={i} className="text-right tabular-nums">
                          {v != null ? <KaloriValue value={v} /> : '—'}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-medium tabular-nums">
                        {total > 0 ? <KaloriValue value={total} /> : '—'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setModal(tanggal)}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {slice.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Belum ada log.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <div
        className={cn(
          'flex items-center justify-between gap-2',
          'rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm ring-1 ring-black/[0.04]',
          'md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:ring-0',
        )}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Sebelumnya
        </Button>
        <span className="text-sm font-medium text-foreground tabular-nums md:font-normal md:text-muted-foreground">
          Halaman {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          Berikutnya
        </Button>
      </div>

      {modal && (
        <FoodLogDetailModal
          open={Boolean(modal)}
          onOpenChange={(o) => !o && setModal(null)}
          tanggal={modal}
          logsByMeal={byDate.get(modal) ?? {}}
          itemsByLogId={itemsByLogId}
        />
      )}
    </div>
  )
}
