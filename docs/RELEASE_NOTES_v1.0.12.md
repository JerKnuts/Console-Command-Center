# Console Command Center v1.0.12

Version 1.0.12 accepts the paired speech-failure override as working and moves it into the established Gameplay category.

## Changes

- **Speech Challenge Failure** now appears in Gameplay beside the established speech-success control.
- **Always Fail** runs `setforcespeechchallengealwaysfail 1`.
- Its stacked **Restore Normal** action runs `setforcespeechchallengealwaysfail 0`.
- The card retains its Caution warning because the override remains active until restored.
- The catalog now contains 148 established command cards and 1,538 WIP cards.

## Validation

- Automated command-catalog and paired-action tests pass.
- OSF UI compatibility validation and production build pass.
- The native plugin builds with the v1.0.12 version string.
