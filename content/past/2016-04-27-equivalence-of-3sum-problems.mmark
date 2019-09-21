---
date: 2016-04-27T00:00:00Z
title: Equivalence of 3SUM problems
url: /2016/04/27/equivalence-of-3sum-problems/
thumbnail:
  src: https://ipfs.c.ovfefe.cf/ipfs/QmeHrVkaqogCPYKw3Gu29PWgkYCBWc4YEio16iNVjzcUzg
tags:
  - Algorithms
---

Are different versions of the 3SUM problem equivalent?

<!--more-->

## Reducing 3SUMx1 on S with multiple pick to 3SUMx3 on A,B,C

Trivially with $$A=B=C=S$$.

## Reducing 3SUMx1 on S with unique pick to 3SUMx3 on A,B,C

Construct $$t=\Theta(\log n)$$ instances of 3SUMx3 where S is partitioned into
$$A,B,C$$ of size $$\frac{n}{3}$$ each uniformly at random.

By construction, no instance has a triple $$a + b + c = 0$$ with
$$a = b = s_i$$
or
$$b = c = s_i$$ or
$$a = c = s_i$$.

If $$s_1 + s_2 + s_3 = 0$$ then, with high probability,
at least one of the $$\Theta(\log n)$$ instances has
$$s_1 \in A$$,
$$s_2 \in B$$, and
$$s_3 \in C$$.

The probability that this is not the case is
$$(\frac{27-3!}{27})^m$$.

Hence, with $$m = \Theta(\log n)$$, the probability that at least one instance has
the triple is $$1 - n^{-\Omega(1)}$$.

## Reducing 3SUMx3 to 3SUMx1 (with multiple or unique pick)

$$ 10 a + 1, 10 b + 2, 10 c - 3 $$

$$a + b + c = 0 \implies 10 a + 1 + 10 b + 2 + 10 c - 3 = 0$$

$$1 + 2 - 3 = 0$$

$$1 + 1 + 1 = 3$$

$$2 + 2 + 2 = 6$$

$$-3 - 3 - 3 = -9$$

$$1 + 1 + 2 = 4$$

$$1 + 2 + 2 = 5$$

$$1 + 1 - 3 = -1$$

$$1 - 3 - 3 = -5$$

$$2 + 2 - 3 = 1$$

$$2 - 3 - 3 = -4$$
