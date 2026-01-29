import * as React from "react"
import { createPortal } from "react-dom"
import { Clock } from "lucide-react"
// No date-fns imports needed for time parsing
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface TimePickerProps {
  value?: string // Format: "HH:mm"
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

export function TimePicker({ value, onChange, placeholder = "HH:mm", className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedHour, setSelectedHour] = React.useState<number | null>(null)
  const [selectedMinute, setSelectedMinute] = React.useState<number | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const pickerRef = React.useRef<HTMLDivElement>(null)
  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  
  const PADDING = 8

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      try {
        const [hourStr, minuteStr] = value.split(':')
        const hour = parseInt(hourStr, 10)
        const minute = parseInt(minuteStr, 10)
        if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
          setSelectedHour(hour)
          setSelectedMinute(minute)
        }
      } catch {
        // Invalid format, ignore
      }
    } else {
      setSelectedHour(null)
      setSelectedMinute(null)
    }
  }, [value])

  // Update position when open
  React.useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && pickerRef.current) {
        const inputRect = inputRef.current.getBoundingClientRect()
        const pickerRect = pickerRef.current.getBoundingClientRect()
        
        const scrollY = window.scrollY || window.pageYOffset
        const scrollX = window.scrollX || window.pageXOffset
        
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        const PICKER_WIDTH = 280
        const PICKER_HEIGHT = 320
        
        // Vertical positioning
        let top: number
        const spaceBelow = viewportHeight - inputRect.bottom
        const spaceAbove = inputRect.top
        
        if (spaceBelow >= PICKER_HEIGHT + PADDING) {
          top = inputRect.bottom + scrollY + PADDING
        } else if (spaceAbove >= PICKER_HEIGHT + PADDING) {
          top = inputRect.top + scrollY - PICKER_HEIGHT - PADDING
        } else {
          if (spaceBelow > spaceAbove) {
            top = Math.min(
              inputRect.bottom + scrollY + PADDING,
              scrollY + viewportHeight - PICKER_HEIGHT - PADDING
            )
          } else {
            top = Math.max(
              inputRect.top + scrollY - PICKER_HEIGHT - PADDING,
              scrollY + PADDING
            )
          }
        }
        
        // Horizontal positioning
        let left: number
        if (inputRect.left + PICKER_WIDTH <= viewportWidth - PADDING) {
          left = inputRect.left + scrollX
        } else if (inputRect.right - PICKER_WIDTH >= PADDING) {
          left = inputRect.right + scrollX - PICKER_WIDTH
        } else {
          if (PICKER_WIDTH < viewportWidth) {
            left = scrollX + (viewportWidth - PICKER_WIDTH) / 2
          } else {
            left = scrollX + PADDING
          }
        }
        
        left = Math.round(Math.max(PADDING, Math.min(left, scrollX + viewportWidth - PICKER_WIDTH - PADDING)))
        top = Math.round(Math.max(scrollY + PADDING, Math.min(top, scrollY + viewportHeight - PICKER_HEIGHT - PADDING)))
        
        setPosition({ top, left })
      } else if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        const scrollY = window.scrollY || window.pageYOffset
        const scrollX = window.scrollX || window.pageXOffset
        
        const PICKER_WIDTH = 280
        const PICKER_HEIGHT = 320
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let top: number
        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top
        
        if (spaceBelow >= PICKER_HEIGHT + PADDING) {
          top = rect.bottom + scrollY + PADDING
        } else if (spaceAbove >= PICKER_HEIGHT + PADDING) {
          top = rect.top + scrollY - PICKER_HEIGHT - PADDING
        } else {
          if (spaceBelow > spaceAbove) {
            top = Math.min(
              rect.bottom + scrollY + PADDING,
              scrollY + viewportHeight - PICKER_HEIGHT - PADDING
            )
          } else {
            top = Math.max(
              rect.top + scrollY - PICKER_HEIGHT - PADDING,
              scrollY + PADDING
            )
          }
        }
        
        let left: number
        if (rect.left + PICKER_WIDTH <= viewportWidth - PADDING) {
          left = rect.left + scrollX
        } else if (rect.right - PICKER_WIDTH >= PADDING) {
          left = rect.right + scrollX - PICKER_WIDTH
        } else {
          if (PICKER_WIDTH < viewportWidth) {
            left = scrollX + (viewportWidth - PICKER_WIDTH) / 2
          } else {
            left = scrollX + PADDING
          }
        }
        
        left = Math.round(Math.max(PADDING, Math.min(left, scrollX + viewportWidth - PICKER_WIDTH - PADDING)))
        top = Math.round(Math.max(scrollY + PADDING, Math.min(top, scrollY + viewportHeight - PICKER_HEIGHT - PADDING)))
        
        setPosition({ top, left })
      }
    }

    if (isOpen) {
      requestAnimationFrame(() => {
        updatePosition()
      })
      
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      const timeoutId = setTimeout(updatePosition, 0)
      
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [isOpen])

  // Scroll to selected values when picker opens
  React.useEffect(() => {
    if (isOpen && selectedHour !== null && hourScrollRef.current) {
      const hourElement = hourScrollRef.current.querySelector(`[data-hour="${selectedHour}"]`)
      if (hourElement) {
        hourElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [isOpen, selectedHour])

  React.useEffect(() => {
    if (isOpen && selectedMinute !== null && minuteScrollRef.current) {
      const minuteElement = minuteScrollRef.current.querySelector(`[data-minute="${selectedMinute}"]`)
      if (minuteElement) {
        minuteElement.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [isOpen, selectedMinute])

  // Handle click outside
  React.useEffect(() => {
    const handlePointerOutside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!target) return
      if (pickerRef.current?.contains(target) || inputRef.current?.contains(target)) return
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

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour)
    if (selectedMinute !== null) {
      const timeString = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
      onChange?.(timeString)
    }
  }

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute)
    if (selectedHour !== null) {
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      onChange?.(timeString)
      setIsOpen(false)
    }
  }

  const handleOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsOpen(true)
  }

  const displayValue = value || ''

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
        <Clock 
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
                data-time-picker-root
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-sm pointer-events-none"
                aria-hidden
              />
              <motion.div
                ref={pickerRef}
                data-time-picker-root
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="fixed z-[9999] w-[300px] rounded-3xl border border-primary/20 bg-card shadow-2xl overflow-hidden backdrop-blur-xl bg-card/98 pointer-events-auto"
                style={{
                  top: `${Math.round(position.top)}px`,
                  left: `${Math.round(position.left)}px`,
                  maxHeight: `calc(100vh - ${PADDING * 2}px)`,
                  maxWidth: `calc(100vw - ${PADDING * 2}px)`,
                }}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary/15 via-primary/8 to-primary/15 border-b border-primary/20 backdrop-blur-md shadow-lg shadow-primary/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <div className="relative text-center px-4 py-4">
                    <div className="text-base font-extrabold text-foreground tracking-tight">
                      Выберите время
                    </div>
                  </div>
                </div>

                {/* Time picker columns */}
                <div className="flex h-[280px] overflow-hidden bg-gradient-to-b from-transparent via-muted/5 to-transparent">
                  {/* Hours column */}
                  <div className="flex-1 border-r border-primary/20">
                    <div className="text-center py-3 text-xs font-extrabold text-primary/80 uppercase tracking-widest border-b border-primary/20 bg-gradient-to-b from-muted/40 to-muted/20">
                      Часы
                    </div>
                    <div
                      ref={hourScrollRef}
                      className="h-[244px] overflow-y-auto scroll-smooth overscroll-contain"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(var(--primary), 0.3) transparent',
                      }}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="py-[100px]">
                        {HOURS.map((hour) => {
                          const isSelected = selectedHour === hour
                          return (
                            <motion.button
                              key={hour}
                              data-hour={hour}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleHourSelect(hour)
                              }}
                              className={cn(
                                "w-full py-3.5 text-center text-sm font-bold transition-all duration-300 rounded-lg mx-1",
                                "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2",
                                isSelected
                                  ? "bg-gradient-to-br from-primary via-primary/95 to-primary text-white shadow-xl shadow-primary/50 scale-110"
                                  : "text-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 hover:text-primary hover:shadow-md hover:shadow-primary/15"
                              )}
                            >
                              {hour.toString().padStart(2, '0')}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Minutes column */}
                  <div className="flex-1">
                    <div className="text-center py-3 text-xs font-extrabold text-primary/80 uppercase tracking-widest border-b border-primary/20 bg-gradient-to-b from-muted/40 to-muted/20">
                      Минуты
                    </div>
                    <div
                      ref={minuteScrollRef}
                      className="h-[244px] overflow-y-auto scroll-smooth overscroll-contain"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(var(--primary), 0.3) transparent',
                      }}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="py-[100px]">
                        {MINUTES.map((minute) => {
                          const isSelected = selectedMinute === minute
                          return (
                            <motion.button
                              key={minute}
                              data-minute={minute}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleMinuteSelect(minute)
                              }}
                              className={cn(
                                "w-full py-3.5 text-center text-sm font-bold transition-all duration-300 rounded-lg mx-1",
                                "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2",
                                isSelected
                                  ? "bg-gradient-to-br from-primary via-primary/95 to-primary text-white shadow-xl shadow-primary/50 scale-110"
                                  : "text-foreground hover:bg-gradient-to-br hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 hover:text-primary hover:shadow-md hover:shadow-primary/15"
                              )}
                            >
                              {minute.toString().padStart(2, '0')}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center border-t border-primary/20 px-4 py-4 bg-gradient-to-b from-muted/30 via-muted/20 to-muted/10 backdrop-blur-sm">
                  <div className={cn(
                    "text-base font-extrabold px-4 py-2 rounded-xl transition-all duration-300",
                    selectedHour !== null && selectedMinute !== null
                      ? "text-primary bg-primary/10 border border-primary/20 shadow-md"
                      : "text-muted-foreground"
                  )}>
                    {selectedHour !== null && selectedMinute !== null
                      ? `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
                      : 'Select time'}
                  </div>
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
