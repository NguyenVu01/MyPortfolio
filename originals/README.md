# Original source files

Nothing in this folder is loaded by the site. These are the files you supplied, kept
because the processed versions were derived from them and cannot be reversed.

**Safe to delete the whole folder** if you have copies elsewhere. Doing so removes about
6.4 MB and leaves the site untouched:

```bash
rm -rf originals
```

If you deploy from this directory, delete it first or exclude it, otherwise 6.4 MB of
unused files ship to your host.

| Folder | What it is | What was made from it |
| --- | --- | --- |
| `design-mockups/` | the three reference designs you sent at the start | nothing, the built site superseded them |
| `client-logos/` | your seven original bank logo files | `Assets/clients/*.png`, backgrounds stripped for the dark theme |
| `employer-logos/` | Deloitte and EY as supplied | `Assets/logos/deloitte.png` and `ey-mark.png`, recoloured white with brand accents kept |
| `background.png` | the 1.8 MB nebula backdrop | `Assets/background.webp` (38 KB) and `background-sm.webp` (8 KB) |

Keep this folder if you might need to reprocess a logo at a different size or colour,
since the processed PNGs have already had their backgrounds removed and cannot be undone.

`client-logos/` contains two copies of the State Bank of Vietnam seal
(`sbv.jpeg` and `logo-ngan-hang-nha-nuoc-viet-nam.jpg`); they are the same image at the
same dimensions, so only one was ever used.
