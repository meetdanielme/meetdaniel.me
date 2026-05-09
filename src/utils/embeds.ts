const youtubeUrlPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;

const wordpressEmbedPattern =
    /<div class="wp-block-embed__wrapper">\s*([^<\s]+)\s*<\/div>/gi;

export const hasYouTubeEmbed = (body = "") => {
    const hasStandaloneUrl = body
        .split(/\r?\n/)
        .some((line) => {
            const text = line.trim();
            return text.match(youtubeUrlPattern)?.[0] === text;
        });

    if (hasStandaloneUrl) return true;

    return [...body.matchAll(wordpressEmbedPattern)].some((match) =>
        youtubeUrlPattern.test(match[1] || ""),
    );
};
