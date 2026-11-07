---
draft: false
intro: "Save a picture from a website and it is often a WebP, which older editors, print services and many web forms refuse. Choose your WebP files and Convy turns them into JPG on this device. Transparent areas become white, and an animated WebP gives its first frame."
metaHook: "for editors and forms that refuse WebP; animations keep their first frame"
steps:
  - "Choose your WebP images, or drop them on the page."
  - "JPG is already selected as the target."
  - "Press Convert, then save the JPG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "An animated WebP gives one still JPG; the other frames are not converted."
faq:
  - q: "I saved an animated WebP. What will the JPG show?"
    a: "Only the first frame. Convy reads the first image in the file and converts that one; the rest of the animation is not used. JPG cannot hold motion at all, so if you need the movement, keep the WebP as it is."
  - q: "Why does the cut-out background turn white?"
    a: "Because a JPG has nowhere to store transparency. Convy places each transparent or half-transparent pixel on white before it writes the file, which we verified with a transparent test image. To keep a cut-out see-through, choose PNG as the target instead."
  - q: "Does the JPG lose quality?"
    a: "Some. JPG is lossy and Convy writes it at quality 85, with no setting to change it. If the WebP was lossy too, the JPG adds a second round of compression on top. For edits where every pixel counts, convert to PNG, which is lossless."
factRefs: [lossy, quality, transparency, animation, metadata, path, extra.0, extra.1, limits.0]
---
A WebP can be three things a JPG cannot: transparent, animated or lossless. Each one is settled in a fixed way, with no option to change it.

Transparency becomes white. A product photo cut out on a transparent background ends up on a white field. That suits a white page, but not an image that will sit on a colored background.

Animation is cut to the first frame. Convy reads only the first image in the file, so a moving sticker or banner becomes a still picture. If you need the motion, keep the WebP; a JPG has no way to store it.

Lossless WebP becomes lossy JPG at a fixed quality of 85. A WebP that was already lossy goes through a second round of compression, so small images saved from a web page may look slightly rougher than before.

Embedded EXIF, including any GPS position, is removed, and the ICC color profile is kept. If the file carries an orientation tag, the pixels are turned before the tag goes. The same engine runs in every browser, with no browser-specific branch in the code.
