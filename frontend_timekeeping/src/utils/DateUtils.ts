export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm:ss";

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export function formatDateTime(datetimeStr: string): string {
    const datetime = new Date(datetimeStr);

    const day = String(datetime.getUTCDate()).padStart(2, '0');
    const month = String(datetime.getUTCMonth() + 1).padStart(2, '0'); 
    const year = datetime.getUTCFullYear();

    const hour = String(datetime.getUTCHours()).padStart(2, '0');
    const minute = String(datetime.getUTCMinutes()).padStart(2, '0');
    const second = String(datetime.getUTCSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}
