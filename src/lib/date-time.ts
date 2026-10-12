const padDatePart = (value: number) => String(value).padStart(2, "0");

export const formatLocalDateInput = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

export const formatLocalDateTimeInput = (date: Date) =>
  `${formatLocalDateInput(date)}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
