# Project and Contact Page Redesign

## Goal

Replace the current Project and Contact page layouts with the supplied `Desktop-04.png` and `Desktop-05.png` compositions while preserving the existing White Pix routes, navigation, copy, accessibility, and Project browsing interactions.

## Design Direction

- Page type: creative studio portfolio redesign.
- Visual language: black-and-white editorial minimalism with large photographic work and generous white space.
- Design dials: variance 6, motion 3, density 3.
- Theme: light throughout both pages, with project photography providing the only major color fields.
- Implementation: semantic HTML and native CSS in the existing static site. No screenshot-only page replacement.

## Project Page

- Preserve `projects.html`, the primary navigation, and the `BROWSE BY` controls.
- Keep the Type, Media, and Search panels functional through the existing JavaScript.
- Match the supplied default All state: compact header, controlled white introduction space, then a flush two-column project grid.
- Show each project title permanently over its image, using a restrained sans-serif title plus expressive italic creator treatment.
- Preserve the existing six images and filter metadata.
- Keep hover/focus feedback subtle: a small image scale and dimming effect without hiding the permanent title.
- Maintain a two-column desktop grid and collapse to one column on small screens.
- Match the supplied footer height, top rule, CTA scale, company copy, and right-aligned social links.

## Contact Page

- Preserve `contact.html`, the primary navigation, telephone link, and email links.
- Match the supplied oversized centered `CONTACT` heading and compact header.
- Use a 41/59 desktop split for contact copy and the supplied new map visual.
- Extract the map region from `Desktop-05.png` as a dedicated web asset so the page remains semantic and responsive.
- Keep the address and contact labels aligned in two columns.
- Match the supplied lower section: top rule, large single-line tagline on wide screens, company copy at lower left, social links at lower right.
- Collapse contact details and map into a vertical stack on mobile.

## Assets

- Reuse the existing project card photographs and White Pix logo asset.
- Add one optimized map image derived from the user-supplied Contact reference.
- Do not add third-party fonts, icon libraries, analytics, or external image dependencies.

## Accessibility and Behavior

- Preserve skip links, landmark elements, alt text, keyboard focus, and reduced-motion behavior.
- Navigation and filter controls remain keyboard operable.
- Text overlays must retain readable contrast against all project images.
- Change every site-wide `Get in touch!` CTA to navigate to `contact.html` instead of opening an email client.
- No URL, page title, or navigation-label changes.

## Verification

- Run the existing test command.
- Validate all local relative `src` and `href` targets.
- Render and inspect Project and Contact at desktop and mobile widths.
- After publishing, verify both pages and every referenced asset return HTTP 200 and match the local file sizes.
