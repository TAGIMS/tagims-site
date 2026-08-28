# TAGIMS Pricing Strategy

Status: PARKED / NOT READY FOR IMPLEMENTATION
Last updated: 2026-08-27

## Current Direction

TAGIMS is still in active architecture and product development. Do not implement Stripe billing, paid entitlements, or tier gating yet. Persistent Memory has not been implemented, and monetization should remain deferred until the core platform is further along.

## Pricing Ladder

- Free — $0/month
- Pro — $20/month
- Business — $50/month
- Managed — $180/month
- Enterprise — Custom pricing, future tier

## Tier Philosophy

### Free — Core
The free tier should be intentionally useful and impressive enough to demonstrate TAGIMS without a lengthy signup or sales process.

Includes the core TAGIMS experience and integrations. The current strategic direction is that integrations remain free rather than acting as the paid gate.

### Pro — Persistent Memory
Primary paid unlock: Persistent Memory.

Pro should become viable only after Persistent Memory is actually implemented and stable. The intended value proposition is that TAGIMS can remember the user and/or business across sessions rather than operating only from temporary session context.

### Business — Automation Layer
Primary paid unlock: broader automation capability.

Business is intended to sit above Persistent Memory and unlock more advanced scheduled or reusable business-process automation once that architecture exists.

### Managed — Custom Workflow Automations
Primary paid unlock: hands-on Custom Workflow Automations and managed configuration.

Managed pricing is intentionally low during the startup phase at $180/month. Pricing can increase later as TAGIMS gains integrations, automation depth, infrastructure, and support capability.

Major custom engineering work is not automatically included in this subscription and should remain separately quoted.

### Enterprise — Future
Enterprise will be introduced later for custom enterprise stacks, including bespoke architecture, advanced integrations, multi-agent systems, custom applications, security/permissions, dashboards, automation infrastructure, and ongoing engineering/support.

## Product / Service Revenue Model

The intended commercial model is:

Free product ecosystem -> paid capability upgrades -> add-ons -> custom services -> enterprise systems

Base subscription prices should remain approachable during startup. As infrastructure grows, additional value can be monetized through add-ons and higher tiers rather than pricing early users out of the platform.

Potential future add-ons may include higher AI usage, automation packs, premium integrations, advanced dashboards, team seats, voice features, additional agents, storage, reporting, custom connectors, and premium support.

## Current Product / Service Lineup

### Products
- TAGIM — primary AI operating assistant
- Ai16.0 — cloud-based friendly workhorse AI agent
- Rivet Legacy Companion — live desktop companion with mini-games and personal-buddy behavior
- Business Dashboard — business operating center
- Business AI Readiness Audit — AI/business diagnostic product

### Services
- AI & Digital Systems Consulting
- Web Development
- Custom Application Engineering
- Custom Workflow Automations
- AI Integration Services
- Systems Integration
- Managed AI Systems

## Deployment Strategy

Do not attempt to launch all paid tiers simultaneously.

Development should determine monetization readiness:

1. Core platform + integrations — Free
2. Persistent Memory becomes stable — Pro can be introduced
3. Automation layer becomes stable — Business can be introduced
4. Custom workflow management becomes operational — Managed can be introduced
5. Enterprise architecture matures — Enterprise can be introduced

Stripe already exists as the intended payment processor, but Stripe implementation is intentionally deferred until the first paid capability is ready.

## Current Decision

PAUSE monetization implementation.

Continue building TAGIMS architecture and user experience. Revisit pricing, Stripe, entitlements, upgrade triggers, usage limits, and billing flows when Persistent Memory is implemented and Pro is close to deployment.

## Rough Hypothetical Revenue Reference

These are illustrative scenarios only and are not forecasts or benchmarks.

- ~100 users during Memory beta: about $300/month in one hypothetical mix
- ~250 users after automation launch: about $1,200/month
- ~500 users after Managed launch: about $3,100/month
- ~1,000 users at a broader public stage: about $6,250/month

The working idea is that roughly $3K+/month within 6–8 months is possible as a hypothetical scenario if the platform reaches several hundred active users and paid features are deployed, but there is currently insufficient evidence to treat this as a projection.
