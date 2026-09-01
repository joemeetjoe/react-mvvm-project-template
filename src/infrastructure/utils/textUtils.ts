// src/infrastructure/utils/textUtils.ts

/**
 * Gets initials from a full name
 * @param name - Full name (e.g., "John Doe")
 * @returns Initials (e.g., "JD")
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase();
};

/**
 * Truncates text to a specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
};

/**
 * Capitalizes the first letter of each word
 * @param text - Text to capitalize
 * @returns Title-cased text
 */
export const toTitleCase = (text: string): string => {
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Formats a phone number according to the specified format
 * @param phone - Phone number string (e.g., "1234567890")
 * @param format - Format type: "US" | "international" | "dots" | "dashes"
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (
    phone: string,
    format: "US" | "international" | "dots" | "dashes" = "US"
): string => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length !== 10) return phone;

    switch (format) {
        case "US":
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        case "international":
            return `+1 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        case "dots":
            return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
        case "dashes":
            return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        default:
            return phone;
    }
};

/**
 * Highlights search query in text
 * @param text - Text to search in
 * @param query - Search query to highlight
 * @returns Text with highlighted portions (could be used with dangerouslySetInnerHTML or components)
 */
export const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Pluralizes a word based on count
 * @param count - Number to determine plurality
 * @param singular - Singular form of the word
 * @param plural - Plural form (optional, defaults to singular + 's')
 * @returns Pluralized string with count
 */
export const pluralize = (count: number, singular: string, plural?: string): string => {
    const word = count === 1 ? singular : (plural || `${singular}s`);
    return `${count} ${word}`;
};
