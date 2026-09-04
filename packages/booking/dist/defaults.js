export const defaultTheme = {
    accent: "#2563eb",
    accentContrast: "#ffffff",
    surface: "#ffffff",
    surfaceElevated: "#f8fafc",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    danger: "#dc2626",
    success: "#15803d",
    radius: "20px",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    shadow: "0 24px 70px rgba(15, 23, 42, 0.12)"
};
export const defaultLabels = {
    title: "Bestill time",
    subtitle: "Velg tjeneste, dato og tidspunkt som passer deg.",
    today: "I dag",
    back: "Tilbake",
    next: "Neste",
    previous: "Forrige",
    chooseService: "Velg tjeneste",
    choosePlan: "Velg plan",
    chooseStaff: "Velg medarbeider",
    chooseDate: "Velg dato",
    chooseTime: "Velg tidspunkt",
    chooseLocation: "Velg lokasjon",
    yourDetails: "Dine opplysninger",
    confirm: "Bekreft bestilling",
    noTimes: "Ingen ledige tider denne dagen.",
    closed: "Stengt",
    fullyBooked: "Fullbooket",
    bookingSuccess: "Bestillingen er registrert!"
};
export const defaultConfiguration = {
    locale: "nb-NO",
    timeZone: "Europe/Oslo",
    currency: "NOK",
    weekStartsOn: 1,
    slotIntervalMinutes: 30,
    minNoticeMinutes: 120,
    bookingWindowDays: 120,
    defaultView: "month",
    layout: "full",
    animations: true,
    showWeekNumbers: false,
    showPlans: true,
    showStaff: true,
    showCategories: true,
    locations: [],
    requirePhone: false,
    allowPastDates: false,
    autoConfirm: true,
    theme: defaultTheme,
    labels: defaultLabels,
    customFields: []
};
export const defaultSchedule = {
    weeklyHours: {
        1: [{ start: "09:00", end: "16:00" }],
        2: [{ start: "09:00", end: "16:00" }],
        3: [{ start: "09:00", end: "16:00" }],
        4: [{ start: "09:00", end: "16:00" }],
        5: [{ start: "09:00", end: "15:00" }]
    },
    overrides: []
};
export function mergeConfiguration(configuration) {
    return {
        ...defaultConfiguration,
        ...configuration,
        theme: { ...defaultTheme, ...configuration?.theme },
        labels: { ...defaultLabels, ...configuration?.labels },
        customFields: configuration?.customFields ?? []
    };
}
//# sourceMappingURL=defaults.js.map