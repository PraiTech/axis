import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar as CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export interface CalendarProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function Calendar({ value, onChange, placeholder = "MM/DD/YYYY", className }: CalendarProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date())
  const inputRef = React.useRef<HTMLInputElement>(null)
  const calendarRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  
  const PADDING = 8

  React.useEffect(() => {
    if (value) {
      setCurrentMonth(value)
    }
  }, [value])

  React.useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && calendarRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect()
        const calendarRect = calendarRef.current.getBoundingClientRect()
        
        const scrollY = window.scrollY || window.pageYOffset
        const scrollX = window.scrollX || window.pageXOffset
        
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        // Используем реальные размеры календаря или примерные, если еще не отрендерен
        const calendarWidth = calendarRect.width || 340
        const calendarHeight = calendarRect.height || 420
        
        // Определяем позицию по вертикали
        let top: number
        const spaceBelow = viewportHeight - inputRect.bottom
        const spaceAbove = inputRect.top
        
        if (spaceBelow >= calendarHeight + PADDING) {
          // Помещается снизу
          top = inputRect.bottom + scrollY + PADDING
        } else if (spaceAbove >= calendarHeight + PADDING) {
          // Помещается сверху
          top = inputRect.top + scrollY - calendarHeight - PADDING
        } else {
          // Не помещается ни сверху, ни снизу - выбираем сторону с большим пространством
          if (spaceBelow > spaceAbove) {
            // Больше места снизу - открываем снизу, но ограничиваем высотой экрана
            top = Math.min(
              inputRect.bottom + scrollY + PADDING,
              scrollY + viewportHeight - calendarHeight - PADDING
            )
          } else {
            // Больше места сверху - открываем сверху
            top = Math.max(
              inputRect.top + scrollY - calendarHeight - PADDING,
              scrollY + PADDING
            )
          }
        }
        
        // Определяем позицию по горизонтали
        let left: number
        if (inputRect.left + calendarWidth <= viewportWidth - PADDING) {
          // Помещается справа
          left = inputRect.left + scrollX
        } else if (inputRect.right - calendarWidth >= PADDING) {
          // Помещается слева от input
          left = inputRect.right + scrollX - calendarWidth
        } else {
          // Не помещается - центрируем или прижимаем к краю
          if (calendarWidth < viewportWidth) {
            left = scrollX + (viewportWidth - calendarWidth) / 2
          } else {
            left = scrollX + PADDING
          }
        }
        
        // Гарантируем, что календарь не выходит за границы экрана
        left = Math.round(Math.max(PADDING, Math.min(left, scrollX + viewportWidth - calendarWidth - PADDING)))
        top = Math.round(Math.max(scrollY + PADDING, Math.min(top, scrollY + viewportHeight - calendarHeight - PADDING)))
        
        setPosition({ top, left })
      } else if (inputRef.current) {
        // Если календарь еще не отрендерен, используем примерные размеры
        const rect = inputRef.current.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        const scrollX = window.scrollX || window.pageXOffset
        
        const CALENDAR_WIDTH = 340
        const CALENDAR_HEIGHT = 420
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let top: number
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        
        if (spaceBelow >= CALENDAR_HEIGHT + PADDING) {
          top = rect.bottom + scrollY + PADDING
        } else if (spaceAbove >= CALENDAR_HEIGHT + PADDING) {
          top = rect.top + scrollY - CALENDAR_HEIGHT - PADDING
        } else {
          if (spaceBelow > spaceAbove) {
            top = Math.min(
              rect.bottom + scrollY + PADDING,
              scrollY + viewportHeight - CALENDAR_HEIGHT - PADDING
            )
          } else {
            top = Math.max(
              rect.top + scrollY - CALENDAR_HEIGHT - PADDING,
              scrollY + PADDING
            )
          }
        }
        
        let left: number
        if (rect.left + CALENDAR_WIDTH <= viewportWidth - PADDING) {
          left = rect.left + scrollX
        } else if (rect.right - CALENDAR_WIDTH >= PADDING) {
          left = rect.right + scrollX - CALENDAR_WIDTH
        } else {
          if (CALENDAR_WIDTH < viewportWidth) {
            left = scrollX + (viewportWidth - CALENDAR_WIDTH) / 2
          } else {
            left = scrollX + PADDING
          }
        }
        
        left = Math.round(Math.max(PADDING, Math.min(left, scrollX + viewportWidth - CALENDAR_WIDTH - PADDING)))
        top = Math.round(Math.max(scrollY + PADDING, Math.min(top, scrollY + viewportHeight - CALENDAR_HEIGHT - PADDING)))
        
        setPosition({ top, left })
      }
    }

    if (isOpen) {
      // Используем requestAnimationFrame для более точного позиционирования после рендера
      requestAnimationFrame(() => {
        updatePosition()
      })
      
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      // Также обновляем позицию после небольшой задержки для учета реальных размеров
      const timeoutId = setTimeout(updatePosition, 0)
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  React.useEffect(() => {
    const handlePointerOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!target) return
      if (calendarRef.current?.contains(target) || inputRef.current?.contains(target)) return
      // Закрывать только при клике по оверлею (вне календаря) — не при фокусе/тапе по инпуту
      setIsOpen(false)
    }

    if (isOpen) {
      const t = setTimeout(() => {
        document.addEventListener('pointerdown', handlePointerOutside)
      }, 0)
      return () => {
        clearTimeout(t)
        document.removeEventListener('pointerdown', handlePointerOutside)
      }
    }
  }, [isOpen])

  const selectedDate = value

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handleDateSelect = (date: Date) => {
    onChange?.(date)
    setIsOpen(false)
  }

  const handleToday = () => {
    const today = new Date()
    handleDateSelect(today)
    setCurrentMonth(today)
  }

  const handleDelete = () => {
    onChange?.(undefined)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleYearPrev = () => {
    setCurrentMonth(subMonths(currentMonth, 12))
  }

  const handleYearNext = () => {
    setCurrentMonth(addMonths(currentMonth, 12))
  }

  const handleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsOpen(true)
    // Позиция будет обновлена в useEffect при открытии
  }

  const displayValue = selectedDate ? format(selectedDate, 'MM/dd/yyyy') : ''

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          onClick={handleOpen}
          onFocus={handleOpen}
          className={cn(
            "flex h-10 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer pr-10 transition-all duration-200",
            "hover:border-primary/50 hover:shadow-sm",
            isOpen && "border-primary ring-2 ring-primary/20"
          )}
        />
        <CalendarIcon 
          onClick={(e) => {
            e.stopPropagation()
            handleOpen(e)
          }}
          className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer transition-colors",
            isOpen ? "text-primary" : "text-muted-foreground"
          )} 
        />
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                data-calendar-root
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm pointer-events-none"
                aria-hidden
              />
              <motion.div
                ref={calendarRef}
                data-calendar-root
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="fixed z-[9999] w-[360px] rounded-3xl border border-primary/20 bg-card shadow-2xl overflow-hidden backdrop-blur-xl bg-card/98 pointer-events-auto"
                style={{
                  top: `${Math.round(position.top)}px`,
                  left: `${Math.round(position.left)}px`,
                  maxHeight: `calc(100vh - ${PADDING * 2}px)`,
                  maxWidth: `calc(100vw - ${PADDING * 2}px)`,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
              {/* Header with beautiful gradient */}
              <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-primary/15 border-b border-primary/20 backdrop-blur-md shadow-lg shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                <div className="relative flex items-center justify-center p-5">
                  <div className="flex items-center gap-1.5 flex-1 justify-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-primary/25 hover:text-primary transition-all rounded-xl hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleYearPrev()
                      }}
                      title="Previous year"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-primary/25 hover:text-primary transition-all rounded-xl hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePrevMonth()
                      }}
                      title="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex-shrink-0 mx-4">
                    <span className="text-xl font-extrabold text-foreground tracking-tight">{months[currentMonth.getMonth()]}</span>
                    <span className="text-xl font-extrabold text-primary drop-shadow-sm">{currentMonth.getFullYear()}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-primary/25 hover:text-primary transition-all rounded-xl hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleNextMonth()
                      }}
                      title="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 hover:bg-primary/25 hover:text-primary transition-all rounded-xl hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleYearNext()
                      }}
                      title="Next year"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-2 px-4 py-4 bg-gradient-to-b from-muted/50 via-muted/30 to-transparent">
                {weekDays.map((day, idx) => (
                  <div
                    key={day}
                    className={cn(
                      "flex h-9 items-center justify-center text-xs font-extrabold uppercase tracking-widest",
                      idx < 5 ? "text-foreground/60" : "text-primary font-black drop-shadow-sm"
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2.5 px-5 pb-6 pt-3 bg-gradient-to-b from-transparent via-muted/5 to-transparent">
                {days.map((day, dayIdx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <motion.button
                      key={dayIdx}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleDateSelect(day)
                      }}
                      className={cn(
                        "relative flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold",
                        "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-transparent",
                        !isCurrentMonth && "text-muted-foreground/15 opacity-40",
                        isSelected && "text-white shadow-2xl shadow-primary/50 hover:shadow-primary/60",
                        isToday && !isSelected && "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/25 text-primary border-2 border-primary/50 font-extrabold shadow-lg shadow-primary/25",
                        !isSelected && !isToday && isCurrentMonth && "text-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 hover:text-primary hover:shadow-lg hover:shadow-primary/15 hover:border hover:border-primary/30"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selectedDate"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-primary/95 to-primary shadow-2xl pointer-events-none"
                          initial={false}
                          transition={{ type: "spring", stiffness: 600, damping: 35 }}
                        />
                      )}
                      {isToday && !isSelected && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                          initial={false}
                        />
                      )}
                      <span className={cn(
                        "relative z-10",
                        isSelected && "font-extrabold drop-shadow-lg text-white",
                        isToday && !isSelected && "font-extrabold"
                      )}>{format(day, 'd')}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-primary/20 px-5 py-4 bg-gradient-to-b from-muted/30 via-muted/20 to-muted/10 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  className="text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-all rounded-xl px-4 py-2 font-semibold hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToday()
                  }}
                  className="text-sm font-extrabold text-primary hover:bg-primary/20 hover:text-primary transition-all rounded-xl px-5 py-2 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 bg-primary/10 border border-primary/20"
                >
                  Today
                </Button>
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
