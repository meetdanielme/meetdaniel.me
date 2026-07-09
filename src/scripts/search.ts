type SearchItem = {
    title: string;
    description?: string;
    tags?: string[];
    type: string;
    url: string;
};

let searchIndex: SearchItem[] | undefined;

const escapeHtml = (value: string) =>
    value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[character] || character,
    );

const loadIndex = async () => {
    if (searchIndex) return searchIndex;

    searchIndex = await fetch("/search.json")
        .then((response) => response.json() as Promise<SearchItem[]>)
        .catch((): SearchItem[] => []);

    return searchIndex;
};

const initSearch = (root: Element) => {
    const input = root.querySelector<HTMLInputElement>("[data-search-input]");
    const results = root.querySelector<HTMLElement>("[data-search-results]");

    if (!input || !results || root.hasAttribute("data-search-ready")) return;
    root.setAttribute("data-search-ready", "true");

    const clearResults = () => {
        results.hidden = true;
        results.innerHTML = "";
    };

    const render = (matches: SearchItem[]) => {
        if (!matches.length) {
            results.innerHTML = '<p class="search-empty">No matches yet.</p>';
        } else {
            results.innerHTML = matches
                .slice(0, 6)
                .map(
                    (item) =>
                        `<a class="search-result" href="${escapeHtml(item.url)}"><span>${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title)}</strong>${item.description ? `<small>${escapeHtml(item.description)}</small>` : ""}</a>`,
                )
                .join("");
        }
        results.hidden = false;
    };

    input.addEventListener("input", async () => {
        const query = input.value.trim().toLowerCase();
        if (!query) {
            clearResults();
            return;
        }

        const index = await loadIndex();
        render(
            index.filter((item) =>
                [item.title, item.description, ...(item.tags || [])]
                    .join(" ")
                    .toLowerCase()
                    .includes(query),
            ),
        );
    });

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        input.value = "";
        clearResults();
    });
};

document
    .querySelectorAll("[data-search-root]")
    .forEach((root) => initSearch(root));
