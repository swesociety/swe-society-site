"use client"

import * as React from "react"
import { SlCalender } from "react-icons/sl";

import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerDemo(props: { date: Date | undefined; setDate: (date: Date | undefined) => void }) {
    
    const handleSelectDate = (selectedDate: Date | undefined) => {
        props.setDate(selectedDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !props.date && "text-muted-foreground"
                    )}
                >
                    <SlCalender className="mr-2" />
                    {props.date ? format(props.date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={props.date}
                    onSelect={handleSelectDate} // Explicitly pass the handler
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
