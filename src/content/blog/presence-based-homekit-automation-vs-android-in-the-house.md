---
title: "Presence-Based HomeKit Automation vs. Android In The House"
description: "Triggering Apple HomeKit automations with an Android phone? Possible."
pubDate: 2022-01-29
slug: "presence-based-homekit-automation-vs-android-in-the-house"
tags:
  - "Smart Home"
draft: false
heroImage: "/images/posts/2022/10N5dy6LkKM6YZ7pr_iSESg.jpg"
---

**Spoiler:** [**you will need Homebridge**](https://dmarcinkowski.pl/blog/homekit-homebridge-raspberrypi)**.**

Suppose you’re into home automation, but you live with someone who doesn’t use the same mobile operating system as you do. In that case, you know exactly how limiting it can be. In my case, I use an iPhone, but I didn’t manage to convert my girlfriend from Android just yet (I’m working on it). This makes it almost impossible to run presence-based automations in HomeKit. But there are some workarounds.

My first attempt to approach this problem was using the Tado Platform plugin for Homebridge. It can create virtual occupancy sensors based on Tado’s app geofencing. It worked… until my girlfriend’s Xiaomi phone started killing the Tado app running in the background despite following all of [Tado’s troubleshooting steps](https://support.tado.com/en/articles/3405599-how-do-i-enable-the-location-based-services-on-android-6-or-higher).

I went with another [Homebridge plugin called people](https://www.npmjs.com/package/homebridge-people), which creates virtual occupancy sensors based on IP addresses of connected Wi-Fi devices. It works slightly slower than Tado’s geofencing, but it’s fast enough to activate home automations when my girlfriend or I get back home.

<figure>

![Virtual occupancy sensors created using homebridge-people](/images/posts/2022/1QPFHQA7q-Sz-ivNS8y8vYA.jpg)

<figcaption>

Virtual occupancy sensors created using homebridge-people

</figcaption>

</figure>

Creating virtual occupancy sensors is a good start. For example, it’s possible to set up automations for leaving or arriving back at home, like this:

<figure>

![Automation using homebridge-people virtual sensors](/images/posts/2022/1ZJDiYXsKs02Nb4ciBiPw9A.jpg)

<figcaption>

Automation using homebridge-people virtual sensors

</figcaption>

</figure>

Unfortunately, it’s not possible to include the virtual occupancy sensors in time-based automations. For these, you have to use HomeKit’s people detection feature.

<figure>

![HomeKit default “People” automation options](/images/posts/2022/1Clb6rwIt6KzbWcZ8nJ8-eg.jpg)

<figcaption>

HomeKit default “People” automation options

</figcaption>

</figure>

Luckily, there’s yet another workaround — **condition-based automations offered by the** [**Eve app**](https://apps.apple.com/app/elgato-eve/id917695792). Here’s how it works:

1. In the Eve app, go to the _Automation_ section and then switch to the _Rules_ tab;

3. Select one of the existing time-based automations. You can also create a new automation, but then you need to create or use a HomeKit scene;

5. Go to _Conditions_ and tap _Add Value Conditions_. Select the virtual occupancy sensor that you want to use. I created one for anyone to avoid creating separate conditions for each person.

<figure>

![Setting up a condition-based automation in the Eve app](/images/posts/2022/1Ba4h3INIsN2e8frwh0Cw7g.jpg)

<figcaption>

Setting up a condition-based automation in the Eve app

</figcaption>

</figure>

And that’s it — you can now use presence-based automations in HomeKit, even if your partner won’t give up using an Android phone.
