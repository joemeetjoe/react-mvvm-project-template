// src/infrastructure/utils/dateUtils.ts
import { format } from "date-fns";

/**
 * Formats a date into a relative time string
 * - Today: Shows time (e.g., "2:30 PM")
 * - Yesterday: Shows "Yesterday"
 * - Older: Shows date (e.g., "Apr 28")
 */
export const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date > today) {
        return format(date, 'h:mm a');
    } else if (date > yesterday) {
        return 'Yesterday';
    } else {
        return format(date, 'MMM d');
    }
};


type DurationInput = number | Date | { start: Date | number; end?: Date | number };

/**
 * Formats duration to human-readable format
 * Accepts seconds, Date objects, or timestamp ui
 * @param input - Seconds, Date, or ui object with start/end times
 * @returns Formatted string (e.g., "2m 15s", "45s", or "Missed" for 0)
 */
export const formatDuration = (input: DurationInput): string => {
    let seconds: number;

    if (typeof input === 'number') {
        // Direct seconds input
        seconds = input;
    } else if (input instanceof Date) {
        // Single Date - duration from that time to now
        seconds = Math.floor((Date.now() - input.getTime()) / 1000);
    } else {
        // Config object with start and end
        const start = input.start instanceof Date
            ? input.start.getTime()
            : input.start;
        const end = input.end
            ? (input.end instanceof Date ? input.end.getTime() : input.end)
            : Date.now();
        seconds = Math.floor((end - start) / 1000);
    }

    if (seconds === 0) return "Missed";

    const absSeconds = Math.abs(seconds);
    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = absSeconds % 60;

    if (minutes === 0) {
        return `${remainingSeconds}s`;
    } else {
        return `${minutes}m ${remainingSeconds}s`;
    }
};

/**
 * Formats a date into a full timestamp
 * @param date - Date to format
 * @param formatString - date-fns format string (default: "MMM d, yyyy 'at' h:mm a")
 */
export const formatFullTimestamp = (
    date: Date,
    formatString: string = "MMM d, yyyy 'at' h:mm a"
): string => {
    return format(date, formatString);
};
