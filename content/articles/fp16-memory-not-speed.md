---
title: "fp16 Halved the VRAM and Barely Touched the Latency"
description: "On a small image-captioning model, half precision cut memory from 920 to 476 MiB and latency from 143 to 135 ms. Why the two numbers behave so differently."
category: "Machine learning"
topics: "inference, pytorch, performance, gpu, computer vision"
date: "2026-11-20"
accent: "blue"
featured: "false"
draft: "true"
---

Half precision has a reputation as a free speed-up: flip the model to fp16 and inference gets faster. I measured it on an image-captioning service and got something else. Memory halved. Latency moved by 6%.

## The measurement

The model is BLIP's base captioning checkpoint: 224M parameters, about 86M in the vision encoder and 138M in the text decoder. The numbers below are the median time to caption one image with up to 50 new tokens, on an RTX 4070 Ti SUPER, counting model time only.

| Device and precision | Median latency | Peak VRAM |
| --- | ---: | ---: |
| GPU, fp16 | 135 ms | 476 MiB |
| GPU, fp32 | 143 ms | 920 MiB |
| CPU, fp32, 16 threads | 1058 ms | n/a |
| CPU, fp32, 2 threads | 1290 ms | n/a |

The caption was the same in all four.

GPU timing is easy to get wrong, because CUDA calls return before the work is finished. The timer is bracketed by explicit synchronisation, and it starts only after the request holds the GPU lock, so waiting for other requests is not counted. In outline:

```python
with self.gpu_lock:
    torch.cuda.synchronize()
    start = perf_counter()
    caption = self.caption_image(image, text, max_new_tokens, num_beams)
    torch.cuda.synchronize()
    end = perf_counter()
```

## Why memory halved

This part is arithmetic. 224M parameters at four bytes each is about 854 MiB; at two bytes each, about 427 MiB. The measured peaks, 920 and 476 MiB, are those figures plus roughly 50–65 MiB of activations and workspace. For a model this size, VRAM is almost entirely weights, so halving the bytes per weight halves the memory.

## Why latency did not

fp16 speeds up arithmetic: big matrix multiplications move half as many bytes and can use faster kernels. That pays off when the GPU spends its time on arithmetic.

A captioning model does not work that way. It runs the image encoder once, then generates the caption one token at a time. Each step is a small decoder pass with its own fixed costs: Python, the generation loop, launching many small GPU operations. On a model this small those fixed costs dominate, and they are the same in either precision.

I did not profile this, so treat it as the explanation that fits rather than a proven one. The CPU rows fit it too: going from 2 threads to 16 gives eight times the compute and only an 18% improvement. More raw arithmetic capacity barely helps there either.

## What I took from it

**Choose fp16 for memory, and say so.** At 476 MiB, nearly twice as many copies of this model fit on one GPU, or the same model fits on a smaller and cheaper one. That is a real reason to use it. "It is faster" was not, here.

**Load directly into the target precision.**

```python
model = BlipForConditionalGeneration.from_pretrained(
    MODEL_ID, revision=MODEL_REVISION, dtype=self.dtype
).to(self.device)
```

Converting fp16 weights back to fp32 later does not restore what the rounding removed.

**Make precision a deploy-time constant.** My first version had endpoints to switch precision at runtime. I removed them. A call changed whichever worker happened to receive it, so workers disagreed with each other, any caller could change it for everyone, and a restart silently reset it. Precision is now one constant in the code, identical on every worker, and each response reports which one produced it.

**Measure the thing you were promised.** The speed-up from half precision is real on large models and large batches. Whether it is real on *your* model is a five-minute experiment, and the answer decides whether you are buying speed or buying memory.
