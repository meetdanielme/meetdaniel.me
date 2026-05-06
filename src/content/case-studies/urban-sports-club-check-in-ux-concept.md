---
title: "Improved Urban Sports Check-In UX Concept"
description: "A UX concept for improving the ease and accessibility of the Urban Sports Club check-in experience on iOS."
pubDate: 2025-04-01
order: 1
tags:
  - "Work"
draft: false
heroImage: "/images/case-studies/urban-sports-club/urban-sports-club-improved-check-in-ux.png"
period: "April 1–15, 2025"
---

## Project Overview

In the following case study, I focused on a set of features meant to improve the ease and accessibility of the check-in experience in the Urban Sports Club app on iOS. I chose Apple’s platform specifically because that’s what I’m most familiar with, both as a user and someone who keeps up with the latest frameworks available to iOS developers. Rather than design bespoke solutions, I have instead opted to use only native features built into Apple’s platform, such as App Intents and widgets. Urban Sports Club doesn’t currently utilize any of these features, making their user experience inferior to what a modern iOS app should offer.

I will loosely follow the UX design process as outline in [Google’s UX Design Certificate course](https://www.coursera.org/professional-certificates/google-ux-design), which I have recently completed.

Additional project details:

* **Problem**: Urban Sports requires their users to check-in to workout classes and fitness studios by scanning a QR code. Unfortunately, the app doesn’t offer an easy way to open the check-in screen in the app nor does it remind the user to do so.
* **Goal**: Design a set of improvements to Urban Sports Club iOS app that would help their users in the check-in process.
* **Timeline**: April 1-15th, 2025; 24 hours total
* **Author**: Daniel Marcinkowski, a multi-disciplinary tech professional with a UX Design Certificate from Google.

*Note: I have no association with Urban Sports Club. This project was meant to be a part of my UX design portfolio.*

<p><a class="btn btn-primary" href="https://www.icloud.com/keynote/05aNO-1n9LM-FH63CszFFwmiQ#Urban_Sports_Club_Check-In_Concept"><i class="ri-mail-line" aria-hidden="true"></i>Download Keynote Slides</a></p>

<figure class="wp-block-embed is-type-rich is-provider-embed wp-block-embed-embed"><div class="wp-block-embed__wrapper">
https://www.icloud.com/keynote/05aNO-1n9LM-FH63CszFFwmiQ#Urban_Sports_Club_Check-In_Concept
</div></figure>

## Introduction

I’m a huge fan of Urban Sports Club (USC). It really stands out among other sports membership services in Germany and Europe, offering its users access to thousands of venues for a relatively affordable monthly fee. Personally, I had a pretty good experience with the service. USC has allowed me to build and stay consistent with my exercise routine, [helping me get in the best shape of my life](/blog/getting-in-the-best-shape-of-my-life/). Last year alone, I have used USC to check into 300 different workout classes or fitness studios.

Still, Urban Sports is not perfect. One of its aspects that I find very poorly executed is its check-in experience. Users are required to scan a QR code located somewhere around the venue once they arrive there. The problem is that the USC app doesn’t seem to make this experience any easier for its users. The iOS version of the app, which I’m mostly familiar with, doesn’t send notifications to remind users to check-in for their class, nor does it offer widgets or support for quick actions, which would remove unnecessary steps to open the app’s QR code scanner.

The reason why I find this even more troubling is that Urban Sports doesn’t offer an ability to check-in after the workout is over. They will also not let you appeal a *no-show* in situations when you made it to the class and have proof from the partner that you did in fact complete the workout (like a screenshot from the BEAT81 app, one of USC’s biggest partners in Germany). As someone with [ADHD](/blog/what-ive-learned-about-living-with-adhd-so-far/) who gets easily overwhelmed in public spaces, I was forced to pay the 13€ no-show fee on at least three occasions despite attending a class just because I forgot to scan a QR code and tap “Check-in” in the app, which doesn’t make any effort whatsoever in reminding me to do so.

I find the current check-in experience of Urban Sports Club to be inaccessible, and I believe that the company should put more effort in making their apps more user-friendly. But, rather than just complain, I come with some meaningful insights and solutions.

<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-4-3 wp-has-aspect-ratio"><div class="wp-block-embed__wrapper">
https://youtu.be/TfCXNFIu568
</div></figure>

## Empathize With Users & Define Their Needs

I have started the design process by creating a survey to gather insights from other Urban Sports Club users in my network in terms of their own experience with the check-in process of the app. I then analyzed the answers with help of ChatGPT to create artifacts that will follow.

Unfortunately, I didn’t realize that Typeform now limits their forms to only ten answers in their free plan, so I ended up with a limited yet still insightful number of responses. Of course, Urban Sports could use quantitative data from their app performance metrics as well as qualitative research based on their users’ feedback which, I can only assume, would lead them to similar findings.

### User Research: Summary

I conducted a user survey and [competitive audit](https://docs.google.com/document/d/1_-lYhoyHEE2Z5DuCwfEBHkVx6EHkqUufEEPtONID_os/edit?usp=sharing) to understand the pain points users face with the current check-in process in the Urban Sports Club iOS app. My initial assumption was that users found the process slightly inconvenient — but the research revealed a deeper issue: **the current flow often causes users to forget to check in, resulting in frustrating no-show fees even when they’ve attended a class.**

### User Research: Pain Points

* **The app doesn’t assist or remind users to check in**: While the path to check in is technically clear, the app makes no proactive effort to help users remember to complete the process. This is particularly frustrating for users who are rushing, easily distracted, or neurodivergent. Future designs prioritize smart reminders and proactive prompts through iOS-native features like widgets and notifications.
* **No check-in fallback after class**: If a user forgets to check in during the session, there’s no way to do it afterward — even with proof of attendance. This rigidity leads to unfair €13 fees. To address this, the redesign introduces post-class fallback flows to allow recovery before leaving the venue.
* **Lack of accessibility for neurodivergent users**: The current flow assumes executive function: remembering the task, opening the app, navigating to check-in. It is not designed with users who have ADHD or cognitive overload in mind. Solutions focus on reducing steps, externalizing memory, and lowering cognitive load.
* **No support for native iOS features**: Urban Sports Club doesn’t use Apple-native features like widgets, Live Activities, App Intents, or Siri Shortcuts — missing a huge opportunity to simplify access and improve usability. The redesign leverages these tools to make the app feel more modern, faster, and integrated with users’ everyday habits.

### User Personas

You can find the full version of user personas, together with user journey maps, in the [Keynote slide deck](https://www.icloud.com/keynote/05aNO-1n9LM-FH63CszFFwmiQ#Urban_Sports_Club_Check-In_Concept).

![lisa](/images/case-studies/urban-sports-club/lisa-edited.jpg)

Generated with ChatGPT 4o

#### Lisa

Lisa is a busy, active professional who often arrives at her workout sessions feeling rushed and distracted. She needs a simple, automatic, or well-timed reminder to check in to her Urban Sports Club classes because she sometimes forgets to do it and ends up being unfairly charged, which creates frustration and breaks her trust in the app.

![martin](/images/case-studies/urban-sports-club/martin-edited.jpg)

Generated with ChatGPT 4o

#### Martin

Martin is a disciplined and detail-oriented user who values routine and efficiency. He needs a faster way to access the check-in feature in the app because the current navigation is slightly inconvenient, and he expects digital tools to align with his efficient lifestyle.

## Low-Fidelity Design

As my goal with the project was to utilize existing features of iOS, I decided to skip creating wireframes and lo-fi mockups and utilize [Apple’s iOS 18 UI Kit for Figma](https://www.figma.com/community/file/1385659531316001292) instead. Still, I have created big picture and close-up storyboards that illustrate the issues uncovered during the previous phase of the design process. Please admire my sketches:

<div class="image-grid image-grid-2">
  <figure>
    <img src="/images/case-studies/urban-sports-club/big-picture-storyboard-usc.jpg" alt="Big picture storyboard for the Urban Sports Club check-in concept">
    <figcaption>Big-picture storyboard</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/urban-sports-club/close-up-storyboard-usc.jpg" alt="Close-up storyboard for the Urban Sports Club check-in concept">
    <figcaption>Close-up storyboard</figcaption>
  </figure>
</div>

I have also created a detailed user flow diagram which includes both the current check-in flow of the Urban Sports app as well as my suggested changes. Please note that I have removed the step where the user needs to tap a button to confirm the check-in (right before they see a green confirmation modal), as it seems like USC has removed that step in the latest beta version of the app.

![user flow (with qr code scan necessary)](/images/case-studies/urban-sports-club/user-flow-with-qr-code-scan-necessary.png)

[View the full resolution version in Figma](https://www.figma.com/design/NVWTqqn4gGX1d4IHmnim8h/USC-Check-In-Fix?node-id=0-1).

## High-Fidelity Design

Thanks to the aforementioned [Apple’s iOS 18 UI Kit for Figma](https://www.figma.com/community/file/1385659531316001292) and [other design resources offered by Apple](https://developer.apple.com/design/resources/), I was able to create hi-fi mockups of what Urban Sports Club’s check-in experience could look like if they were to utilize modern framework offered by the latest version of iOS.

[Try the prototype in figma](https://www.figma.com/proto/NVWTqqn4gGX1d4IHmnim8h/USC-Check-In-Fix?page-id=11%3A492&node-id=28-4222&p=f&viewport=7477%2C1063%2C0.68&t=eQJbkXzRsB6KzCKq-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=28%3A4222)

### Lock Screen

Apple’s **Lock Screen Widgets**, **Live Activities**, and **Time Sensitive Notifications** (via [`WidgetKit`](https://developer.apple.com/documentation/widgetkit), [`ActivityKit`](https://developer.apple.com/documentation/ActivityKit/), and [`User Notifications`](https://developer.apple.com/documentation/usernotifications)) work together to bring the check-in experience directly to the user — before they even unlock their phone. A well-placed widget shows the next class, a notification reminds the user when it’s time to check in, and a Live Activity reminds a user of an upcoming booking.

This integration dramatically reduces cognitive effort for users who are rushing, distracted, or easily overwhelmed — especially those with ADHD. By surfacing the right action at the right time, we reduce the risk of a no-show fee without requiring users to hunt for the feature.

As a side note: it’s *technically* possible to launch Urban Sports Club from the Lock Screen or even by pressing the Action Button already by using the “Open App” Shortcut. Unfortunately, this will open either the default “Venues” page (if the app wasn’t stored in memory) or whatever last page the user was at.

<div class="image-grid image-grid-3">
  <figure>
    <img src="/images/case-studies/urban-sports-club/notifications-collapsed.png" alt="Collapsed Urban Sports Club notification concept">
    <figcaption>Collapsed notification</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/urban-sports-club/notifications-expanded-501x1024.png" alt="Expanded Urban Sports Club notification concept">
    <figcaption>Expanded notification</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/urban-sports-club/control-center.png" alt="Urban Sports Club control center shortcut concept">
    <figcaption>Control Center shortcut</figcaption>
  </figure>
</div>

### Control Center

With iOS 18, Apple allows apps to surface custom **Control Center controls** and replace **Lock Screen controls**. These are powered by [`App Intents`](https://developer.apple.com/documentation/appintents) and linked to app actions like “Open QR Scanner.”

This offers the most direct and universal access to check-in functionality — available from anywhere, even when the app is closed. For users who prefer speed and predictability, this single-tap experience eliminates hesitation and supports accessibility through reduced interaction complexity.

### Home Screen

**Home Screen widgets**, built using [`WidgetKit`](https://developer.apple.com/documentation/widgetkit), can show dynamic class info and link directly to check-in actions. When users prefer launching from the app icon, iOS’s **Quick Actions** surface app’s shortcuts via [`UIApplicationShortcutItems`](https://developer.apple.com/documentation/uikit/uiapplicationshortcutitem).

These features support diverse user behaviors: some users glance at widgets daily, others long-press icons to save time. Together, they make Urban Sports Club feel tightly integrated into the iOS ecosystem and reduce the number of taps to check-in to just one or two.

<div class="image-grid image-grid-3">
  <figure>
    <img src="/images/case-studies/urban-sports-club/home-screen.png" alt="Urban Sports Club home screen widget concept">
    <figcaption>Home Screen widget</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/urban-sports-club/quick-actions.png" alt="Urban Sports Club quick actions concept">
    <figcaption>Quick Actions</figcaption>
  </figure>
  <figure>
    <img src="/images/case-studies/urban-sports-club/spotlight-top-hit-siri-suggested-apps.png" alt="Urban Sports Club Spotlight search suggestion concept">
    <figcaption>Spotlight suggestion</figcaption>
  </figure>
</div>

### Spotlight Search

Through App Shortcuts powered by [`App Intents`](https://developer.apple.com/documentation/appintents), Urban Sports Club can now expose specific app actions directly in **Spotlight Search, Siri, and the Shortcuts app** — without any setup by the user.

This makes check-in feel as natural as searching for a song or setting an alarm. It’s particularly useful for power users and those who prefer search-first workflows. With minimal engineering effort, USC can unlock discoverability and native system-level integration.

### Accessibility Considerations

* **Designed for neurodivergent users and users with poor attention spans**: The redesigned check-in experience reduces cognitive load by externalizing memory through proactive reminders, lock screen widgets, and minimal-step actions — making it easier for users with ADHD or executive function challenges to stay on track.
* **Supports multiple interaction styles and mental models**: Whether users prefer tapping, searching, or glancing, the new features provide multiple pathways to check in. This flexibility helps users with varying attention spans, sensory preferences, or learning styles complete the task with less stress.
* **Built on native iOS frameworks for built-in accessibility**: By using Apple’s official frameworks like WidgetKit, App Intents, and ActivityKit, the redesigned features inherit iOS-level accessibility features like VoiceOver support, dynamic type scaling, and reduced motion settings — without requiring custom accessibility engineering.

## Next Steps

### What I learned

Based on my research, I was able to identify multiple improvements that could be made to the Urban Sports Club app on iOS that could have a major impact on the ease and accessibility of the check-in experience. All it would take is for Urban Sports Club to utilize frameworks like [`WidgetKit`](https://developer.apple.com/documentation/widgetkit), [`ActivityKit`](https://developer.apple.com/documentation/ActivityKit/), [`User Notifications`](https://developer.apple.com/documentation/usernotifications), [`App Intents`](https://developer.apple.com/documentation/appintents), and [`UIApplicationShortcutItems`](https://developer.apple.com/documentation/uikit/uiapplicationshortcutitem).

### Next actions

* Conduct a UX Research Study based on [the plan I have created](https://docs.google.com/document/d/1AfJrxha6I7KnjlwsucN6QG8MKTqZVeUjIdOnN63Xmqw/edit?usp=sharing)
* Add improvements to the new flow based on the results of the UX Research Study
* Implement the changes in the public beta release of the Urban Sports app before shipping to the public
* Conduct a similar research for the Android version of the app

---

That’s all! If you have any questions, don’t hesitate to reach out to my via email or on [LinkedIn](https://www.linkedin.com/in/meetdanielme/). If anyone from Urban Sports Club is reading this — I’m happy to meet your design team in Berlin anytime.
