---
title: "Phone-Free Bedroom in a Smart Home"
description: ""
pubDate: 2020-02-06
slug: "phone-free-bedroom-in-a-smart-home"
tags:
  - "apple-homekit"
draft: false
heroImage: "/images/posts/2020/0gxUjt33EXFYK2DuK.jpg"
---

I’m trying to keep my use of technology as healthy as possible. I’ve been using features like Night Shift and Screen Time since they became available. They are an essential part of how I use my tech devices. But how does this approach translate to my smart home?

First of all, as I mentioned in my [previous articles](https://dmarcinkowski.pl/blog/category/smart-home/ "Smart Home"), I’m using automations based on motion sensors, location, and time of the day. That’s enough to, for example, make the lights turn on when my girlfriend and I are back home or turn off heating when we are out.

For most of the time, we control all of the devices just by talking to one of the Google Home Minis that we have or, simply, with our phones. When it comes to the bedroom, though, we don’t want to have a speaker with microphones in there. Same applies to our phones — we charge them in another room so that we aren’t tempted to use them before going to sleep or right after waking up. That created a problem — we were no longer able to toggle a _Goodnight_ scene that turns off all of the lights, heating, stops the music, etc.

As a temporary solution, every time before going to sleep, I had to take my Apple Watch off its charger, unlock it, and either ask Siri to toggle the _Goodnight_ scene or use a HomeRun complication. It worked but was far from being the ideal solution since I still had to use a device with a screen.

I decided to get yet another device to solve the problem — a HomeKit-enabled smart button. They usually offer three configurable actions: single, double, and a long press. For each of them, you can assign a string of HomeKit actions such as running a scene or controlling devices. The editor is exactly the same as the one for the HomeKit automations. Since I already have a Homebridge setup that enables me to use Zigbee devices without any additional bridges, I bought Xiaomi’s Single Button.

Setting it up was super simple. I paired the device with the CC2531 stick and identified its ID number using MQTTExplorer on my Mac. Then, knowing the button’s ID, I just had to add a few lines of code to my Homebridge config. I’m using the [MQTTthing plugin](https://www.npmjs.com/package/homebridge-mqttthing) to talk to [Zigbee2MQTT](https://github.com/Koenkk/zigbee2mqtt).

```
{
 “accessory”: “mqttthing”,
 “type”: “statelessProgrammableSwitch”,
 “name”: “Xiaomi Single Button”,
 “topics”: {
 “getSwitch”: {
 “topic”: “zigbee2mqtt/deviceIDnumber”,
 “apply”: “return JSON.parse(message).click;”
 }
 },
 “switchValues”: [
 “single”,
 “double”,
 “long_release”
 ]
 }
```

After restarting the Homebridge server, the button appeared in the Home app right away and was ready for configuring. To solve the _Goodnight_ scene problem I mentioned earlier, I just added the scene to a long press action.

![](/images/posts/2020/1*-PbBbQh2vyWoQYxgUnDJ2w.gif)

When I wanted to set up another action, I ran into a very stupid limitation of HomeKit: it’s only possible to add one action per each of the button’s states. For example, if you want to toggle a light between the on and off states, you have to set up two separate actions, like a single press for turning on the light, and a double press for turning it off. Fortunately, since iOS 13, there’s a workaround for the limitation. It’s now possible to convert HomeKit actions into shortcuts, which opens a countless number of possibilities. By setting up a shortcut that uses an _If_ statement, we are now able to turn our bedside lamps on if they’re off, and vice versa .

![](/images/posts/2020/0t99hUGMLjiOqvxGI.png)

Now, the button is stuck to our bed’s frame. That’s what it takes to have a phone-free bedroom when you live in a smart home 💁
