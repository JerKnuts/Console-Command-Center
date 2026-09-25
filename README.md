# Console Command Center

Console Command Center is an in-game console command interface for **Starfield**.

Instead of manually opening the developer console and typing commands, Console Command Center provides a searchable, controller-friendly menu with descriptions, parameters, warnings, favorites, recent commands, and command history.

The mod uses a native SFSE plugin to execute Starfield console commands directly from an OSF UI interface.

## Project Status

**Current development version: v0.2.7**

Console Command Center is still under active development and testing.

The native command execution backend is working in-game. The current command library is being tested command-by-command before release.

Some commands may affect achievements, progression, quests, save-game state, NPCs, or world objects.

Commands are classified as:

- **Normal** - Generally straightforward commands with predictable effects.
- **Caution** - Commands that may modify gameplay state or require careful input.
- **Danger** - Commands that may significantly alter quests, actors, objects, or save-game state.

Every command requires confirmation before execution.

## Features

- Native Starfield console command execution
- Searchable command library
- Category browsing
- Recent commands
- Favorites
- Custom console commands
- Command history / activity log
- Parameter inputs for Form IDs, amounts, values, Ref IDs, and other command arguments
- Confirmation before every execution
- Caution and Danger warnings
- Mouse, keyboard, and controller-friendly interface
- Compact Starfield-inspired UI
- OSF UI integration

## Command Library

The command library is being curated and tested rather than populated with every known developer command.

The goal is to include commands that are:

- Useful
- Understandable
- Documented
- Practical to use from a menu
- Reasonably testable

The current catalog and verification status can be found in:

[`COMMAND_CATALOG.md`](COMMAND_CATALOG.md)

Community command suggestions will also be considered as development continues.

## Architecture

Console Command Center uses:

- **SFSE**
- **CommonLibSF**
- **OSF UI**
- A native `ConsoleCommandCenter.dll`

Command execution follows this path:

```text
Console Command Center UI
        ↓
OSF UI native bridge
        ↓
ConsoleCommandCenter.dll
        ↓
Starfield native console executor
        ↓
Console command