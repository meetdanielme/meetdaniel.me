import re
import shutil
from pathlib import Path

root = Path("meetdaniel.me")
for kind in ["posts", "pages"]:
    for imgdir in (root / kind).glob("*/images"):
        dest = root / "public" / "images" / kind / imgdir.parent.name
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(imgdir, dest)


def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    _, raw, body = text.split("---", 2)
    fm = {}
    current = None
    for line in raw.splitlines():
        if not line.strip():
            continue
        if line.startswith("  - ") and current:
            fm.setdefault(current, []).append(line[4:].strip().strip('"'))
        elif ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"')
            if value:
                fm[key] = value
                current = None
            else:
                fm[key] = []
                current = key
    return fm, body.lstrip()


def quoted(value):
    return '"' + str(value).replace('"', '\\"') + '"'


def write_md(src, dest, kind, year):
    fm, body = parse_frontmatter(src.read_text())
    slug = src.stem
    title = fm.get("title") or slug.replace("-", " ").title()
    date = fm.get("date") or fm.get("pubDate") or "2025-01-01"
    tags = fm.get("tags") or fm.get("categories") or []
    if isinstance(tags, str):
        tags = [tags]
    cover = fm.get("coverImage") or fm.get("heroImage") or ""
    body = re.sub(r"\]\(images/", f"](/images/{kind}/{year}/", body)
    out = "---\n"
    out += f"title: {quoted(title)}\n"
    out += f"description: {quoted(fm.get('description', ''))}\n"
    out += f"pubDate: {date}\n"
    out += f"slug: {quoted(slug)}\n"
    out += "tags:\n" + "".join(f"  - {quoted(t)}\n" for t in tags)
    out += "draft: false\n"
    if cover:
        out += f"heroImage: {quoted(f'/images/{kind}/{year}/{cover}')}\n"
    out += "---\n\n" + body
    dest.write_text(out)


for src in (root / "posts").glob("*/*.md"):
    write_md(src, root / "src/content/blog" / src.name, "posts", src.parent.name)
for src in (root / "pages").glob("*/*.md"):
    write_md(src, root / "src/content/pages" / src.name, "pages", src.parent.name)
