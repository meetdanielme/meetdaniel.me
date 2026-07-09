const minuteMs = 60 * 1000;
const hourMs = 60 * minuteMs;
const dayMs = 24 * hourMs;
const yearMs = 365 * dayMs;

const formatFullDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const formatRelativeTime = (date: Date) => {
    const elapsedMs = Math.max(0, Date.now() - date.valueOf());

    if (elapsedMs >= yearMs) {
        return formatFullDate(date);
    }

    if (elapsedMs >= dayMs) {
        return `${Math.floor(elapsedMs / dayMs)}d`;
    }

    if (elapsedMs >= hourMs) {
        return `${Math.floor(elapsedMs / hourMs)}h`;
    }

    return `${Math.max(1, Math.floor(elapsedMs / minuteMs))}m`;
};

const updateRightNowTimes = () => {
    document.querySelectorAll<HTMLElement>("[data-right-now-time]").forEach(
        (element) => {
            const value = element.dataset.rightNowTime;
            if (!value) return;

            const date = new Date(value);
            if (Number.isNaN(date.valueOf())) return;

            element.textContent = formatRelativeTime(date);
        },
    );
};

updateRightNowTimes();
window.setInterval(updateRightNowTimes, minuteMs);

document.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    document
        .querySelectorAll<HTMLDetailsElement>(".right-now-author-menu[open]")
        .forEach((details) => {
            if (!details.contains(target)) {
                details.open = false;
            }
        });
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    document
        .querySelectorAll<HTMLDetailsElement>(".right-now-author-menu[open]")
        .forEach((details) => {
            details.open = false;
        });
});
