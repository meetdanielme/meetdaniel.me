---
title: "How I automated my flat using Apple HomeKit and Google Home"
description: ""
pubDate: 2020-01-20
slug: "how-i-automated-my-flat-using-apple-homekit-and-google-home"
tags:
  - "apple-homekit"
  - "google-home"
draft: false
heroImage: "/images/posts/2020/1XOOEyzuOhZGpqY2ouq72XQ.webp"
---

My first experience with a smart home was at my parent’s apartment. My dad ordered a bunch of devices and sensors from China that allow them to control their lights, set thermostats, open and close blinds — all by using Amazon Echo speakers. I was very much impressed by how they were able to control everything just by talking to Alexa.

Sometime after that, I got an [Apple HomePod](https://dmarcinkowski.pl/blog/homepod-is-great-dont-buy-it/ "HomePod is great. Don’t buy it."). At first, I was using it only as a speaker, occasionally using it to set timers or make calls. Then, a few months later, I got an IKEA Trådfri light bulb. Suddenly, I got a glimpse of the same experience I had whenever I visited my parents — I was able to control light in my room just by talking to Siri. It was light years from my parent’s setup but got me excited about what’s possible to do in my own space.

Skipping forward another few months and moving to a new flat with my girlfriend, I’ve gotten to a point where I have more or less the same experience as I had a few years ago when I visited my folks. I’m able to control lights, set temperature in the apartment, turn on the TV, play music, and more — all using voice commands or automations I set.

So what’s possible with HomeKit and what’s the best place to start? Here’s my take on it.

<figure>

![Screenshot of Apple Home app on an iPad](/images/posts/2020/1fQCWYbognqQR1UpN-S6RCg.png)

<figcaption>

My current setup im Apple Home app

</figcaption>

</figure>

## Smart lights, controllers, and motion sensors

As I mentioned above, my setup started with a lightbulb from IKEA. Currently, we have 7 of them, in every room of our apartment but the bathroom and the hallway. There we have GU10 LEDs that are quite pricey to replace (although I’m looking into making the light switches themselves smart). Most of the bulbs are only dimmable, without an option to change the colour or temperature. The first lightbulb I bought was an RGB one, but we rarely change the colour of it. I’d recommend getting temperature-changing bulbs, though — it’s great to be able to adjust the temperature in the evening to reduce your blue light exposure (kind of like Night Shift on Apple devices).

<figure>

![IKEA Trådfri lightbulb with LED filament that we use on our nightstands](/images/posts/2020/13QHrmo8XrQwTgYpCN062pA@2x.jpg)

<figcaption>

IKEA Trådfri lightbulb with LED filament that we use on our nightstands

</figcaption>

</figure>

To use IKEA’s smart lighting, every room needs a compatible controller. Unfortunately, compared to the bulbs, the controllers are not HomeKit-compatible, but they are still required to pair bulbs with an Internet Gateway. In most of the rooms, we are using a new on-off switches with dimming feature. It works really well and looks much nicer than an original remote control that we have in our bedroom.

IKEA also sells a motion sensor that can be used as a controller, but, again, it’s not HomeKit-compatible. But, thanks to Raspberry Pi, [Zigbee2MQTT](https://www.zigbee2mqtt.io/), and [Homebridge](https://github.com/nfarina/homebridge) server, I managed to get it to work in Apple Home app, but that’s a story for another article. We have another motion sensor from Onvis in our bedroom (with additional temperature and humidity sensors) that natively supports HomeKit.

<figure>

![IKEA Trådfri motion sensor](/images/posts/2020/1imQA9xIY1aHL7VEPGpynAQ.jpg)

<figcaption>

IKEA Trådfri motion sensor

</figcaption>

</figure>

Lights are one of the first things I automated. For example: when we are back home in the evening, light in the kitchen will turn on. Or in the morning, our bedside lamps will turn on right before an alarm. Additionally, once we are up, bedroom motion sensor will activate the overhead light for a few minutes, and another sensor in the kitchen will turn on a Bluetooth speaker connected to Google Home once we enter the room. When the last person leaves the flat, all of the lights and other devices will turn off.

## Thermostats

I always wanted to be able to automate controlling the temperature in my apartment. Not long after moving into the new flat, we got four tado° thermostats. First of all — I personally think that they look amazing. Simple, minimalistic design with LEDs showing the set temperature. Second — they are incredibly smart. tado° has its own geofencing feature that turns the heating on or off based on our location. When we are getting closer to our flat, the temperature starts rising. Besides that, every room has a schedule that we have set based on our habits, but location-based settings can have priority over that. Setting the temperature via Google Home or Apple Home apps is recognised by tado° as a manual control that can change the temperature for a certain amount of time or until the next automation — based on a selected setting.

<figure>

![tado° Smart Radiator Thermostat](/images/posts/2020/1um3z2sWS67zA1a8wBIpw3A.jpg)

<figcaption>

tado° Smart Radiator Thermostat

</figcaption>

</figure>

I’d go as far as saying that **smart thermostats are something people should invest in before getting any other IoT devices**, such as light bulbs. They have way bigger impact on our lives. Something as simple as having the bathroom automatically warm up in the evening before going in to take a shower is just amazing. Also, using such a system can save you a lot of money in a long run. tado°‘s app sends you a report after every month, highlighting how you used the system and how much you saved.

## Speakers

Since my girlfriend uses an Android phone, I thought that keeping the HomePod wasn’t really a good option, so I sold it and replaced with three IKEA Symfonisk Bookshelf speakers made in collaboration with Sonos — two for a stereo setup in the living room, and one for the bedroom. Overall — they are great! We have a Sonos One speaker in my office, and IKEA’s speakers sound as good as that one ([they are almost identical inside as well](https://youtu.be/ZB413S8KDmo)). I love that the speakers work with AirPlay 2 and I can simply ask Siri to play music on them.

<figure>

![IKEA Symfonisk Bookshelf speaker](/images/posts/2020/1qz4uAD3tlkjwmA0ueB_8_w.jpg)

<figcaption>

IKEA Symfonisk Bookshelf speaker

</figcaption>

</figure>

When it comes to the smart speakers, we have two Google Home Minis — one in the kitchen, and one in the living room. And to be totally honest, I think that the HomePod, even with hated-by-many Siri on board, is much more reliable than the Google Homes with Google Assistant. We always find ourselves repetitively shouting _Hey Google_ to get the speaker to start listening. It often gets my not-so-perfect pronunciation wrong, sets alarms instead of timers, doesn’t recognise our voices, and more. I never had that many problems with my HomePod. Also — the Google Home app is very basic compared to Apple Home. OK, there are a lot of integrations available, but there’s no support for sensors of any kind, which makes it impossible to set automations. There is the _Routines_ feature, but for some reason, even after dozens of messages exchanged with the Google Nest support on Twitter, I still can’t set custom ones. And there’s no support for Apple Music on Google Home devices, which is still my streaming platform of choice. I’m quite disappointed with the overall experience of using Google’s platform.

One thing I like about Google Home Minis, though, is an ability to pair Bluetooth speakers with it. Thanks to our utility provider, we got two UE BOOM 3 speakers, one of which we have in the kitchen, paired with the Mini. I found a convenient [plugin for Homebridge](https://www.npmjs.com/package/homebridge-ueboom) that allows us to turn on the speakers and automatically connect to Google Home. Turning the speakers off is not possible at the moment, but they turn off automatically after 15 minutes of inactivity anyway.

## Occupancy and contact “sensors”

One thing I want to go intomore deeply in a separate post is another [Homebridge plugin](https://www.npmjs.com/package/homebridge-tado-platform) that exposes additional sensors from tado° thermostats. Thanks to the geofencing feature, we can have virtual occupancy sensors that determinate who’s at home, which makes it possible to include my girlfriend’s phone in HomeKit automations, even though she uses an Android device.

tado° can notify you when windows were open, based on sudden drops of temperature and humidity. The plugin I mentioned above makes it possible to see these _sensors_ as HomeKit devices.

## Television

We don’t watch movies and TV shows often so that we just got a 9 year old TV from my parents which is all we really need. In addition to that, I got an Apple TV that I’m also using as a Home Hub for HomeKit automation and controlling all of the devices remotely, and a Chromecast. We also have an Xbox One that actually supports Google Assistant out of the box — I can just ask Google Home to turn it on and even launch a specific game. I also found yet another [Homebridge plugin](https://www.npmjs.com/package/homebridge-smartglass) that allows me to do the same thing in the Apple Home app.

## What’s next for my setup?

First, I’d like to be able to set a _Goodnight_ scene that turns everything off with a press of a physical button, since we don’t keep our phones in the bedroom (I know, first world problems). To solve that, we ordered a cheap button from Xiaomi that I’m going to add to Homebridge using Zigbee2MQTT.

Otherwise, I’m really happy with how much we’ve been able to automate our flat. For sure, there will be some other things I’d like to add to the setup, but time will tell.
