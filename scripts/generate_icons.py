#!/usr/bin/env python3
"""Regenerate every app icon from the master art drawn below.

Outputs (all overwritten in place):
  public/logo.png
  src-tauri/icons/*.png, icon.ico, icon.icns
  src-tauri/icons/Square*Logo.png + StoreLogo.png (Microsoft Store tiles, opaque)
  src-tauri/icons/ios/AppIcon-*.png               (opaque, white matte)
  src-tauri/icons/android/mipmap-*/ic_launcher*.png

Requires Pillow:  python3 -m pip install pillow
Run from anywhere: python3 scripts/generate_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ICONS = ROOT / "src-tauri" / "icons"
PUBLIC = ROOT / "public"

MASTER = 1024
CORNER = 0.227  # rounded-square corner radius as a fraction of the icon size

# Four-corner palette (Google brand hues, softened for the gradient blend)
GREEN = (77, 178, 118)
YELLOW = (246, 192, 50)
RED = (235, 65, 50)
BLUE = (76, 130, 240)


def gradient(size: int) -> Image.Image:
    """Quadrant gradient: green/yellow over red/blue, blended along the midlines."""
    grid = Image.new("RGB", (4, 4))
    for x in range(4):
        for y in range(4):
            if y < 2:
                grid.putpixel((x, y), GREEN if x < 2 else YELLOW)
            else:
                grid.putpixel((x, y), RED if x < 2 else BLUE)
    smooth = grid.resize((size, size), Image.BILINEAR)
    return smooth.filter(ImageFilter.GaussianBlur(size * 0.06))


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


def glyph_mask(size: int) -> Image.Image:
    """White camcorder: rounded body plus a horn on the right."""
    ss = 4
    s = size * ss
    u = s / 1024.0
    cx, cy, k = 521, 518, 1.08  # glyph center and scale in 1024-space

    def sx(v: float) -> float:
        return (cx + (v - cx) * k) * u

    def sy(v: float) -> float:
        return (cy + (v - cy) * k) * u

    mask = Image.new("L", (s, s), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [sx(330), sy(402), sx(596), sy(634)], radius=58 * k * u, fill=255
    )

    # Horn: sharp polygon whose corners are rounded via blur + threshold
    horn = Image.new("L", (s, s), 0)
    ImageDraw.Draw(horn).polygon(
        [(sx(618), sy(480)), (sx(712), sy(412)), (sx(712), sy(624)), (sx(618), sy(556))],
        fill=255,
    )
    horn = horn.filter(ImageFilter.GaussianBlur(int(18 * u))).point(
        lambda v: 255 if v >= 128 else 0
    )
    mask.paste(255, (0, 0), horn)
    return mask.resize((size, size), Image.LANCZOS)


def build_art(size: int = MASTER) -> Image.Image:
    """Full-bleed square art (no corner rounding): gradient, bevel, shadowed glyph."""
    art = gradient(size).convert("RGBA")

    # Subtle vertical bevel: lighter top edge, darker bottom edge
    ramp = Image.new("L", (1, 256))
    for y in range(256):
        ramp.putpixel((0, y), y)
    ramp = ramp.resize((size, size), Image.BILINEAR)
    lighter = Image.alpha_composite(art, Image.new("RGBA", art.size, (255, 255, 255, 22)))
    art = Image.composite(art, lighter, ramp)
    darker = Image.alpha_composite(art, Image.new("RGBA", art.size, (0, 0, 0, 26)))
    art = Image.composite(art, darker, ramp.point(lambda v: 255 - v))

    # Glyph drop shadow, then the white glyph itself
    glyph = glyph_mask(size)
    shadow_alpha = Image.new("L", (size, size), 0)
    shadow_alpha.paste(glyph, (0, int(size * 0.012)))
    shadow_alpha = shadow_alpha.filter(ImageFilter.GaussianBlur(size * 0.022)).point(
        lambda v: int(v * 0.30)
    )
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow.putalpha(shadow_alpha)
    art = Image.alpha_composite(art, shadow)
    art.paste(Image.new("RGBA", (size, size), (255, 255, 255, 255)), (0, 0), glyph)
    return art


def main() -> None:
    square = build_art()  # opaque, edge-to-edge
    rounded = square.copy()
    rounded.putalpha(rounded_mask(MASTER, int(MASTER * CORNER)))

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
