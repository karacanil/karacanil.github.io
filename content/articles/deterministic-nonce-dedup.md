---
title: "Deduplicating Encrypted Backups: The Nonce That Depends on the Data"
description: "Random nonces make identical data look different, which kills deduplication. Deriving the nonce from the content fixes that, at a price worth stating."
category: "Systems"
topics: "cryptography, backups, storage, python"
date: "2026-11-20"
accent: "lime"
featured: "false"
draft: "true"
---

A backup tool wants two things that pull against each other. It should encrypt everything before it leaves the machine, and it should not upload the same data twice. The usual advice for AES-GCM, "use a fresh random nonce every time", makes the second one impossible. This is how [Tuckvault](https://github.com/karacanil/tuckvault) gets both, and what it gives up.

## The conflict

Deduplication works by noticing that a piece of data is already stored. With a random nonce, encrypting the same 4 MiB chunk twice produces two unrelated blobs. The storage cannot tell they are the same, and neither can the client without keeping its own index of plaintext hashes.

The fix is to make encryption deterministic: the same chunk under the same key always produces the same blob. Then a duplicate is simply a blob whose name already exists.

## Deriving the nonce from the content

GCM fails badly if one nonce is ever used for two *different* messages. It does not care if the same nonce is used again for the *same* message, because that just reproduces the same ciphertext. So the nonce can be a keyed hash of the data:

```python
header = BLOB_MAGIC + bytes([flag])
nonce = hmac.new(self._siv, header + body, hashlib.sha256).digest()[:12]
blob = header + nonce + self._chunk.encrypt(nonce, body, header)
return sha256_hex(blob), blob
```

Three details matter here.

- **Two keys, not one.** The nonce key and the encryption key are derived separately from the master key, each with its own label. The HMAC output reveals nothing about the content to anyone without the nonce key.
- **The blob is named by the hash of its ciphertext.** The storage side can check that a blob is undamaged without being able to read it, and the name is the deduplication key.
- **The header is authenticated.** The flag that says whether the body is compressed is passed as associated data, so it cannot be flipped without the decryption failing.

Different chunks get the same nonce only if 96 bits of HMAC output collide. By the birthday bound that takes on the order of 2⁴⁸ chunks, which at 4 MiB each is around a zettabyte of unique data.

The upload loop then needs no index at all:

```python
name, blob = keys.seal_chunk(data)
if name not in blobs:
    remote.put_blob(name, blob)
```

A test copies a file inside the backed-up folder, runs a second backup, and asserts that the number of stored blobs is unchanged and zero bytes were uploaded.

## What it costs

Deterministic encryption leaks equality. The project's security notes say so directly:

> Sizes and repetition are visible to the destination. It can see roughly how much data you have, when it changes, and that two stored pieces are identical. It cannot see names or content.

That is the trade. Someone who controls the storage can tell that two of your chunks are the same, and could confirm a guess about a file only if they also had the keys. For personal backups to your own disk or server, I think that is a fair price for not re-uploading everything. For a threat model where the pattern of repetition is itself sensitive, it would not be.

The same code shows where the trade was not needed. Snapshot manifests, which list file names and the blobs they are made of, are never deduplicated, so they use an ordinary random nonce:

```python
nonce = os.urandom(12)
return SNAP_MAGIC + nonce + self._snap.encrypt(nonce, body, SNAP_MAGIC)
```

Determinism is used only where it buys something.

## Two smaller decisions

**Compression has to be deterministic too.** Chunks are compressed before encryption, but only if a 64 KiB sample shrinks by at least 10%. The rule depends on nothing but the data, so the same chunk always takes the same path and still deduplicates. Already-compressed files such as photos and video skip the wasted work.

**Format labels are forever.** The program was renamed at version 1.2, but the key derivation still says `safekeep`:

```python
# "safekeep" is the name this program had until 1.2. The label is part of
# the storage format: changing it would make every existing backup unreadable.
return hmac.new(master, b"safekeep/v1/" + label, hashlib.sha256).digest()
```

Any string that feeds a key is part of the on-disk format. Renaming it is a breaking change, however cosmetic it looks in the diff.

## A limit worth knowing

Chunks are fixed at 4 MiB, cut from the start of each file. An unchanged file, a copied file, or a file that only grew at the end all deduplicate well. Insert one byte at the beginning of a large file and every chunk after it shifts, so none of them match. Content-defined chunking solves that, at the cost of more code and more to get wrong. For folders of documents and photos, fixed chunks were the simpler choice.
