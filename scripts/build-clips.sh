#!/usr/bin/env bash
# Render a multi-shot Ken Burns clip from stills.
#   kenburns.sh OUT.mp4 img1 img2 img3 ...
#
# zoompan's d= is output frames PER INPUT FRAME, so each still is fed as a
# single frame (no -loop) and d= alone sets the shot length.
set -e
FF="$SP/ffmpeg-9.0.1-essentials_build/bin/ffmpeg.exe"
OUT="$1"; shift
W=1280; H=800; FPS=30; SHOT=6; FADE=1
D=$(( SHOT * FPS ))
n=0; inputs=(); filters=()
for img in "$@"; do
  inputs+=( -i "$img" )
  # Vary the move per shot so consecutive stills do not drift identically:
  # push in, pull out, then a slow lateral track.
  case $(( n % 3 )) in
    0) zex="min(zoom+0.00090,1.22)"; xex="iw/2-(iw/zoom/2)" ;;
    1) zex="if(eq(on,1),1.22,max(1.001,zoom-0.00090))"; xex="iw/2-(iw/zoom/2)" ;;
    2) zex="min(zoom+0.00045,1.14)"; xex="iw/2-(iw/zoom/2)+(on-1)*1.2" ;;
  esac
  # Upscale first: zoompan steps in whole source pixels, so panning a
  # 1280px still visibly judders. Work at 2x, land on the output size.
  filters+=( "[${n}:v]scale=${W}*2:${H}*2:force_original_aspect_ratio=increase,crop=${W}*2:${H}*2,zoompan=z='${zex}':x='${xex}':y='ih/2-(ih/zoom/2)':d=${D}:s=${W}x${H}:fps=${FPS},setsar=1,format=yuv420p[v${n}]" )
  n=$((n+1))
done
chain=""; prev="[v0]"; off=0
for ((i=1;i<n;i++)); do
  off=$(awk "BEGIN{print $off + $SHOT - $FADE}")
  out="[x${i}]"; [ "$i" -eq $((n-1)) ] && out="[vout]"
  chain="${chain}${prev}[v${i}]xfade=transition=fade:duration=${FADE}:offset=${off}${out};"
  prev="$out"
done
chain="${chain%;}"
FC="$(IFS=';'; echo "${filters[*]}");${chain}"
"$FF" -y -hide_banner -loglevel error "${inputs[@]}" \
  -filter_complex "$FC" -map "[vout]" \
  -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart -an "$OUT"
echo "built $OUT"
