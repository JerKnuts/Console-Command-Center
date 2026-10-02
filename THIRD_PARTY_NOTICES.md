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

## Starfield console-command reference

The generated Untested engine-command library is derived from the game-help-based
[Starfield SFSE console-command list](https://gist.github.com/eacpereira/25f00410b1940d04a24f8a49b0b1bf44).
Console Command Center preserves these entries as unverified reference data; inclusion does not mean that a command is safe, supported by the current game runtime, or known to CCC's maintainers.
