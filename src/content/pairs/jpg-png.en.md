---
draft: false
intro: "Some editors, forms and design tools ask for PNG, and a photo you plan to edit is safer stored without further loss. Choose your JPG files and Convy writes PNG copies on this device. Expect much larger files; camera details and the GPS location are removed."
metaHook: "no further loss while you edit; expect a much larger file"
steps:
  - "Choose your JPG files, or drop them on the page."
  - "PNG is already selected as the target."
  - "Press Convert, then save the PNG files."
limits:
  - "Images above 250 megapixels are refused, or above 100 megapixels on an iPhone or iPad."
  - "A 15-megapixel JPG made a 37.6 MB PNG in our test; a folder of photos can fill a drive quickly."
faq:
  - q: "Does PNG make a JPG look better?"
    a: "No. The PNG copies the JPG's pixels exactly, compression artifacts included, so it looks the same. The gain comes later: every edit and save of the PNG adds no new loss, which a JPG saved over and over cannot offer."
  - q: "Why is the PNG so much bigger?"
    a: "PNG stores every pixel without lossy compression, and photographs do not pack down well that way. In our test a 12-megapixel JPG went from 1.2 MB to 11.8 MB as a PNG. Your ratio depends on the photo, so try one file first."
  - q: "Are the GPS location and camera details kept?"
    a: "No. EXIF with the GPS position is removed, together with XMP, IPTC and comments; we checked each of them with a test JPG. The color profile is the exception and stays in the PNG, so colors do not shift."
  - q: "How long does a large photo take?"
    a: "In our browser tests a 15-megapixel JPG took 4.6 to 5.6 seconds to become a PNG, depending on the browser. Your device may be faster or slower. The first conversion also waits for the image engine, about 5 MB, to download once."
factRefs: [lossy, quality, metadata, extra.0, extra.1, extra.2, limits.0, download]
---
Converting to PNG does not bring back what JPG compression already threw away. The PNG holds the JPG's pixels exactly, blur and blocky edges included. What it does is stop any further loss: you can open, edit and save the PNG as often as you like and it stays identical, while a JPG saved again and again drifts a little each time.

Size is the catch. In our test a 12-megapixel JPG of 1.2 MB became an 11.8 MB PNG, almost ten times larger. In browsers, a 15-megapixel JPG took between 4.6 and 5.6 seconds and produced a 37.6 MB PNG. Convert one file first if you are about to do a whole folder.

The JPG's metadata does not come along. We tested a JPG holding a camera make, a GPS position, XMP, IPTC and a comment, and none of it was in the output. If the JPG was stored sideways with an orientation tag, the pixels are turned first, so the PNG is upright without the tag. The ICC color profile is kept.
