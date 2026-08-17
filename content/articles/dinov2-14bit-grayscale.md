---
title: "Teaching DINOv2 to See in 14-bit Grayscale"
description: "Field notes from adapting self-supervised vision to a domain where ordinary image assumptions break."
category: "Computer vision"
topics: "engineering, computer vision, self-supervised learning, image processing, performance"
date: "2026-08-12"
readingTime: "11 min read"
accent: "orange"
featured: "false"
draft: "false"
order: "2"
---

Most vision pipelines quietly assume three things: the input has three channels, eight bits are enough, and the values resemble natural photographs. A 14-bit grayscale sensor breaks all three assumptions before the model sees a single patch.

The obvious fix is to duplicate the channel three times and divide by 16383. That makes the tensor fit the interface, but it does not make the data meaningful. The real work is deciding which parts of the sensor signal should survive normalization, augmentation, and patch embedding.

## Dynamic range is not the same as useful range

A 14-bit container can represent values from 0 to 16383. In practice, a particular capture may use only a narrow slice of that range. Fixed division preserves the theoretical range while compressing the actual image into a small interval.

That matters for a self-supervised model. DINOv2 learns by matching different views of the same image. If most pixels enter the network with nearly identical values, the views can be technically different while carrying very little visual structure.

Before choosing a transform, it helps to inspect more than the global minimum and maximum:

- Per-image percentiles show whether a few hot pixels dominate the scale.
- Dataset percentiles reveal whether exposure changes between scenes.
- Histograms show whether the signal is linear, clustered, or strongly skewed.
- Saturation counts expose clipping at either end of the sensor range.

## A conservative preprocessing contract

The safest starting point is a small, explicit pipeline whose effects can be measured independently. Mine looks conceptually like this:

```python
def prepare(frame, low, high, mean, std):
    frame = frame.float()
    frame = frame.clamp(low, high)
    frame = (frame - low) / (high - low)
    frame = torch.log1p(4.0 * frame) / math.log(5.0)
    return (frame - mean) / std
```

Clipping suppresses extreme sensor values, the logarithm expands darker differences, and dataset statistics put the result into a stable range. None of those steps is automatically correct; the point is that each one has a visible purpose and can be removed during an ablation.

> **Normalization is part of the model.** If it erases a weak structure, no amount of training can teach the backbone to recover it.

## RGB augmentations need to earn their place

Color jitter is useful for ordinary photographs because color should not define the identity of an object. On grayscale sensor data, brightness and contrast may encode the phenomenon we actually care about. Applying the familiar recipe without inspection can turn invariance into information loss.

I separate augmentations into two groups:

| Usually defensible | Requires evidence |
| --- | --- |
| Crops and horizontal flips | Strong brightness jitter |
| Mild blur | Histogram equalization per crop |
| Small sensor-like noise | Aggressive solarization |
| Geometry-preserving resize | Arbitrary gamma changes |

Local crops deserve special attention. If the objects are already small, a local crop may contain no useful target at all. Reducing the number of local views—or increasing their minimum scale—can produce a stronger learning signal than simply running more iterations.

## Change one assumption at a time

Loss curves alone are not enough to compare preprocessing choices. A lower self-supervised loss can describe a better representation, but it can also describe an easier and less informative matching problem.

For each experiment I keep a small panel of checks:

1. Render the exact tensors received by the model.
2. Track their min, max, mean, and standard deviation.
3. Compare nearest-neighbour patches from a fixed validation set.
4. Run a lightweight linear probe when labels are available.
5. Record preprocessing parameters beside the checkpoint.

The central lesson is simple: adapting DINOv2 to unusual imagery is not mainly a matter of changing `in_chans` from three to one. It is the construction of a new visual contract between the sensor and the model. Once that contract is explicit, the architecture becomes the easy part.
