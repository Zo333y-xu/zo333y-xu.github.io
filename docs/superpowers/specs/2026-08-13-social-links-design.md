# Social Links Design

## Goal

Make the three social icons in the lower-right corner of the contact page independently clickable. All destinations open in a new browser tab.

## Interaction

- WeChat opens the local `wechat.html` page in a new tab.
- Xiaohongshu opens the supplied White Pix profile URL in a new tab.
- Douyin opens the supplied White Pix profile URL in a new tab.
- Each external-tab link uses `rel="noopener noreferrer"` and has a descriptive accessible label.

## Presentation

- Replace the current combined decorative background image with three individual linked icon images.
- Preserve the existing lower-right alignment, visual order, spacing, and responsive sizing.
- Add the supplied WeChat, Xiaohongshu, and Douyin PNG files under `assets/images/`.
- Add the supplied WeChat QR image under `assets/images/`.
- The standalone WeChat page uses a white background and centers the QR image horizontally and vertically in the viewport. The image scales down on narrow screens without being cropped.

## Scope

Only `contact.html`, the social-icon styles, the new `wechat.html` page, copied image assets, and focused automated tests are changed. Existing unrelated working-tree edits remain untouched.

## Verification

Automated tests will verify the three destinations, new-tab safety attributes, individual icon assets, and the centered WeChat QR page. The full existing test suite and build will then be run.
