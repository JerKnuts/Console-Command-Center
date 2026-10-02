# Console Command Center v0.3.10 Beta

This version fixes command cards being cropped in the compact two-column layout.

## Expanding command cards

- Removes the forced full-height rule that could make a card exceed its grid row and become clipped by the next group.
- Allows Untested groups to expand around every visible card, input, hint, favorite control, and Execute button.
- Keeps natural equal-height grid rows through normal CSS grid stretching.
- Retains the responsive two-column layout from v0.3.9 and its single-column fallback for narrower windows.

Command behavior and the underlying catalog are unchanged.
