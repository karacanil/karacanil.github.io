---
title: "A Foundation Model Lost to “Tomorrow Equals Today”"
description: "I fixed the rules first, ran TimesFM 3.0 on live stock prices for a month, and it forecast worse than assuming nothing changes."
category: "Machine learning"
topics: "forecasting, evaluation, time series, machine learning"
date: "2026-11-20"
accent: "orange"
featured: "true"
draft: "true"
---

TimesFM 3.0 is Google's 330M-parameter foundation model for time series. I wanted to know whether it could forecast a stock's closing price a week ahead better than the laziest guess available: the price stays where it is. Over 22 trading days it could not. It was 14% worse on eight stocks and 4–6% worse on twenty-two.

## Why not a backtest

A backtest lets you choose after you have seen. You pick the horizon, the metric, the stocks and the date range, and each choice is a chance to find the version that works.

So I ran a forward test instead. Every evening after the US close, a scheduled job gave the model the last 512 daily closes and saved its forecast for the next 20 sessions. Those files are write-once. The forecasts were scored only as real prices arrived. The model ran in two modes: one stock at a time, and all stocks jointly so it could use the relationships between them.

## Decide what a win is before you can see one

The decision policy was committed on October 13, before the first forecast could be scored. It names one primary question: the 5-session horizon. One-day and twenty-day results are supporting evidence, not fallbacks to reach for if the main result disappoints.

Skill is how much lower the model's mean absolute error is than a baseline's, with every error divided by the price on the forecast day:

$$
\text{skill} = 1 - \frac{\text{MAE}_\text{model}}{\text{MAE}_\text{baseline}}
$$

There are two baselines. *Last price* predicts today's close at every horizon. *Drift* extends the average daily change over the input window. To count as promising, a mode had to pass all of these against both:

- at least 5% lower error
- a bootstrap interval whose lower end is above zero, at two block lengths
- positive skill on at least 62.5% of the stocks
- positive skill in both halves of the test period
- positive skill after removing any single stock

The thresholds live in a JSON file that is hashed. The report refuses to produce a verdict if the hash has changed.

## The result

Negative skill means the model was worse than the baseline.

| Study and mode | Skill vs last price | Interval | Stocks it won |
| --- | ---: | --- | ---: |
| 8 stocks, one at a time | −14.3% | −23.4 to −7.8 | 4 of 8 |
| 8 stocks, joint | −13.6% | −25.0 to −7.2 | 3 of 8 |
| 22 stocks, one at a time | −5.8% | −10.3 to −3.1 | 8 of 22 |
| 22 stocks, joint | −4.0% | −6.2 to −2.2 | 7 of 22 |

Each row is 22 forecast days, from mid-October to mid-November. The intervals come from a block bootstrap that resamples whole days, so stocks that move together stay together. Each is a 98.75% interval, widened because four comparisons are being made at once.

Every interval sits entirely below zero. That is a stronger statement than "no improvement was found": on this data the model was measurably worse than doing nothing. Against drift the picture is the same, between −4% and −12%.

Two supporting numbers point the same way. The model called the direction of the 5-session move correctly 40–50% of the time. And its 80% prediction interval contained the real price 72–78% of the time, so it was also a little overconfident.

## One stock did most of the damage

In the eight-stock study, the model's error on NVDA was 41% worse than the baseline's. Take NVDA out and the pooled skill goes from −14.3% to −5.2%, which is about what the 22-stock study shows.

This is why "remove any one stock" is in the policy, and why I added the broader study with two stocks from each of eleven sectors. With eight symbols, one bad name can be the whole result.

The same logic cuts the other way. The sector breakdown shows health care at +5.7% and consumer staples at −31.9%, each from 44 data points. It would be easy to write "works for health care". That is exactly the choice-after-seeing the policy exists to prevent, so the sector table stays a diagnostic.

## What this does and does not say

It is one month, in one market regime, on daily closes, with the model used as shipped and no fine-tuning. The 20-session outcomes are still arriving and will be final in mid-December; so far they are negative too. None of this is a verdict on TimesFM for other kinds of data.

What it does say is narrower and, I think, more useful. A random walk is a hard baseline to beat on stock prices, and a large pretrained model did not beat it here. I only trust that conclusion because the rules were written first. Had I started from the sector table, I could have written a much more exciting article.

The code, the frozen policy and every recorded forecast are in [the repository](https://github.com/karacanil/timesfm-stock).
