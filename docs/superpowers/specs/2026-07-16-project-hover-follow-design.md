# Project Hover Label Follow Design

## Goal

Restore the original Project card behavior: `OPEN / watch / see case` appears beside the pointer while the pointer moves across a project image. It must not remain fixed in the top-right corner.

## Interaction

- Each `.project-card` listens for `pointermove` from mouse or pen input.
- The label is positioned 14 pixels to the right and below the pointer.
- Its position is clamped inside the card so the label never clips outside the image.
- Pointer exit hides the label through the existing hover state.
- Keyboard focus keeps an accessible fallback position at the center of the card.
- Touch input does not create a persistent hover label.

## Implementation

- `assets/site.js` calculates pointer coordinates relative to each card and writes CSS custom properties.
- `assets/styles.css` reads the custom properties for `left` and `top` instead of fixed `right` and `top` values.
- Existing project filtering, image zoom, label content, and reduced-motion behavior remain unchanged.

## Testing

- Add a browser regression test that moves the pointer to two locations inside a project card and confirms the label position changes.
- Confirm the label remains within the card near its right and bottom edges.
- Run the complete site test suite and production build.

