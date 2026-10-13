# Third-party notices and corresponding source

Console Command Center's native plugin links against **CommonLibSF**.

- Project: CommonLibSF
- Source: https://github.com/libxse/commonlibsf
- Pinned revision: `e1096784d5cb3263953f6e2ceeed1f12c2a14ebc`
- License: GPL-3.0-or-later with the Modding Exception and GPL-3.0 Linking Exception (with Corresponding Source)

The exact dependency source can be restored from a Console Command Center source checkout with:

```powershell
npm run setup:deps
```

That command clones the repository, checks out the pinned revision, and restores its recursive submodules. The pin lives in `native/setup-deps.mjs` so a released binary can be matched to its dependency source.

The full GPL text is included in `LICENSE`, and the additional CommonLibSF terms are included in `EXCEPTIONS`.

## OSF UI SDK declarations

CCC includes the official OSF UI 2.0 native header (`native/include/OSFUI.h`) and browser declarations (`src/osfui.d.ts`) from [ozooma10/osf-ui](https://github.com/ozooma10/osf-ui), revision `c3d20db7e6549677f2426f9cf160d34abb8e9589`.

- Project: OSF UI
- License: GPL-3.0
- Included files are declarations used to compile and type-check CCC; OSF UI remains a separate required mod.

## Starfield console-command reference

The generated Untested engine-command library is derived from the game-help-based
[Starfield SFSE console-command list](https://gist.github.com/eacpereira/25f00410b1940d04a24f8a49b0b1bf44).
Console Command Center preserves these entries as unverified reference data; inclusion does not mean that a command is safe, supported by the current game runtime, or known to CCC's maintainers.

## zlib

The native plugin statically links zlib 1.3.2 to read compressed QUST records. Xmake restores the pinned package during configuration. Source: https://github.com/madler/zlib/tree/v1.3.2

```text
Copyright (C) 1995-2026 Jean-loup Gailly and Mark Adler

  This software is provided 'as-is', without any express or implied
  warranty.  In no event will the authors be held liable for any damages
  arising from the use of this software.

  Permission is granted to anyone to use this software for any purpose,
  including commercial applications, and to alter it and redistribute it
  freely, subject to the following restrictions:

  1. The origin of this software must not be misrepresented; you must not
     claim that you wrote the original software. If you use this software
     in a product, an acknowledgment in the product documentation would be
     appreciated but is not required.
  2. Altered source versions must be plainly marked as such, and must not be
     misrepresented as being the original software.
  3. This notice may not be removed or altered from any source distribution.

  Jean-loup Gailly        Mark Adler
  jloup@gzip.org          madler@alumni.caltech.edu


  The data format used by the zlib library is described by RFCs (Request for
  Comments) 1950 to 1952 at https://datatracker.ietf.org/doc/html/rfc1950
  (zlib format), rfc1951 (deflate format) and rfc1952 (gzip format).
```

## Game Settings reference data

The Settings catalog was imported from the supplied Starfield Game Settings Database 1.1 workbook, published at [Starfield Game Settings Database](https://www.nexusmods.com/starfield/mods/18443). The workbook itself is not included. Values describe reference engine/master data, not the active modded game state. The engine-command reference has also been reconciled with user-supplied in-game Help output.
