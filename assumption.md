# Assumptions & design notes

A few decisions I made while building this, and why.

### "Manager" isn't a role — it's derived from the hierarchy

I went back and forth on this one. The obvious first instinct is to give
`User` a `role: manager` option alongside `employee` and `hr`. But that
breaks immediately at Ashoka Textiles: Priya gives feedback to her 6 reports
*and* receives it every month from Rohan. If "manager" were a role, Priya
would need to be both a manager and an employee at once, which usually means
either two accounts (messy) or a role that doesn't actually mean anything
consistent.

So instead, `User` only has `employee` and `hr` as roles, and `managerId` is
a self-reference. Whether someone is "a manager" for a given cycle is just a
query — do any other users have their `managerId` pointing at me? This is
what makes Priya, Rohan, and even the COO fall out of the same schema
without special-casing, and it's also why Bright Path's flat structure
(founder → 8 people, no middle layer) needs zero extra modeling — it's the
same tree, just shallower.

### Assignments are generated once per cycle, not queried live

A `FeedbackAssignment` row (one per manager–employee–cycle) gets created
when a cycle opens, based on whatever the reporting line looks like *at that
moment*. I didn't want assignments to be a live join against current
`managerId` values, because then a reporting change in month 3 would quietly
rewrite who was supposed to give feedback in month 1. Assignments are meant
to be a historical record, not a live view.

### The 5 parameters are a constant, not a database table

The brief says "5 fixed parameters," so I didn't build a `Parameters`
collection with CRUD around it — that felt like solving a problem nobody
asked for. It's a plain array in `config/parameters.js`, mirrored manually
on the frontend. If this ever needs to be per-company or customizable,
that's a bigger schema change anyway (parameters, weights, maybe versioning
per cycle), so I didn't try to half-build it.

One consequence of this: each `FeedbackSubmission` stores the parameter
*name* directly on the rating, not a reference to a parameter ID. That way
if the fixed list ever changes down the line, old submissions still read
correctly instead of pointing at a parameter that no longer exists.

### One submission per manager–employee–cycle, enforced at the DB level

There's a unique index on `(cycleId, managerId, employeeId)` in
`FeedbackAssignment`. Combined with the check in `submitFeedback` that the
logged-in user actually *is* the manager on that assignment, this rules out
two things: a manager accidentally double-submitting for the same person,
and — this was a real bug in an earlier pass — anyone submitting feedback
for someone else just by guessing an assignment ID.

### Cycle creation is not an in-app HR action right now

This is a real gap I want to be upfront about rather than gloss over. There's
no `POST /hr/cycles` endpoint. Right now, cycles and their assignments only
get created by `seed.js`. In a production version, HR would need a "start
this month's cycle" action (or a scheduled job) that walks the current
hierarchy per company and generates one assignment per manager–report pair.
I chose to spend the time making sure the *shape* of the data was right for
the scenarios in the brief, rather than building an admin UI for something
the brief didn't explicitly ask for.

### Employee history is grouped by cycle, not by parameter

The brief asks for employees to see "scores over the past few months, per
parameter" — e.g. how has my Communication score trended. What I built shows
one card per cycle with all 5 parameters inside, which answers "how did I do
this month" well but doesn't directly answer "how has Communication moved
over time" without the employee flipping through cards themselves.

The data supports both views — each `FeedbackSubmission.ratings` entry has
the parameter name and score, so grouping by parameter across cycles is a
query away, not a schema change. Flagging this as a UI scope call made under
the timebox, not something the data model can't do.

### Other things I deliberately left out

- No self-review (only manager → employee feedback, matching the brief)
- No email notifications when feedback is due or submitted
- No password reset / account self-signup — users are seeded, not created
  in-app
- One login page for every company; which company a user belongs to comes
  from their account (`companyId`), not from a picker at login. Email is
  globally unique across companies, so the same email can't exist at two
  different pilot companies.

### Auth

JWT in an httpOnly cookie rather than a token stored in localStorage, mainly
to keep it out of reach of any injected JS. Logout also writes the token
into a Redis blacklist with a TTL matching the token's remaining lifetime —
without this, "logging out" would just delete the cookie client-side while
the token itself stayed valid on the server for up to 7 days if someone had
a copy of it.