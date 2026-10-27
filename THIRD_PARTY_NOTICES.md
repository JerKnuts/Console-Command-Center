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

## OSF Settings SDK declarations

CCC includes `native/include/OSFSettings.h` from the OSF UI SDK at the same pinned revision above. It declares the separate [OSF Settings](https://github.com/ozooma10/osf-settings) service API (GPL-3.0). OSF Settings remains a separate required mod; its DLL is not bundled.

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

## bcdec

The preview DDS decoder includes the unmodified bcdec v0.985 header by Sergii Kudlai, under its MIT license option. Source: https://github.com/iOrange/bcdec. The header is native/third_party/bcdec.h and the full notice is native/third_party/LICENSE-bcdec.txt. Runtime packages also include licenses/bcdec.txt. Upstream header SHA256: 134520764d96f70a27db814173616c89ad85db95fbd3328417c7a8c77e7ca189.

## In-memory slate audio

ww2ogg-ts 0.2.0 by Warths (https://github.com/Warths/ww2ogg-ts), based on ww2ogg by hcs (https://github.com/hcs64/ww2ogg), converts installed Wwise Vorbis data using its packed codebooks. The browser Buffer implementation is buffer 6.0.3 by Feross Aboukhadijeh and contributors. Their dependencies base64-js and ieee754 are also included in the browser bundle. No Starfield voice assets are redistributed.

### ww2ogg-ts

```text
BSD 3-Clause License

Copyright (c) 2026, ww2ogg-ts contributors.
Portions copyright (c) 2010-2016, Adam Gashlin (hcs).
Portions copyright (c) Xiph.Org Foundation.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

```

### buffer

```text
The MIT License (MIT)

Copyright (c) Feross Aboukhadijeh, and other contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

```

### base64-js

```text
The MIT License (MIT)

Copyright (c) 2014 Jameson Little

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

```

### ieee754

```text
Copyright 2008 Fair Oaks Labs, Inc.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

```
