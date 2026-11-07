#!/bin/bash
# Regenerates the AV fixtures (synthetic testsrc + 440 Hz sine, 2 s, no third-party media). Needs ffmpeg with libx264/libx265/libvpx/libopus.
set -e; cd "$(dirname "$0")/fixtures"
Q=(-hide_banner -loglevel error -y); V=(-f lavfi -i testsrc=duration=2:size=320x240:rate=24); A=(-f lavfi -i sine=frequency=440:duration=2:sample_rate=44100)
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libx264 -pix_fmt yuv420p -preset veryfast -c:a aac -b:a 96k -metadata title="Convy MOV H264" -metadata artist="Convy QA" -movflags use_metadata_tags av-h264.mov
ffmpeg "${Q[@]}" -f lavfi -i testsrc=duration=1:size=1280x720:rate=24 -f lavfi -i sine=frequency=440:duration=1 -c:v libx264 -pix_fmt yuv420p -preset veryfast -crf 28 -c:a aac -b:a 64k av-h264-720p.mov
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p -preset veryfast -x265-params log-level=error -c:a aac -b:a 96k av-hevc.mov
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p10le -preset veryfast -x265-params log-level=error -c:a aac -b:a 96k av-hevc10.mov
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 300k -deadline realtime -cpu-used 8 -c:a libopus -b:a 64k av-vp9.webm
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libvpx -pix_fmt yuv420p -b:v 300k -deadline realtime -cpu-used 8 -c:a vorbis -strict -2 -ac 2 -b:a 96k av-vp8.webm
ffmpeg "${Q[@]}" -f lavfi -i color=c=red:size=300x300:d=1 -frames:v 1 cover.tmp.jpg
ffmpeg "${Q[@]}" "${A[@]}" -i cover.tmp.jpg -map 0:a -map 1:v -c:a aac -b:a 96k -c:v mjpeg -disposition:v attached_pic -metadata title="Convy Titel" -metadata artist="Convy QA" -metadata album="Fixture" av-tagged.m4a
rm cover.tmp.jpg
ffmpeg "${Q[@]}" "${A[@]}" -c:a pcm_s16le -metadata title="Convy WAV" -metadata artist="Convy QA" av-tagged.wav
ffmpeg "${Q[@]}" "${V[@]}" "${A[@]}" -c:v libx264 -pix_fmt yuv420p -preset veryfast -c:a aac -b:a 96k -movflags use_metadata_tags -metadata "com.apple.quicktime.location.ISO6709=+41.0082+028.9784/" -metadata "com.apple.quicktime.make=Convy QA" -metadata creation_time=2026-01-02T03:04:05Z av-gps.mov
