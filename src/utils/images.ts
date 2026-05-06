const localPathPattern = /^\.{0,2}\//;

const normaliseLocalImage = (src: string) => {
    const cleanSrc = src.trim().replace(/^["']|["']$/g, "").split(/[?#]/)[0];

    if (!cleanSrc || cleanSrc.startsWith("http") || cleanSrc.startsWith("//")) {
        return undefined;
    }

    if (cleanSrc.startsWith("/")) {
        return cleanSrc;
    }

    if (!localPathPattern.test(cleanSrc)) {
        return undefined;
    }

    return `/${cleanSrc.replace(/^\.?\.\//, "").replace(/^\.\//, "")}`;
};

export const getFirstMarkdownImage = (body = "") => {
    const markdownImage = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/);
    const markdownSrc = markdownImage ? normaliseLocalImage(markdownImage[1]) : undefined;

    if (markdownSrc) {
        return markdownSrc;
    }

    const htmlImage = body.match(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i);
    return htmlImage ? normaliseLocalImage(htmlImage[1]) : undefined;
};

export const getFeaturedImage = (entry: { data: { heroImage?: string }; body?: string }) =>
    entry.data.heroImage || getFirstMarkdownImage(entry.body);
