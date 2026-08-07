---
title: "Training For My Next Marathon With Codex"
description: "How I'm using Codex to help me stay on track with my marathon training."
pubDate: 2026-08-07
heroImage: "/images/posts/2026/vienna-half-marathon-2026.jpg"
tags:
  - "Tech"
  - "Fitness"
draft: false
---

*Note: I realise that the Codex app was recently merged with the ChatGPT desktop app. Whenever I refer to "Codex", I mean interacting with "Codex" or "ChatGPT Work" in the ChatGPT desktop app. By "ChatGPT", I mean the normal, non-local AI chat interface. Thanks for making this easy, OpenAI.*

I'm about to run my second-ever marathon in just eight weeks. In the marathon training world, that's not that much time. So far, my training has been all over the place. I ran a half-marathon race at the beginning of July in Berlin. Then, my training consistency went down the drain as I was traveling in Taiwan and China, where the crazy high humidity and temperature made it nearly impossible to run outside. I still managed to squeeze in a few short runs and some strength training, but it was far from my regular training routine. The week following my return to Berlin was all about preparing for yet another race: the adidas Runners City Night 10K race, where I shaved over 3 minutes off my personal best, hitting 45:14.

## Building a marathon training plan with Codex

With the Generali Köln Marathon less than two months away, it was time for me to take a hard look at my training plan. Recently, OpenAI's ChatGPT and Codex have been my go-to places for finding answers to random questions and solving all kinds of problems. That is no different when it comes to my training. For example, I used ChatGPT extensively to research what running shoe rotation would best fit my needs.

This time, I turned to Codex to build me a training plan taking into account the following:

- My existing training data (more on that below)
- My workout schedule (including indoor cycling, Pilates, run clubs)
- Travel plans and going back to university in September
- My shoe rotation (check [my Strava](https://www.strava.com/athletes/47540494) if you're curious)
- My recent races, PBs, and marathon goal

In terms of output, I asked Codex to give me "*a simple, day-by-day (with weekly Mon-Sun overviews), minimalistic training plan for the marathon*". The output was a Markdown file that lives locally on my Mac, iCloud Drive and GitHub so that I and my AI agents can access it easily. I had to steer Codex slightly to fix the formatting and polish the training plan to my liking. For example, I asked it to give me shoe recommendations for each of the proposed runs. I didn't have to do much more in terms of manual tweaks to the plan.

<figure>
  <img src="/images/posts/2026/marathon-training-obsidian.png" alt="The training plan in Obsidian">
  <figcaption>The training plan in Obsidian</figcaption>
</figure>

## Getting workout data into Codex

The key part of getting Codex to help me build this personalised training plan was providing it with a complete overview of my workouts. At this point, there are probably dozens of ways to do this, including simply handing Codex your Strava API keys (which I do for some tasks). Instead, I used the [HealthFit](https://apps.apple.com/app/healthfit/id1202650514) iOS app to export summaries of all of my workouts as a single CSV file. The app also lets me sync my workouts and health metrics data to cloud storage services and a Google Sheet so that it can be later accessed via ChatGPT, more on which in a second.

<figure>
  <img src="/images/posts/2026/healthfit-app.png" alt="My recent race as seen in the HealthFit app">
  <figcaption>My recent race as seen in the HealthFit app</figcaption>
</figure>

## Executing the training plan

Creating the plan is the easy part — actually executing on it is the hard thing. To make it easy for myself to stay on top of the plan that Codex created for me rather than having to remember to check the Markdown file itself every day, I set up a scheduled task in ChatGPT. The way it works is quite simple:

- Executes every day at 7 am until I'm done with the marathon training
- Opens the latest version of my marathon training Markdown file on GitHub
- Checks my recently logged workouts in a Google Sheet synced via HealthFit
- Gives a short summary of yesterday's workouts, followed by what's in my training plan for today, guidance around recovery, recommended shoes, and relevant context on what's to come later in the week

This way, each morning, ChatGPT sends me a notification that opens a chat history with my daily training briefing. All I have to do at this point is simply follow the plan.

<figure>
  <img src="/images/posts/2026/morning-training-briefing-chatgpt.png" alt="My daily training briefing in ChatGPT">
  <figcaption>My daily training briefing in ChatGPT</figcaption>
</figure>

Even though it might seem like a lot of work, creating the training plan with Codex was actually quite straightforward and put me back on track with my marathon training. Moreover, I did it all with the standard ~20€/month subscription to ChatGPT that I already had rather than paying for a dedicated training app like Runna, which I also find quite constrained compared to having my own training plan text file.
