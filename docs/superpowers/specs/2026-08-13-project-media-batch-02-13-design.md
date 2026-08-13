# Project media batch 02–13 design

## Scope

Publish the supplied cover and video media for these eight existing catalog records:

- `huawei-freebuds-pro-3`
- `huawei-nora-band-10`
- `universal-studio`
- `huawei-watch-fit-5-niki`
- `anta-milan`
- `honor-x-fifa`
- `lays-cny-campaign`
- `touareg-x-wu-jing`

The catalog count, English titles, Type, Service, featured order, and automatic recommendation rules remain unchanged. Chinese titles and project descriptions remain hidden from the public presentation under the existing site rules.

## Source handling

Use the matching, already-extracted directories beside the supplied ZIP files on the `S:` drive as read-only sources. Do not modify or delete the ZIP files or extracted source media.

Each directory contains exactly one supplied cover and one supplied video. Match them to the existing catalog record by the numbered directory and project name. Copy covers into `assets/images/` with normalized repository filenames. The already-web-sized WATCH Fit 5 Niki and Touareg files may be copied without transcoding only if browser metadata validation confirms they already satisfy every output requirement.

## Web video output

Transcode every supplied video to a repository-local `.mp4` suitable for direct browser playback:

- H.264 video, AAC audio when the source contains audio
- `yuv420p` compatibility pixel format
- fast-start metadata for progressive playback
- preserve the source aspect ratio and frame rate
- retain the source resolution up to 1920×1080; scale larger sources down without upscaling smaller sources
- target an individual Git file below 50 MB, with a hard requirement below GitHub's 100 MB limit

Allocate bitrate by duration rather than using one fixed bitrate. If the first encode exceeds the target, lower the bitrate and encode again. Do not use Git LFS because the current GitHub Pages deployment must serve the media directly.

## Cover presentation

Retain the supplied cover image without destructive pre-cropping. The homepage continues to render featured projects in viewport-sized panels with `object-fit: cover` and centered cropping. The Projects page continues to use equal card ratios with the same cover behavior.

The supplied Universal cover is only 645×429. It is accepted for this publishing pass and may appear softer on large screens; it must not be synthetically replaced or sharpened.

## Data and generated pages

Set each matching project's `poster` and `video` fields to the normalized local asset paths. Rebuild the homepage, Projects page, and all project detail pages so recommendations remain automatically ordered by Type, shared Service count, and catalog distance.

## Failure handling

The source folders and media must be checked before changing catalog paths. If a transcode fails, produces invalid metadata, or remains above the hard size limit, leave that project's existing placeholder/video-pending state intact and report the failed project instead of publishing a broken reference.

## Verification

Before publishing:

1. Add a failing catalog test for all eight expected poster/video mappings.
2. Run the complete build and Node test suite.
3. Confirm every generated local asset reference exists.
4. In desktop and mobile Chrome, verify the eight covers load, use `object-fit: cover`, and keep the established full-screen/equal-card containers.
5. Open all eight detail pages, start their players, and verify valid dimensions, duration, no page errors, and no relevant HTTP errors.
6. Confirm every committed video is below 100 MB and preferably below 50 MB.
7. Commit and push the verified batch to the existing `codex/project-catalog` branch and Draft PR #3.
