# Smooth CellForge Loader Animations

This internal note describes how CellForge keeps triangle and path-based loaders visually smooth.

## Guidelines

- Prefer continuous weights over hard on/off steps.
- Use `smoothstep01(low, high, value)` when a signal needs soft shoulders.
- Freeze preview phase in idle or reduced-motion modes so examples do not jump.
- Keep generated public names in the `cell-*` family even when source files use internal implementation names.
