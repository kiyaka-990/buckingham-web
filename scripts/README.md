# scripts/

## build-clips.sh

Renders a hero-carousel clip from stills — a multi-shot Ken Burns sequence
(slow push, pull, lateral track) cross-faded into one mp4.

Needs `ffmpeg` on PATH, or set `SP` to a directory holding
`ffmpeg-*/bin/ffmpeg.exe` (how it was run on Windows).

    bash scripts/build-clips.sh public/media/clips/puppies.mp4 \
      public/media/gsd-black/pup-01.jpg \
      public/media/gsd-black/pup-05.jpg \
      public/media/gsd-black/pup-09.jpg

Output is 1280x800, 30fps, 6s per shot with a 1s cross-fade, ~1.5 MB for three
shots. The clips in `public/media/clips/` were built this way.

These are stand-ins for real footage. When the kennel sends an actual clip for a
breed, drop it in and point the slide's `src` at it — nothing else changes.
