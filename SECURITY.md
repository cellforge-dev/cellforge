# Security Policy

CellForge is a source registry and documentation site. It does not currently process user accounts, payments, or private project data.

## Supported Versions

Security fixes target the latest code on `main` until versioned releases are introduced.

## Reporting A Vulnerability

Please report security issues privately by opening a GitHub security advisory for this repository when available. If advisories are not available to you, open an issue with minimal public detail and ask for a private contact path.

Do not include working exploit details, private tokens, or unrelated third-party secrets in public issues.

## Expected Scope

Relevant reports include:

- Malicious or unsafe generated registry output.
- Cross-site scripting in the documentation, gallery, Studio, or Playground.
- Supply-chain issues in install instructions or generated source.
- Unsafe handling of copied code snippets.

Out of scope:

- Generic dependency advisories that do not affect shipped behavior.
- Social engineering.
- Denial-of-service claims against public Vercel hosting without a reproducible project issue.
