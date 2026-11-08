---
title: "Footfall: Local Insights for Small Businesses"
description: "Designing and building a café planning app with a three-person team at Corkathon, from local event evidence to supplier ordering decisions."
pubDate: 2026-11-08
order: 0
tags:
  - "Work"
  - "Product Design"
  - "AI"
draft: false
heroImage: "/images/case-studies/footfall/footfall-cover.webp"
location: "Cork, Ireland"
period: "7 November 2026"
teamSize: "3 people"
metrics:
  - label: "Corkathon shortlist"
    value: "Top 9 of 26"
  - label: "Hackathon build"
    value: "1 day"
---

## Project Overview

At Corkathon 2026, I worked with my Business Information Systems classmate [Olan Hennessy O'Flynn](https://www.linkedin.com/in/olan-hennessy-o-flynn-701a91373/) and [Rajeev Shyam Kumar](https://www.linkedin.com/in/rajeev-shyam-kumar-1859002a2/) to build Footfall. The app helps small businesses understand which nearby events could affect demand and prepare before supplier ordering deadlines.

Our first use case was an independent café in Cork. We wanted to bring scattered local information into a weekly view that an owner could use to make practical decisions.

I set up our team workflow and led product and design. I also worked across the implementation, from the public website and deployment to opening hours, supplier schedules and database reliability.

<p>
  <a class="btn btn-primary" href="https://footfall-team18.vercel.app/"><i class="ri-external-link-line" aria-hidden="true"></i>Try Footfall</a>
  <a class="btn btn-secondary" href="https://devpost.com/software/footfall-0srjti"><i class="ri-play-circle-line" aria-hidden="true"></i>Project &amp; Walkthrough</a>
  <a class="btn btn-secondary" href="https://github.com/meetdanielme/corkathon_team_18"><i class="ri-github-line" aria-hidden="true"></i>Source Code</a>
</p>

## Starting With an Ordering Decision

A café owner needs to order stock before they know how busy the next few days will be. A graduation, concert or community event could bring more people into the area, but finding that information means checking different websites and calendars.

Knowing that something is happening nearby is only part of the problem. The owner also needs to understand whether it overlaps with their opening hours and whether there is still time to adjust an order.

We built around that sequence: notice an event, understand its relevance, check the supplier cutoff, and decide what to do. This was our working hypothesis for the hackathon. We had not yet validated it through research with café owners.

## Designing Around the Owner's Week

I shaped the main experience around a week timeline. Events, trading hours and ordering deadlines belong together because their relationship determines when an owner needs to act.

The timeline also gives context to events that fall outside opening hours. Something can be nearby without being relevant to that particular business on that particular day.

<figure>
  <img src="/images/case-studies/footfall/footfall-week.webp" alt="Footfall weekly timeline showing local events, café opening hours and supplier ordering deadlines" width="1280" height="800" loading="lazy" decoding="async">
  <figcaption>The weekly view brings local events and supplier cutoffs into the same planning space.</figcaption>
</figure>

I wrote the copy for someone running a café during a busy day. Labels such as “The Week Ahead,” “Why It Showed Up” and “What This Could Mean” explain what the owner is looking at without requiring them to interpret an analytics dashboard.

## Keeping the Evidence Close

One of our main challenges was deciding what the app could reasonably say about an event. Distance, timing and opening-hour overlap can help explain relevance. They do not establish how many customers will walk through the door.

We kept potential impact separate from confidence and showed missing information alongside the insight. The owner can inspect the source and see why an event was included. A partial source refresh remains visible, with saved records retained when a check fails.

<figure>
  <img src="/images/case-studies/footfall/footfall-evidence.webp" alt="Footfall event assessment separating potential impact from confidence, with missing attendance information and a rough impact estimate" width="1280" height="800" loading="lazy" decoding="async">
  <figcaption>The impact figures are heuristic scenarios, not validated forecasts. Missing information stays visible beside the assessment.</figcaption>
</figure>

This mattered especially when using AI to extract information from event pages. An incomplete listing or ambiguous date should not turn into a confident business recommendation just because a model produced a structured answer.

## Connecting an Insight to an Action

Footfall connects an event to the relevant supplier deadline. I added per-location opening hours and editing for supplier delivery schedules and order messages, so the owner can adjust the assumptions behind that flow.

<figure>
  <img src="/images/case-studies/footfall/footfall-deadline.webp" alt="Graduation event details with a location map and the bakery ordering deadline beside the event timeline" width="1280" height="800" loading="lazy" decoding="async">
  <figcaption>A nearby graduation is connected to the bakery ordering cutoff, giving the owner a concrete decision point.</figcaption>
</figure>

I also worked on grounding supplier messages. The app builds factual wording from the selected insight and supplier deadline. An optional model call selects a constrained wording style, while the owner can edit the complete message and choose quantities themselves.

Approving a message does not send it or place an order. The owner copies it into their own email or messaging app. Saving an edit clears the approval, so the revised message needs another review.

<figure>
  <img src="/images/case-studies/footfall/footfall-message.webp" alt="Editable message to a bakery supplier with review, approval and copy controls, marked approved but not sent" width="1280" height="800" loading="lazy" decoding="async">
  <figcaption>The message review screen keeps the owner in control. This saved workshop message illustrates a separate scenario from the graduation shown above.</figcaption>
</figure>

These screenshots were captured from the hosted app on 7 November 2026 and use the configured café profile and saved events from our submission.

## My Contribution Across the Build

Alongside the owner journey and app copy, I built the landing page, pricing page and simulated sign-up. That gave us a way to explain the product before taking someone into the app.

On the engineering side, I deployed Footfall on Vercel with persistent Turso storage and configured bounded Azure model calls. I improved event deduplication and worked through database reliability and page-load performance issues. I also prepared our submission materials.

The application uses Python and Flask with server-rendered HTML, CSS and JavaScript. Local runs use SQLite; the hosted app uses Turso/libSQL. An Azure-hosted model extracts event information, while Python rules handle business relevance, trading hours and supplier cutoffs.

For me, the useful connection was between product decisions and their implementation. A weekly planning experience depends on details such as opening hours, delivery schedules and reliable saved data just as much as it depends on the visual layout.

## Working With the Team and AI

We used GitHub Issues to organise implementation tasks, with small branches and pull requests to bring the work together. Shared notes and handoffs helped us carry context between tasks and AI sessions.

We built the app using a mix of Claude Opus 5.5, Sol 6.1 and Google's latest Gemini models, choosing different models depending on the task. These were our development tools, separate from the model calls made by Footfall itself.

I used T3 Code to orchestrate my part of the work. It worked flawlessly for me throughout the day, particularly when I needed to hand a task to a different model while waiting for my five-hour usage limits to reset.

The practical challenge was still bringing everything into one working product: agreeing on the flow, integrating changes and making sure the complete experience held together.

## Outcome and What I Learned

Footfall was shortlisted among the top 9 projects out of 26. We pitched it to a jury with representatives from the UCC Computer Science Society, IGNITE @ UCC and FRAME.

We didn't win, but I had a lot of fun and learned plenty from the experience. I already knew AI could help me build useful tools for myself. Working with Olan and Rajeev gave me a chance to do something bigger, bring our work together, and explain it to people outside the team.

The product lesson I took away was that extracting information is only the beginning. Its value depends on connecting it to a specific business, a relevant trading window and a decision the owner still has time to make.

Footfall remains a hackathon prototype. Accounts are simulated, the hosted app shares a configured business profile, and the pricing page describes a proposed business model. We have not validated demand estimates, commercial impact or willingness to pay. A useful next step would be to test the planning flow with independent café owners and learn whether the insights arrive early enough to change their decisions.
