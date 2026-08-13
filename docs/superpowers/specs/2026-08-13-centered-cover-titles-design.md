# Centered Cover Titles Design

## Goal

Display each project's English title over its cover image in white, centered horizontally and vertically, across the home page and Projects listing.

## Scope

- Add the project title to every home-page work panel.
- Reuse the existing project title markup on every Projects listing card.
- Keep titles visible at rest and during hover or keyboard focus.
- Do not overlay titles on project detail video or poster media.
- Preserve existing links, routes, image proportions, filters, hover zoom, accessibility labels, and project metadata.

## Visual Treatment

- Center titles with absolute positioning over the full cover.
- Use white, bold, sans-serif text with responsive sizing.
- Allow long titles to wrap to at most two centered lines within safe horizontal padding.
- Add a restrained dark text shadow for contrast on light imagery; do not add a full-card dark overlay.
- Keep the title above the image and below any interactive hover affordance.
- On placeholder covers, replace the existing bottom-aligned black caption with the same centered white treatment for consistency.

## Responsive Behavior

- Desktop cards use a larger fluid title size based on viewport width.
- Mobile cards use a smaller fluid size with at least 16px side padding.
- Titles remain centered and legible without changing card aspect ratios.

## Accessibility

- Retain descriptive image alt text and link aria labels.
- Keep the visible title as real text, not generated CSS content.
- Do not make the title intercept pointer input.
- Preserve existing keyboard focus behavior.

## Implementation

- Update `renderHomeProject` so every home work panel renders a title element.
- Update `assets/styles.css` to style home-panel and project-card title overlays consistently.
- Keep `renderProjectCard` title data unchanged except where class structure is needed for shared styling.
- Rebuild generated HTML pages through the existing build script.

## Verification

- Add regression checks that every rendered home panel and Projects card exposes its project title.
- Verify generated home and Projects pages contain visible title markup.
- Run the complete project test suite and `git diff --check`.
- Visually inspect representative light, dark, short-title, long-title, desktop, and mobile covers.
