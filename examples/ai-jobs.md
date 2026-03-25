# AI Jobs

## Pair 01
Original tweet:
Software horror: litellm PyPI supply chain attack.

Simple `pip install litellm` was enough to exfiltrate SSH keys, AWS/GCP/Azure creds, Kubernetes configs, git credentials, env vars (all your API keys), shell history, crypto wallets, SSL private keys, CI/CD secrets, database passwords.

LiteLLM itself has 97 million downloads per month which is already terrible, but much worse, the contagion spreads to any project that depends on litellm. For example, if you did `pip install dspy` (which depended on litellm>=1.64.0), you'd also be pwnd. Same for any other large project that depended on litellm.

Afaict the poisoned version was up for only less than ~1 hour. The attack had a bug which led to its discovery - Callum McMahon was using an MCP plugin inside Cursor that pulled in litellm as a transitive dependency. When litellm 1.82.8 installed, their machine ran out of RAM and crashed. So if the attacker didn't vibe code this attack it could have been undetected for many days or weeks.

Supply chain attacks like this are basically the scariest thing imaginable in modern software. Every time you install any depedency you could be pulling in a poisoned package anywhere deep inside its entire depedency tree. This is especially risky with large projects that might have lots and lots of dependencies. The credentials that do get stolen in each attack can then be used to take over more accounts and compromise more packages.

Classical software engineering would have you believe that dependencies are good (we're building pyramids from bricks), but imo this has to be re-evaluated, and it's why I've been so growingly averse to them, preferring to use LLMs to "yoink" functionality when it's simple enough and possible.

Quote tweet:
🚨 Andrej Karpathy just explained the scariest thing happening in software right now..

someone poisoned a Python package that gets 97 million downloads a month.. and a simple pip install was enough to steal everything on your machine..

SSH keys.. AWS credentials.. crypto wallets.. database passwords.. git credentials.. shell history.. SSL private keys.. everything..

and here's the part that should terrify every developer alive..

the attack was only discovered because the attacker wrote sloppy code.. the malware used so much RAM that it crashed someone's computer.. if the attacker had been better at coding.. nobody would have noticed for weeks..

one developer.. using Cursor with an MCP plugin.. had litellm pulled in as a dependency they didn't even know about.. their machine crashed.. and that crash saved thousands of companies from getting their entire infrastructure stolen..

Karpathy's take is the real wake up call.. every time you install any package you're trusting every single dependency in its tree.. and any one of them could be poisoned..

vibe coding saved us this time.. the attacker vibe coded the attack and it was too sloppy to work quietly.. next time they won't make that mistake.

## Pair 02
Original tweet:
Microsoft CEO: The biggest obstacle to expanding artificial intelligence is persuading people to change the way they work.

Quote tweet:
🚨 the CEO of Microsoft just said the biggest obstacle to AI isn't the technology.. it's convincing people to change how they work..

Satya Nadella runs a company that invested $13 billion in OpenAI.. spent another $80 billion on AI infrastructure this year.. and his biggest problem isn't the tech.. it's that people won't use it..

let me translate what he actually means..

"we built the replacement.. now we need you to train it before we let you go"..

because that's what "changing the way you work" means when the new way involves an AI doing 80% of it.. you're not adapting.. you're onboarding your successor..

Microsoft doesn't need you to change how you work.. they need you to document how you work so Copilot can learn it.. then they need your manager to realize Copilot costs $30/month and you cost $6,000..

the obstacle isn't resistance.. the obstacle is that people can do math.

## Pair 03
Original tweet:
New in Claude Code: auto mode.

Instead of approving every file write and bash command, or skipping permissions entirely, auto mode lets Claude make permission decisions on your behalf.

Safeguards check each action before it runs.

Quote tweet:
🚨 Do you understand what just happened on your timeline..

Karpathy warned that downloading one piece of software can steal every password and crypto wallet on your computer.. 97 million people were exposed..

60 minutes later.. Anthropic announced their AI can now run commands on your computer without asking permission..

one said the software you trust is stealing your data.. the next said let the AI decide what's safe..

the question isn't whether AI should have permissions.. the question is whether anyone should.

## Pair 04
Original tweet:
Bernie Sanders has said:

Jeff Bezos, worth $234 billion, plans to replace 600,000 Amazon workers with robots.

Now, he wants to spend $100 billion to fully automate not just his warehouses, but factories in the U.S & other countries.

Oligarchs are waging all out war against workers. FIGHT BACK.

Quote tweet:
🚨 Bernie Sanders just said what everyone's thinking but nobody with money will say..

Jeff Bezos is worth $234 billion.. plans to replace 600,000 Amazon workers with robots.. and is raising $100 billion to buy factories and automate them..

he's not building jobs.. he's buying companies to delete them..

the same man whose workers pee in bottles because they can't take bathroom breaks is now spending $100 billion to make sure they don't need bathrooms at all..

and here's the question nobody's answering.. when 600,000 people lose their income.. who's buying from Amazon..

you can automate the workforce.. you can't automate the customer.

## Pair 05
Original tweet:
You can now enable Claude to use your computer to complete tasks.

It opens your apps, navigates your browser, fills in spreadsheets—anything you'd do sitting at your desk.

Research preview in Claude Cowork and Claude Code, macOS only.

Quote tweet:
🚨 Claude just shipped an AI that controls your entire computer.. opens apps.. browses the web.. fills spreadsheets.. while you're not even there..

that's OpenClaw's entire product.. shipped as a Monday night feature update..

Anthropic didn't buy them.. they replaced them..

every startup building on top of AI just watched their whole company become someone else's changelog.

## Pair 06
Original tweet:
Meta CEO Mark Zuckerberg is creating a CEO agent to assist him in his job, per WSJ

Quote tweet:
🚨 do you understand what Mark Zuckerberg just did..

he fired 21,000 employees.. told them AI could do their jobs..

then he built an AI agent.. to do HIS job..

the CEO of a $1.5 trillion company just admitted that even HE can be automated..

first they came for the workers.. then the managers.. then the executives.. and now the guy at the top is building his own replacement..

but he won't fire himself.. he'll just call it "augmentation".. funny how it's always "replacement" when it's your job and "augmentation" when it's theirs..

## Pair 07
Original tweet:
JPMorgan Dimon: t AI could create a four-day work week in the future

Quote tweet:
🚨 Do you understand what Jamie Dimon just said on camera..

the CEO of JPMorgan.. the biggest bank on earth.. just said your kids are going to work 3.5 days a week and live to 120..

sounds beautiful right..

then he said AI has 600 use cases inside JPMorgan already.. 50 he considers "important".. risk, fraud, underwriting, marketing,. note-taking.. error reporting..

he said companies need to think about how they handle the layoffs... and the government should think about retraining,.. relocation nd reskilling people at 40 and 50..

the same man whose bank said $40 to $150 billion in loans could collapse because AI is replacing the workers who pay them back... is now telling you it's going to be "wonderful"..

he's preparing for a world where you work less.. earn less.. and need the government to retrain you for a job that doesn't exist yet...

and he called it a wonderful thing.. because for JPMorgan.. it is.

## Pair 08
Original tweet:
The first criminal case of streaming fraud where a North Carolina musician who used AI to make songs, then streamed them billions of times himself making $8 million

Quote tweet:
🚨 Do you understand what this man just pulled off..

> a guy from North Carolina used AI to generate hundreds of thousands of songs.. uploaded them to Spotify, Apple Music, Amazon.. then botted billions of streams on his own tracks and walked away with $8 million

> 660,000 fake streams per day.. spread across thousands of AI songs so nobody noticed.. $1.2 million a year.. for music no human ever actually listened to

real artists are out here grinding for 0.003 cents per stream.. promoting on TikTok.. begging for playlist placements.. and this guy just had AI make the music AND the audience

first-ever criminal streaming fraud case.. he's paying back $8 million.. but the playbook is out there now.. and AI just got better since he started

the music industry spent 10 years fighting piracy.. now they have to fight songs that don't exist being listened to by people who don't exist.

## Pair 09
Original tweet:
Projects are now available in Cowork.

Keep your tasks and context in one place, focused on one area of work. Files and instructions stay on your computer.

Import existing projects in one click, or start fresh.

Quote tweet:
🚨 Do you understand what Claude just dropped..

you can now give AI an entire project.. your files.. your instructions.. your context.. and it stays on your machine.. not in the cloud.. not on their servers.. on YOUR computer

import an existing project in one click.. or start fresh.. and it remembers everything about that project every time you come back

the same week Bernie Sanders grilled AI about stealing your data.. Claude just shipped a feature that keeps everything local.. your files never leave your machine

whether that's coincidence or strategy.. the timing is insane

## Pair 10
Original tweet:
JASON: “Elon seems to think we're gonna have one robot for every human.”

JENSEN HUANG: “I'm hoping more … We're millions of people short in labor today. We're actually really desperately in need of robotics. All of these companies could grow more if they had more labor.”

Quote tweet:
🚨 Do you understand what Jensen Huang just said on stage..

they asked him about one robot per human.. he said "I'm hoping more"..

then the interviewer said something nobody's talking about.. he said when everyone gets a robot.. it's like when everyone got a car.. you can do more jobs.. start a store.. build things you can't build alone..

and on paper that sounds beautiful..

but the last time they said "everyone gets one".. it was the internet.. and 5 companies own it.. the last time they said "this unlocks freedom".. it was the gig economy.. and you're delivering food in the rain for $4..

so which one is it..

is the robot YOUR employee.. or are YOU the robot's task..

because Jensen also said we're "millions of people short in labor".. he didn't say "people deserve help".. he said companies could "grow more if they had more labor"..

that's not a human argument.. that's like.. should I say a spreadsheet argument..?

I genuinely don't know if this is the best thing that ever happened to humanity or the worst.. and neither do you.. and that's the part that should terrify both sides.

## Pair 11
Original tweet:
"Anywhere from $40 billion to $150 billion of leveraged loans packaged into US collateralized loan obligations could be disrupted by the AI boom," per JPMorgan

Quote tweet:
🚨 Do you understand what JPMorgan just said in plain English..

Stop scrolling and read..

$40 to $150 billion in loans.. the ones that funded companies that hired humans to do jobs.. are about to blow up because AI is replacing the humans that generated the revenue that paid back the loans

read that again..

> AI replaced the workers.. the companies made less money from human labor.. the loans backing those companies can't get repaid.. and now the financial products built on top of those loans are about to collapse

this is the chain nobody's connecting..

> AI takes your job.. your company's revenue model changes.. the debt that funded your company breaks.. the CLO holding that debt cracks.. and the pension fund that bought that CLO.. that's your retirement

it went from "AI will take some jobs" to "AI might collapse the credit market" in about... 18 months yeah.. or less

2008 was banks gambling on houses.. 2026 is banks gambling on humans still having jobs. and they're losing that bet...

## Pair 12
Original tweet:
JUST IN: WNBA player Kelsey Plum launches AI digital twin, will charge fans to interact with a chatbot that has her voice and personality.

Quote tweet:
🚨 Do you understand what you're watching happen right now..

Kelsey Plum, a WNBA player just launched an AI clone of herself.. fans pay to talk to a chatbot that has her voice and her personality.. 24/7.. while the real one sleeps.

two days ago they announced Val Kilmer is starring in a new movie.. Val Kilmer is dead.. died last year at 65.. battled throat cancer for a decade..

they're using AI to resurrect him for a film called "As Deep As the Grave".. you can't make this up

connect the dots..

right now it's one athlete selling a chatbot.. one dead actor getting digitally dug up for a movie.. but give it 18 months.. every A-list actor will have an AI twin trained on every scene they've ever shot.. every expression.. every inflection.. every mannerism

and you won't know the difference

## Pair 13
Original tweet:
We literally just launched the first agentic
self improving vibe marketer

> you connect your agent to viewtrack

>send it any account or video ( x, ig, tt , yt )

>it tracks all videos from that account daily

>your agents brain become a library of viral content

>congrats you now have a machine that
can help you scale to $50k/mo effortlessly

try it out here: https://viewtrack.app

Quote tweet:
🚨 Do you understand what just launched today

This softwares watched thousands of reels for you and automates Taste

Someone built an AI agent that watches viral content across X, Instagram, TikTok, YouTube.. tracks every video from any account you point it at.. daily.. and feeds it into your agent's brain

so now your AI doesn't just write content.. it studies what's already working.. learns the patterns.. the hooks.. the timing.. and builds a library of what goes viral before you even wake up

this is the part that should bother you..

the creators winning right now aren't outworking you.. they're out-systemed you.. they have machines watching thousands of videos a day while you're manually scrolling trying to "find inspiration"

you're competing against people who automated taste.

http://viewtrack.app if you want to stop guessing.

## Pair 14
Original tweet:
New businesses are creating fewer jobs... due to AI, per Bloomberg.

Quote tweet:
🚨 Do you understand what this means..

Startups was supposed to be the exit.. you get fired, you go build something, that was the deal..

new businesses are creating fewer jobs.. per Bloomberg

the companies people are starting now.. run leaner from day one

AI handles what used to be the first 5 hires

no junior dev.. no marketing coordinator.. no ops person..

so the big companies are cutting with AI.. and the startups that were supposed to absorb those people.. aren't hiring either..

you used to get fired and become a founder
now you get fired and the thing you'd build.. already runs itself with a $20/month subscription

the exit door leads back to the same room.

## Pair 15
Original tweet:
"Massive investment in AI contributed basically zero to US economic growth last year," per Goldman Sachs

Quote tweet:
🚨 Let me tell you why this Goldman Sachs headline is the most dangerous one you'll read today..

Companies spent $450 billion on AI last year.. fired tens of thousands of people to "restructure around AI".. replaced entire departments with chatbots..

And Goldman Sachs just said it contributed basically zero to economic growth..

so where did the money go?

> It went to Nvidia.. $130 billion in GPU sales.. Jensen is the only man on earth who got rich from AI that hasn't produced anything yet..

> It went to stock buybacks.. companies fired people, cut costs, reported "record profits" and bought back their own shares.. the money went UP not OUT.. Jesus!

> It went to a bubble.. the same way crypto money went to Lamborghinis and not infrastructure.. AI money is going to valuations and not productivity..

here's the part that should terrify you..

They already fired the people.. Atlassian 1,600.. Meta 21,000.. Block 40%.. Amazon warehouses.. the jobs are already gone..

But the growth didn't come.. the productivity didn't come.. the revenue didn't come..

they burned the village to build a city that doesn't exist yet..

and Goldman Sachs just looked at the empty lot and said "there's nothing here"

## Pair 16
Original tweet:
BREAKING: Jeff Bezos is reportedly in talks to raise $100B for a new fund aimed at acquiring manufacturing firms and automating them with AI, per WSJ.

Quote tweet:
🚨 Let me explain what Jeff Bezos is actually doing here..

> He already automated the warehouse workers with 750,000+ robots.. replaced checkout cashiers with cameras.. tested drone delivery.. built robots that move faster than humans..

> Now he's raising $100 billion to BUY entire manufacturing companies.. not to run them.. to automate them..

he's not investing in factories.. he's buying them to empty them..

> This is a man who built Amazon by undercutting every small business in America.. who crushed bookstores, malls, and retail chains.. who made same-day delivery possible by burning through workers so fast they literally ran out of people to hire in some cities..

> And now he's coming for the last thing left.. the factory floor.. the one place people said "AI can't do this.. you need human hands"..

$100 billion.. not to create jobs.. to buy the companies that have them and remove the people inside..

your factory job survived the recession.. survived outsourcing.. survived COVID.. it won't survive a billionaire with a shopping list and a robot..

## Pair 17
Original tweet:
Nearly half of companies are opting for weak “peanut butter” pay raises, mirroring the 2008 recession trend, per FORTUNE.

Quote tweet:
🚨 Let me explain what happened in 2008 because nobody's connecting the dots..

> In 2008 companies started giving out "peanut butter raises." Tiny pay bumps spread thin across everyone so nobody felt special but nobody could complain either..

> Then mass layoffs hit.. 2.6 million jobs gone in a single year...

its crazy the raises weren't generosity.. they were the quiet part before the loud part.. Companies were buying time while they figured out who to cut..

> Now Fortune is reporting the exact same pattern is back... Nearly half of companies are doing peanut butter raises again right now..

But here's what's different this time

> In 2008 they laid you off and hired someone cheaper... The job still existed... Someone still sat in your chair

> In 2026 they lay you off and nobody sits in your chair. The chair is gone... The desk is gone... A $20/month AI subscription is doing what you did and it doesn't need a raise next year either..

> Forbes just reported 93% of US jobs can be partly done by AI.. Same day... Same week companies started freezing pay..

Last time this happened millions of Americans lost their jobs

This time the jobs aren't coming back. there's no recovery hire... the job itself stops existing.. AI is eating them all

The peanut butter raise is the last nice thing they'll ever do for you. Enjoy it

## Pair 18
Original tweet:
JUST IN: DoorDash rolls out new app that pays people to film themselves doing chores for AI training data.

Quote tweet:
🚨 Let me make sure you understand what DoorDash just did..

They built a $70 billion company by paying people $3 to deliver food in the rain..

Now they're paying those same people to film themselves doing chores.. mopping floors.. folding laundry.. loading dishwashers..

Not for content.. for AI training data..

they're paying you to teach the robot how to be you.. so they don't have to pay you anymore..

First they paid drivers to prove people would order food to their door.. then they started testing drones and robots to replace the drivers..

Now they're paying people to record their own bodies doing physical tasks so the AI can learn the movements...

this is the Uber playbook on steroids..

> Use the human to build the demand..
> Use the human to train the replacement..
> Remove the human..

DoorDash are paying you to film your own obsolescence..

and you're going to do it.. because rent is due..

## Pair 19
Original tweet:
JUST IN: Uber to invest as much as $1.25 billion in Rivian to launch a “robotaxi fleet.”

Quote tweet:
🚨 Let me explain what Uber just did because nobody's going to frame it this way..

> In 2009 Travis Kalanick launched Uber with a simple pitch.. "everyone deserves a private driver".. He needed millions of regular people to quit their jobs and drive strangers around..

> Drivers took out car loans.. left stable jobs.. drove 14 hour shifts.. Uber took 20% and quietly pushed it past 50%" and called them "independent contractors" so they didn't have to pay benefits..

> Drivers protested.. sued.. begged for basic wages.. Uber fought every single lawsuit.. spent billions on lobbyists to keep them classified as gig workers not employees..

The drivers WERE the product.. not the customers.. Uber needed them to prove that people would get in a stranger's car.. that was the experiment..

> Today Uber just announced a $1.25 billion investment in Rivian to build a robotaxi fleet..

$1.25 billion.. not to pay drivers more.. not to give them benefits.. to replace them entirely..

> every driver who worked 14 hour shifts.. who skipped weekends with their kids.. who kept their rating above 4.8 so they wouldn't get deactivated.. they were proving the model works.. they were building the demand.. they were showing Uber exactly where people go, when they go, and how much they'll pay..

and now that the demand is proven and the data is collected.. Uber just launched an entire division called "AV Labs" to collect driving data for robotaxis..
