---
title: "Saints GAA Community Platform"
description: "Turning a university systems analysis project into an open-source community platform for GAA clubs, with transparent donations and member voting at its centre."
pubDate: 2026-11-20
order: 0
tags:
  - "University"
draft: false
heroImage: "/images/case-studies/gaa-community-platform/gaa-cover.webp"
location: "Cork, Ireland"
period: "Autumn 2026"
teamSize: "6 people"
---

## Project Overview

Saints GAA Community Platform started as our team's submission for **IS2204: Visual Thinking for Systems Analysis & Design**, a module in the Business Information Systems degree at University College Cork. It became a free, open-source platform that any GAA club can run.

Players and families across hurling, football, camogie and ladies' football can follow club news, respond to events, pay membership and fund shared goals that they choose together. Club officers run all of it from one admin area. The demo is set up as Saints, a fictional multi-code club, and changing one config file turns it into another club.

<p>
  <a class="btn btn-primary" href="https://saintsgaa.social"><i class="ri-external-link-line" aria-hidden="true"></i>Try the Demo</a>
  <a class="btn btn-secondary" href="https://github.com/meetdanielme/gaa-community-platform"><i class="ri-github-line" aria-hidden="true"></i>Source Code</a>
</p>

## The Brief

The module gave us a hypothetical case. Saints is a newly formed club that brings four codes together under one roof. The brief asked how a digital system could help the club grow as an inclusive, equitable and sustainable community, not just win matches.

A few ideas shaped our design from the start:

- **One club, four equal codes.** No code should feel like an afterthought, and differences in access and investment between codes should be visible.
- **The family is the core unit.** Participation depends on parents, guardians, siblings and supporters as much as on the player.
- **Value means more than results.** Belonging, wellbeing, volunteer sustainability and transparent governance count too.
- **Ethics is part of the design.** Consent, data minimisation and careful handling of children's data were requirements, not afterthoughts.

## Narrowing the Scope Over Five Sprints

We worked in five two-week design sprints, and each one produced artefacts that the next built on:

1. **Use-case model and wireframes**: who uses the system and what they need from it
2. **Activity diagrams and business rules**: the donation and voting workflows, including edge cases such as ties and failed payments
3. **Interactive lo-fi and hi-fi prototypes** in Figma, with a decision table for who may vote
4. **Data flow diagrams** tracing how donation and vote data moves through the system
5. **Entity relationship diagrams**, alongside a working prototype

Over those sprints, the project narrowed from a broad club-management idea to a focused platform with donations and voting at its centre. The final model also dropped volunteering, which never had prototype screens, and added a Club Admin actor that shares several use cases with members.

<figure>
  <img src="/images/case-studies/gaa-community-platform/gaa-use-case-model.webp" alt="Use-case model showing players, family supporters and a club admin connected to use cases such as making a donation, voting for the next goal and responding to event invitations" width="1290" height="1740" loading="lazy" decoding="async">
  <figcaption>The final use-case model from Sprint 5. Gold outlines mark what changed in that sprint.</figcaption>
</figure>

## Donations Members Can See and Steer

Fundraising in a GAA club often happens through a bucket at the gate, a raffle or a link to a generic crowdfunding page. Members rarely see where the money goes or get any say in what it's for. In a club with several codes, it can feel like the money only ever helps one of them.

So the platform does two things at its core:

- **Transparent donations.** The club has one active fundraising goal at a time, such as new lockers or pitch lighting. Each goal has a plain cost breakdown, a list of who benefits across all four codes and live progress toward its target.
- **Member-led priorities.** Members vote on which proposed goal comes next, one member one vote. When the current goal is fully funded, the top-voted goal becomes active automatically. If the vote is tied, a club officer makes the final choice and the decision is logged.

<div class="image-grid image-grid-3">
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-donate.webp" alt="Donate screen showing the active fundraising goal and its progress" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>The active goal and its progress</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-goal.webp" alt="Goal details explaining the purpose, who benefits and the cost breakdown" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>Purpose, beneficiaries and cost breakdown</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-vote.webp" alt="Voting screen listing proposed goals with votes and percentages" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>Voting on the next goal</figcaption>
  </figure>
</div>

## A Reason to Open the App Every Week

A platform that only appears when the club asks for money won't build much of a community. The feed, events, RSVPs, family profiles and membership fees exist so members have a reason to open it every week.

Families can respond to events for any family member they manage, with capacity and deadline checks. The feed brings updates from all four codes together and can be filtered by code.

<div class="image-grid image-grid-3">
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-feed.webp" alt="Club feed with a pinned training notice and filters for each code" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>One feed for four codes</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-events.webp" alt="Events list showing the member's upcoming events and all club events" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>Upcoming and club-wide events</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/gaa-community-platform/gaa-profile.webp" alt="Member profile with contact details, linked family members and upcoming events" width="780" height="1688" loading="lazy" decoding="async">
    <figcaption>A family profile</figcaption>
  </figure>
</div>

Club officers get an admin area with a dashboard, fundraising tools, posts, events, members and a full donations ledger. Every admin change is written to an activity log, which keeps the governance side as transparent as the donations themselves.

<figure>
  <img src="/images/case-studies/gaa-community-platform/gaa-admin-fundraising.webp" alt="Admin fundraising page with the active goal, offline funds and the next-goal vote" width="1600" height="1000" loading="lazy" decoding="async">
  <figcaption>The admin fundraising page, where officers record offline funds and follow the next-goal vote.</figcaption>
</figure>

## From Diagrams to a Working App

I built the working app using our sprint artefacts as the specification: the use-case descriptions, activity diagrams, business rules and hi-fi screens. I worked with Claude Code, an AI coding agent, in small, reviewable steps, testing each change in the browser and feeding demo feedback into the next round.

The app uses Next.js, TypeScript, Tailwind CSS, Postgres with Drizzle ORM and Better Auth, deployed on Vercel with a Neon database. Every feature follows the same path: page, action, service, rule. The rules decide things like who can vote, whether an event is full and when the next goal becomes active. They are pure functions with unit tests, which let us check that the code makes the same decisions as our diagrams.

A traceability document in the repository maps each use case to its activity diagram, business rule, screens, code and tests, so the design and the code can keep evolving together.

## Open Source for Every Club

GAA clubs are run by volunteers. Most can't pay for custom software, and they shouldn't each have to build the same thing from scratch. The platform is released under the MIT license, so any club, student or developer can use it, change it and run it for free.

The public demo lets anyone explore as Evan, a family supporter with three linked members, or as Aoife, the club secretary. Payments are simulated and the demo resets every night.

## What I Learned

AI made it realistic for a student team to go from diagrams to a deployed app in a few days. But it was only as good as the specification we gave it. The clearer our models were, the better the code it wrote, and the business rules we argued out as a team ended up as the tests that protect the project.

Saints is a fictional club, and any costs shown in the demo are illustrative. A useful next step would be to put the platform in front of a real club and learn whether transparent goals and member voting actually change how people give.

## Team

Designed and built by IS2204 Group 16 at University College Cork: [Evan Alam](https://ie.linkedin.com/in/evan-alam-565b33384), [Idayat Majolagbe](https://www.linkedin.com/in/idayat-majolagbe-9935a7354/), Daniel Marcinkowski, [Chloé Mitellus](https://ie.linkedin.com/in/chlo%C3%A9-mitellus-504072386), [Emmanuella Ntumobe](https://ie.linkedin.com/in/emmanuella-ntumobe-52b797384) and [Sandu Stati Suman](https://ie.linkedin.com/in/sandu-stati-suman-595b30384). Thanks to Prof. David Sammon and the Department of Business Information Systems at UCC for the case and the feedback along the way.
