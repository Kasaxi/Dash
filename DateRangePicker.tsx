
"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { ptBR } from 'date-fns/locale'; // Import Brazilian Portuguese locale
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    onDateChange?: (dateRange: DateRange | undefined) => void;
    initialDateRange?: DateRange;
}

export function DateRangePicker({ className, onDateChange, initialDateRange }: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialDateRange || {
    from: addDays(new Date(), -7), // Default to last 7 days
    to: new Date(),
  });
  const [preset, setPreset] = React.useState<string>("last7"); // Default preset

  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(date);
    }
  }, [date, onDateChange]);

  const handlePresetChange = (value: string) => {
    setPreset(value);
    const now = new Date();
    let fromDate: Date | undefined;
    let toDate: Date | undefined = now;

    switch (value) {
      case "today":
        fromDate = now;
        break;
      case "yesterday":
        fromDate = addDays(now, -1);
        toDate = addDays(now, -1);
        break;
      case "last7":
        fromDate = addDays(now, -7);
        break;
      case "last30":
        fromDate = addDays(now, -30);
        break;
      case "thisMonth":
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "lastMonth":
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      default:
        fromDate = undefined;
        toDate = undefined;
    }
    setDate({ from: fromDate, to: toDate });
  };

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
      setDate(selectedDate);
      // If a custom range is selected, clear the preset
      if (selectedDate) {
          setPreset("custom");
      }
  }

  return (
    <div className={cn("grid gap-2 md:flex md:items-center", className)}>
        <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last7">Últimos 7 dias</SelectItem>
                <SelectItem value="last30">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
        </Select>
        <Popover>
            <PopoverTrigger asChild>
            <Button
                id="date"
                variant={"outline"}
                className={cn(
                "w-full md:w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                date.to ? (
                    <>
                    {format(date.from, "dd/MM/y", { locale: ptBR })} -{" "}
                    {format(date.to, "dd/MM/y", { locale: ptBR })}
                    </>
                ) : (
                    format(date.from, "dd/MM/y", { locale: ptBR })
                )
                ) : (
                <span>Selecione as datas</span>
                )}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR} // Use Brazilian Portuguese locale
            />
            </PopoverContent>
        </Popover>
    </div>
  )
}

