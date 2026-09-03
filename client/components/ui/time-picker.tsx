"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Clock, X } from "lucide-react"
import * as React from "react"

interface TimePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
    const [selectedHour, setSelectedHour] = React.useState<number>(
        date instanceof Date && !isNaN(date.getTime()) ? date.getHours() : 12
    )
    const [selectedMinute, setSelectedMinute] = React.useState<number>(
        date instanceof Date && !isNaN(date.getTime()) ? date.getMinutes() : 0
    )
    const [period, setPeriod] = React.useState<"AM" | "PM">(
        date instanceof Date && !isNaN(date.getTime()) ? (date.getHours() >= 12 ? "PM" : "AM") : "AM"
    )
    const [open, setOpen] = React.useState(false)

    // Update the date when time changes
    React.useEffect(() => {
        const newDate = date ? new Date(date) : new Date()
        let hours = selectedHour
        if (period === "PM" && hours < 12) hours += 12
        if (period === "AM" && hours === 12) hours = 0

        // Only update if the time actually changed
        if (newDate.getHours() !== hours || newDate.getMinutes() !== selectedMinute) {
            newDate.setHours(hours)
            newDate.setMinutes(selectedMinute)
            setDate(new Date(newDate))
        }
    }, [selectedHour, selectedMinute, period, setDate])

    // Format the time for display
    const formattedTime = React.useMemo(() => {
        if (!date) return ""

        if (!(date instanceof Date) || isNaN(date.getTime())) return ""

        const hours = date.getHours()
        const minutes = date.getMinutes()
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes
        const ampm = hours >= 12 ? "PM" : "AM"

        return `${displayHours}:${displayMinutes} ${ampm}`
    }, [date])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild >
                <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {formattedTime || "Select time"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 max-w-[250px]">
                <div className="p-3">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Select Time</h4>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-6 w-6">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="p-3"><TimeInput
                    selectedHour={selectedHour}
                    setSelectedHour={setSelectedHour}
                    selectedMinute={selectedMinute}
                    setSelectedMinute={setSelectedMinute}
                    period={period}
                    setPeriod={setPeriod}
                /></div>

                {/* <Tabs defaultValue="clock">
                    <div className="flex items-center justify-between px-3 pb-2">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="clock">Clock</TabsTrigger>
                            <TabsTrigger value="input">Input</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="clock" className="p-3">
                        <ClockFace
                            selectedHour={selectedHour}
                            setSelectedHour={setSelectedHour}
                            selectedMinute={selectedMinute}
                            setSelectedMinute={setSelectedMinute}
                            period={period}
                            setPeriod={setPeriod}
                        />
                    </TabsContent>
                    <TabsContent value="input" className="p-3">
                        
                    </TabsContent>
                </Tabs> */}
                <div className="border-t p-3">
                    <Button onClick={() => setOpen(false)} className="w-full">
                        Done
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface ClockFaceProps {
    selectedHour: number
    setSelectedHour: (hour: number) => void
    selectedMinute: number
    setSelectedMinute: (minute: number) => void
    period: "AM" | "PM"
    setPeriod: (period: "AM" | "PM") => void
}

function ClockFace({
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
    period,
    setPeriod,
}: ClockFaceProps) {
    const [mode, setMode] = React.useState<"hour" | "minute">("hour")

    // Convert 24-hour format to 12-hour format for display
    const displayHour = selectedHour > 12 ? selectedHour - 12 : selectedHour === 0 ? 12 : selectedHour

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
                <Button
                    variant={mode === "hour" ? "default" : "outline"}
                    className="text-xl font-semibold h-10 px-3"
                    onClick={() => setMode("hour")}
                >
                    {displayHour}
                </Button>
                <span className="text-xl font-semibold">:</span>
                <Button
                    variant={mode === "minute" ? "default" : "outline"}
                    className="text-xl font-semibold h-10 px-3"
                    onClick={() => setMode("minute")}
                >
                    {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                </Button>
                <div className="flex flex-col ml-2 space-y-1">
                    <Button
                        variant={period === "AM" ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setPeriod("AM")}
                    >
                        AM
                    </Button>
                    <Button
                        variant={period === "PM" ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setPeriod("PM")}
                    >
                        PM
                    </Button>
                </div>
            </div>

            <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full border-2 border-muted" />
                {mode === "hour" ? (
                    <div className="absolute inset-0">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const hour = i + 1
                            const angle = ((hour % 12) / 12) * 360
                            const radian = ((angle - 90) * Math.PI) / 180
                            const radius = 110
                            const left = radius + radius * Math.cos(radian)
                            const top = radius + radius * Math.sin(radian)

                            return (
                                <Button
                                    key={hour}
                                    variant={displayHour === hour ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "absolute w-10 h-10 rounded-full flex items-center justify-center p-0 text-sm font-medium",
                                        displayHour === hour ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                    )}
                                    style={{
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                    onClick={() => {
                                        let newHour = hour
                                        if (period === "PM" && hour !== 12) newHour += 12
                                        if (period === "AM" && hour === 12) newHour = 0
                                        setSelectedHour(newHour)
                                        setMode("minute")
                                    }}
                                >
                                    {hour}
                                </Button>
                            )
                        })}
                        <div
                            className="absolute left-1/2 top-1/2 w-1 bg-primary"
                            style={{
                                height: "40%",
                                transformOrigin: "bottom center",
                                transform: `translate(-50%, 0) rotate(${((displayHour % 12) / 12) * 360 - 90}deg)`,
                            }}
                        >
                            <div className="w-3 h-3 rounded-full bg-primary absolute -top-1.5 -left-1" />
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const minute = i * 5
                            const angle = (minute / 60) * 360
                            const radian = ((angle - 90) * Math.PI) / 180
                            const radius = 110
                            const left = radius + radius * Math.cos(radian)
                            const top = radius + radius * Math.sin(radian)

                            return (
                                <Button
                                    key={minute}
                                    variant={Math.floor(selectedMinute / 5) * 5 === minute ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "absolute w-10 h-10 rounded-full flex items-center justify-center p-0 text-sm font-medium",
                                        Math.floor(selectedMinute / 5) * 5 === minute
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted",
                                    )}
                                    style={{
                                        left: `${left}px`,
                                        top: `${top}px`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                    onClick={() => setSelectedMinute(minute)}
                                >
                                    {minute}
                                </Button>
                            )
                        })}
                        <div
                            className="absolute left-1/2 top-1/2 w-1 bg-primary"
                            style={{
                                height: "45%",
                                transformOrigin: "bottom center",
                                transform: `translate(-50%, 0) rotate(${(selectedMinute / 60) * 360 - 90}deg)`,
                            }}
                        >
                            <div className="w-3 h-3 rounded-full bg-primary absolute -top-1.5 -left-1" />
                        </div>
                    </div>
                )}
                <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
        </div>
    )
}

interface TimeInputProps {
    selectedHour: number
    setSelectedHour: (hour: number) => void
    selectedMinute: number
    setSelectedMinute: (minute: number) => void
    period: "AM" | "PM"
    setPeriod: (period: "AM" | "PM") => void
}

function TimeInput({
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
    period,
    setPeriod,
}: TimeInputProps) {
    // Convert 24-hour format to 12-hour format for display
    const displayHour = selectedHour > 12 ? selectedHour - 12 : selectedHour === 0 ? 12 : selectedHour

    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (isNaN(value)) return
        if (value < 1) return setSelectedHour(period === "AM" ? 0 : 12)
        if (value > 12) return setSelectedHour(period === "AM" ? 12 : 23)

        let newHour = value
        if (period === "PM" && value !== 12) newHour += 12
        if (period === "AM" && value === 12) newHour = 0
        setSelectedHour(newHour)
    }

    const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (isNaN(value)) return
        if (value < 0) return setSelectedMinute(0)
        if (value > 59) return setSelectedMinute(59)
        setSelectedMinute(value)
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="text-sm font-medium">Hour</label>
                    <select
                        value={displayHour}
                        onChange={(e) => handleHourChange({ target: { value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <option key={hour} value={hour}>
                                {hour}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Minute</label>
                    <select
                        value={selectedMinute}
                        onChange={(e) => handleMinuteChange({ target: { value: e.target.value } } as React.ChangeEvent<HTMLInputElement>)}
                        className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="">
                    <label className="text-sm font-medium">Hour</label>
                    <div className="flex items-center justify-between mt-1">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as "AM" | "PM")}
                            className="w-full h-full rounded-md border p-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>

                    </div>

                </div>
            </div>

        </div>
    )
}
