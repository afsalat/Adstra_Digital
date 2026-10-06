"""
Demo data for the floating client rail in Social Management.

    python manage.py shell -c "exec(open('seed_demo_client_logos.py').read())"            # seed
    set DEMO_LOGOS_REMOVE=1 && python manage.py shell -c "exec(open('seed_demo_client_logos.py').read())"  # undo

Seeding writes SVG logos to adstra-next/public/demo-logos/, gives the existing
clients a logo, and adds extra demo clients (slug prefix "demo-") so the rail can
be tested with many companies. Undo removes the demo clients and clears any
logo_url that points at /demo-logos/.
"""
import os
from pathlib import Path

from apis.social.models import SocialClientProfile

# Run from backend/ (exec() has no reliable __file__)
LOGO_DIR = Path.cwd().parent / "adstra-next" / "public" / "demo-logos"
URL_PREFIX = "/demo-logos/"

# Glyphs drawn on a 64x64 canvas, centred
GLYPHS = {
    "chip": '<rect x="20" y="20" width="24" height="24" rx="4" fill="none" stroke="#fff" stroke-width="4"/>'
            '<path d="M26 14v6M32 14v6M38 14v6M26 44v6M32 44v6M38 44v6M14 26h6M14 32h6M14 38h6M44 26h6M44 32h6M44 38h6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
    "cup": '<path d="M18 26h24v8a12 12 0 0 1-24 0z" fill="#fff"/><path d="M42 28h3a5 5 0 0 1 0 10h-4" fill="none" stroke="#fff" stroke-width="3"/>'
           '<path d="M24 14c0 4 4 4 4 8M32 14c0 4 4 4 4 8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
    "drop": '<path d="M32 12c8 11 14 18 14 26a14 14 0 0 1-28 0c0-8 6-15 14-26z" fill="#fff"/><circle cx="27" cy="38" r="4" fill="currentColor" opacity=".35"/>',
    "bolt": '<path d="M36 10L18 36h12l-4 18 20-28H34z" fill="#fff"/>',
    "leaf": '<path d="M16 46C16 24 30 16 48 16c0 20-10 32-30 32" fill="#fff"/><path d="M18 46c8-10 16-16 24-22" stroke="currentColor" stroke-width="2.5" opacity=".4"/>',
    "wave": '<path d="M10 30c6-6 10-6 16 0s10 6 16 0 10-6 16 0M10 40c6-6 10-6 16 0s10 6 16 0 10-6 16 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>',
    "star": '<path d="M32 12l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#fff"/>',
    "home": '<path d="M14 32L32 16l18 16" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M20 30v18h24V30" fill="#fff"/>',
    "ring": '<circle cx="32" cy="32" r="16" fill="none" stroke="#fff" stroke-width="6"/><circle cx="32" cy="32" r="5" fill="#fff"/>',
    "mountain": '<path d="M8 48l16-24 10 14 6-8 16 18z" fill="#fff"/><circle cx="44" cy="18" r="5" fill="#fff"/>',
    "heart": '<path d="M32 48S14 37 14 25a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23z" fill="#fff"/>',
    "plane": '<path d="M10 34l44-18-12 36-8-14z" fill="#fff"/><path d="M34 38l20-22" stroke="currentColor" stroke-width="2" opacity=".4"/>',
    "cube": '<path d="M32 12l18 10v20L32 52 14 42V22z" fill="#fff"/><path d="M14 22l18 10 18-10M32 32v20" stroke="currentColor" stroke-width="2.5" fill="none" opacity=".45"/>',
    "dumbbell": '<rect x="10" y="24" width="8" height="16" rx="2" fill="#fff"/><rect x="46" y="24" width="8" height="16" rx="2" fill="#fff"/>'
                '<rect x="18" y="28" width="5" height="8" fill="#fff"/><rect x="41" y="28" width="5" height="8" fill="#fff"/><rect x="23" y="30" width="18" height="4" fill="#fff"/>',
    "book": '<path d="M12 18h16a4 4 0 0 1 4 4v26a4 4 0 0 0-4-4H12zM52 18H36a4 4 0 0 0-4 4v26a4 4 0 0 1 4-4h16z" fill="#fff"/>',
    "paw": '<ellipse cx="32" cy="40" rx="10" ry="8" fill="#fff"/><circle cx="20" cy="28" r="4" fill="#fff"/><circle cx="27" cy="20" r="4" fill="#fff"/><circle cx="37" cy="20" r="4" fill="#fff"/><circle cx="44" cy="28" r="4" fill="#fff"/>',
}

# Existing clients by name -> (file, glyph, colour a, colour b)
EXISTING = {
    "ABC Technologies": ("abc-technologies", "chip", "#2563eb", "#7c3aed"),
    "Coastal Cafe": ("coastal-cafe", "cup", "#0ea5e9", "#0369a1"),
    "GlowUp Skin Clinic": ("glowup-skin", "drop", "#ec4899", "#f97316"),
    "UrbanFit Gym": ("urbanfit-gym", "dumbbell", "#10b981", "#047857"),
}

# Extra demo clients: (name, glyph, colour a, colour b, industry)
DEMO = [
    ("Voltix Energy", "bolt", "#f59e0b", "#dc2626", "Energy"),
    ("GreenLeaf Organics", "leaf", "#22c55e", "#15803d", "Food & Grocery"),
    ("BlueWave Travels", "wave", "#06b6d4", "#2563eb", "Travel"),
    ("Nova Star Jewels", "star", "#a855f7", "#db2777", "Jewellery"),
    ("Keystone Realty", "home", "#64748b", "#0f172a", "Real Estate"),
    ("Orbit Media Labs", "ring", "#6366f1", "#0ea5e9", "Media"),
    ("Summit Adventures", "mountain", "#0d9488", "#1e3a8a", "Outdoor"),
    ("CarePlus Hospital", "heart", "#ef4444", "#be123c", "Healthcare"),
    ("SkyJet Logistics", "plane", "#3b82f6", "#1d4ed8", "Logistics"),
    ("Cubix Interiors", "cube", "#f97316", "#b45309", "Interiors"),
    ("BrightPath Academy", "book", "#8b5cf6", "#4338ca", "Education"),
    ("Happy Paws Pet Care", "paw", "#eab308", "#ea580c", "Pet Care"),
]


def svg(glyph, a, b):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" color="{b}">'
        f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        f'<stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient></defs>'
        f'<rect width="64" height="64" fill="url(#g)"/>{GLYPHS[glyph]}</svg>'
    )


def write_logo(file, glyph, a, b):
    LOGO_DIR.mkdir(parents=True, exist_ok=True)
    (LOGO_DIR / f"{file}.svg").write_text(svg(glyph, a, b), encoding="utf-8")
    return f"{URL_PREFIX}{file}.svg"


def seed():
    for name, (file, glyph, a, b) in EXISTING.items():
        url = write_logo(file, glyph, a, b)
        n = SocialClientProfile.objects.filter(name=name, logo_url="").update(logo_url=url)
        print(f"{'logo set' if n else 'skipped (missing or has logo)'}: {name}")

    for name, glyph, a, b, industry in DEMO:
        slug = "demo-" + name.lower().replace(" ", "-")
        url = write_logo(slug, glyph, a, b)
        _, created = SocialClientProfile.objects.update_or_create(
            slug=slug,
            defaults={"name": name, "logo_url": url, "primary_color": a, "secondary_color": b, "industry": industry},
        )
        print(f"{'created' if created else 'updated'}: {name}")


def remove():
    n, _ = SocialClientProfile.objects.filter(slug__startswith="demo-").delete()
    print(f"deleted {n} demo rows")
    m = SocialClientProfile.objects.filter(logo_url__startswith=URL_PREFIX).update(logo_url="")
    print(f"cleared {m} demo logos")


if os.environ.get("DEMO_LOGOS_REMOVE"):
    remove()
else:
    seed()
