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
shots. The carousel's three stand-in clips were built this way and have since
been deleted: the kennel sent real footage (`public/media/video.mp4`), that
took the lead pane, and the other panes went back to being photographs.

The script stays because the need can recur — a breed page that wants movement
before there is footage for it. Anything it renders is a stand-in. When the
kennel sends an actual clip, drop it in and point the slide's `src` and
`poster` at it; nothing else changes.
