import html
import re
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path("meetdaniel.me")
SITEMAP = "https://meetdaniel.me/sitemap-1.xml"
CONTENT_DIRS = [ROOT / "src/content/blog", ROOT / "src/content/pages"]


def fetch(url):
    req = Request(url, headers={"User-Agent": "meetdaniel-astro-migration/1.0"})
    with urlopen(req, timeout=20) as response:
        return response.read().decode("utf-8", errors="replace")


def extract_description(page):
    patterns = [
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']description["\']',
        r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:description["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, page, re.I | re.S)
        if match:
            value = html.unescape(re.sub(r"\s+", " ", match.group(1))).strip()
            if value and len(value) > 30:
                return value[:220]
    return ""


def markdown_for_slug(slug):
    for directory in CONTENT_DIRS:
        candidate = directory / f"{slug}.md"
        if candidate.exists():
            return candidate
    return None


def current_description(text):
    match = re.search(r'^description:\s*["\']?(.*?)["\']?\s*$', text, re.M)
    return match.group(1).strip() if match else ""


def set_description(path, description):
    text = path.read_text()
    escaped = description.replace('"', '\\"')
    if re.search(r"^description:", text, re.M):
        text = re.sub(
            r"^description:.*$", f'description: "{escaped}"', text, count=1, flags=re.M
        )
    else:
        text = text.replace("\n", f'\ndescription: "{escaped}"\n', 1)
    path.write_text(text)


updated = []
failed = []
try:
    sitemap = fetch(SITEMAP)
    urls = re.findall(r"https://meetdaniel\.me/[^\s<]+", sitemap)
except Exception as exc:
    print(f"Failed to fetch sitemap: {exc}")
    urls = []

for url in urls:
    slug = url.rstrip("/").split("/")[-1] or "index"
    path = markdown_for_slug(slug)
    if not path:
        continue
    text = path.read_text()
    existing = current_description(text)
    if existing and len(existing) > 50:
        continue
    try:
        description = extract_description(fetch(url))
    except Exception as exc:
        failed.append((url, str(exc)))
        continue
    if description:
        set_description(path, description)
        updated.append((url, path.name))
    else:
        failed.append((url, "No usable description metadata found"))

print(f"Updated {len(updated)} files")
for url, name in updated:
    print(f"UPDATED {name} <- {url}")
print(f"Failures {len(failed)}")
for url, reason in failed:
    print(f"FAILED {url}: {reason}")
