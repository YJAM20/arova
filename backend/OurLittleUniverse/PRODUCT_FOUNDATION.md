# Arova Product Foundation

## Product Identity

Arova is a private shared space for two people in a relationship.

## Modes

- Local Mode: future frontend mode where data can stay on-device.
- API Mode: ASP.NET Core backend mode with SQLite for local development.

## Product Profiles

- `Portfolio`: safe for public GitHub. Uses placeholders for payments, SMS, and external auth.
- `Product`: future deployment-ready profile. Real providers can be configured later.

## Plans

One subscription covers one couple.

- Free: core shared space features.
- Pro: deeper personalization and relationship rituals.
- Platinum: advanced privacy, planning, insights, and media placeholders.

`POST /api/plans/gifted-upgrade` grants Pro or Platinum as gifted access without payment.

No Stripe, PayPal, or payment processor is implemented.

## Feedback

`POST /api/feedback` stores private feedback. Spam protection and moderation should be added before public launch.

## Expanded Features

- **Planets System**: 10 active planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Kepler) with 3 tasks each. Daily rolls assign a random planet for the day. Completions reward couple points.
- **Relationship Score & Daily Tasks**: Gamified progression from Spark (0 pts) up to Eternal Orbit (5000+ pts). Daily tasks are seeded with a pool of 15 templates deterministically selected each day.
- **Custom Sections & Lists**: User-created checklists. Strict plan-scoped limits: 1 section for Free, 5 for Pro, and 20 for Platinum.
