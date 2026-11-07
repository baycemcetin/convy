---
draft: true # SAMPLE for template and build-check validation, written from pair-facts. The copywriter replaces it; it never ships as is.
intro: "HEIC is what an iPhone saves by default, and plenty of programs still cannot open it. Choose your HEIC files and Convy turns them into JPG on this device, then you save the result. The camera details inside the photo stay with it."
metaHook: "the photo keeps its camera details and stands the right way up"
steps:
  - "Choose your HEIC photos, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG files."
limits:
  - "Images above 250 megapixels are refused, and above 100 megapixels on an iPhone or iPad, instead of running the device out of memory."
  - "The first conversion downloads the image engine once, about 5 MB, and keeps it for next time."
faq:
  - q: "Does the JPG keep the date and the location?"
    a: "Yes. The EXIF block travels into the JPG, including the camera make and the GPS position if the HEIC had one. If you do not want the location shared, remove it in a metadata tool before you send the file on."
  - q: "Why does the file get bigger?"
    a: "HEIC compresses photos more tightly than JPG does. In our test a 39 KB HEIC became a 51 KB JPG at quality 85. The exact ratio depends on the photo, so treat that pair as one example, not a rule."
  - q: "Will a Chrome, Firefox and Safari conversion look the same?"
    a: "The output was byte for byte identical in Chromium, Firefox and WebKit for our sample, because the same image engine runs in each of them. Different photos were not compared, so this describes the engine, not every file."
factRefs: [lossy, metadata, path, limits.0, extra.0, extra.2]
---
JPG is a lossy format, and Convy writes it at quality 85. That is a visible but gentle step down from the HEIC original, and it cannot be undone: if you need the pixels untouched, keep the HEIC and convert a copy.

The camera details do not get dropped on the way. Make, model and the GPS position were all still in the JPG when we converted an HEIC that carried them, so a photo that was tagged with a place stays tagged. If you plan to post the file publicly, check that before you do.

Rotation is handled for you. Convy turns the pixels to the way the photo was held and resets the orientation tag to normal, so the picture is upright in every viewer, including the ones that ignore the tag.

One sample came out at 51 KB from a 39 KB HEIC of 1280 by 720 pixels. Real phone photos are much larger, so expect both files to be a few megabytes.
