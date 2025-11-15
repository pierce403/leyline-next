# Security Policy

This project will handle authentication, billing, and user profile data. Treat all related code and data paths with care.

## Reporting Vulnerabilities

- If you discover a security issue, please **do not** open a public GitHub issue with sensitive details.
- Instead, either:
  - Use GitHub's **Security Advisories** feature for this repository, or
  - Contact the maintainers privately (for now, via a private issue or direct message to the repo owner).

Provide as much detail as possible so the issue can be reproduced and fixed quickly.

## Scope & Priorities

High-priority areas include:

- Authentication and session handling (Auth0 integration).
- Authorization and role/membership checks (Free/Basic/Pro; admin roles).
- Payment flows and webhooks (Stripe).
- Access to user profile data, investments, and course progress.

## Guidelines for Contributors

- Never commit secrets (API keys, private keys, client secrets).
- Use environment variables for all credentials and connection strings.
- Be cautious when logging; avoid logging tokens, full responses from Auth0/Stripe, or PII.
- When in doubt, assume data is sensitive and minimize exposure.

