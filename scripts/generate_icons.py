#!/usr/bin/env python3
"""Regenerate every app icon from the master logo at public/app-logo.png.

The master is expected to be a rounded-square logo (transparent padding is
fine — it gets cropped off). Outputs (all overwritten in place):
  public/logo.png
  src-tauri/icons/*.png, icon.ico, icon.icns
  src-tauri/icons/Square*Logo.png + StoreLogo.png (Microsoft Store tiles, opaque)
  src-tauri/icons/ios/AppIcon-*.png               (opaque, white matte)
  src-tauri/icons/android/mipmap-*/ic_launcher*.png

Requires Pillow:  python3 -m pip install pillow
Run from anywhere: python3 scripts/generate_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "src-tauri" / "icons"
PUBLIC = ROOT / "public"
MASTER_ART = PUBLIC / "app-logo.png"

MASTER = 1024
CORNER = 0.221  # master art's baked-in corner radius as a fraction of its size


def rounded_mask(size: int, radius: int) -> Image.Image:
    ss = 4  # supersample for smooth edges
    mask = Image.new("L", (size * ss, size * ss), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [0, 0, size * ss - 1, size * ss - 1], radius=radius * ss, fill=255
    )
    return mask.resize((size, size), Image.LANCZOS)


def circle_mask(size: int) -> Image.Image:
    ss = 4
    mask = Image.new("L", (size * ss, size * ss), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size * ss - 1, size * ss - 1], fill=255)
    return mask.resize((size, size), Image.LANCZOS)


def load_master() -> Image.Image:
    """Master logo cropped to its opaque content and squared to MASTER px."""
    art = Image.open(MASTER_ART).convert("RGBA")
    solid = art.getchannel("A").point(lambda v: 255 if v >= 128 else 0)
    bbox = solid.getbbox()
    if bbox is None:
        raise SystemExit(f"{MASTER_ART} is fully transparent")
    return art.crop(bbox).resize((MASTER, MASTER), Image.LANCZOS)


def full_bleed(rounded: Image.Image) -> Image.Image:
    """Opaque edge-to-edge art: zoom past the rounded corners and re-square.

    The largest axis-aligned square inside a rounded rect of radius r is
    inset by r*(1 - 1/sqrt(2)) per side; cropping there leaves no
    transparent corner pixels.
    """
    inset = round(MASTER * CORNER * (1 - 2 ** -0.5)) + 2  # +2 eats edge fringe
    square = rounded.crop((inset, inset, MASTER - inset, MASTER - inset))
    square = square.resize((MASTER, MASTER), Image.LANCZOS)
    opaque = Image.new("RGBA", square.size, (255, 255, 255, 255))
    opaque.alpha_composite(square)
    return opaque


def main() -> None:
    rounded = load_master()  # transparent rounded corners, as designed
    square = full_bleed(rounded)  # opaque, edge-to-edge

    def scaled(img: Image.Image, size: int) -> Image.Image:
        return img.resize((size, size), Image.LANCZOS)

    # --- Desktop PNGs (transparent rounded corners) -----------------------
    scaled(rounded, 128).save(PUBLIC / "logo.png")
    for name, size in [
        ("32x32.png", 32),
        ("64x64.png", 64),
        ("128x128.png", 128),
        ("128x128@2x.png", 256),
    ]:
        scaled(rounded, size).save(ICONS / name)

    # --- Windows .ico + macOS .icns ---------------------------------------
    scaled(rounded, 256).save(
        ICONS / "icon.ico",
        sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)],
    )
    rounded.save(ICONS / "icon.icns")

    # --- Microsoft Store tiles (opaque, full-bleed) ------------------------
    for name, size in [
        ("StoreLogo.png", 50),
        ("Square30x30Logo.png", 30),
        ("Square44x44Logo.png", 44),
        ("Square71x71Logo.png", 71),
        ("Square89x89Logo.png", 89),
        ("Square107x107Logo.png", 107),
        ("Square142x142Logo.png", 142),
        ("Square150x150Logo.png", 150),
        ("Square284x284Logo.png", 284),
        ("Square310x310Logo.png", 310),
    ]:
        scaled(square, size).save(ICONS / name)

    # --- iOS (Apple rejects transparency: rounded art on a white matte) ----
    ios_dir = ICONS / "ios"
    ios_sizes = {
        "AppIcon-20x20@1x.png": 20,
        "AppIcon-20x20@2x.png": 40,
        "AppIcon-20x20@2x-1.png": 40,
        "AppIcon-20x20@3x.png": 60,
        "AppIcon-29x29@1x.png": 29,
        "AppIcon-29x29@2x.png": 58,
        "AppIcon-29x29@2x-1.png": 58,
        "AppIcon-29x29@3x.png": 87,
        "AppIcon-40x40@1x.png": 40,
        "AppIcon-40x40@2x.png": 80,
        "AppIcon-40x40@2x-1.png": 80,
        "AppIcon-40x40@3x.png": 120,
        "AppIcon-60x60@2x.png": 120,
        "AppIcon-60x60@3x.png": 180,
        "AppIcon-76x76@1x.png": 76,
        "AppIcon-76x76@2x.png": 152,
        "AppIcon-83.5x83.5@2x.png": 167,
        "AppIcon-512@2x.png": 1024,
    }
    for name, size in ios_sizes.items():
        matte = Image.new("RGBA", (size, size), (255, 255, 255, 255))
        matte.alpha_composite(scaled(rounded, size))
        matte.save(ios_dir / name)

    # --- Android mipmaps ----------------------------------------------------
    # (launcher sizes mirror what `tauri icon` shipped, hdpi's 49px included)
    android = ICONS / "android"
    mipmaps = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (49, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    for folder, (launcher, foreground) in mipmaps.items():
        base = scaled(square, launcher)
        ic = base.copy()
        ic.putalpha(rounded_mask(launcher, int(launcher * 0.245)))
        ic.save(android / folder / "ic_launcher.png")
        ic_round = base.copy()
        ic_round.putalpha(circle_mask(launcher))
        ic_round.save(android / folder / "ic_launcher_round.png")
        scaled(rounded, foreground).save(android / folder / "ic_launcher_foreground.png")

    print("icons regenerated")


if __name__ == "__main__":
    main()
