# Emerald with ninth probe support

Built from Tokinx/cf-server-monitor-theme-emerald v1.2.5, source commit
`d09f6573a471af601aab5cc0644486ae82d41bc6`, plus `source.patch`.

Validation: `bun install --frozen-lockfile`, `bun run lint`, `bun run build`.
The patch adds `node_5` to the existing API adapter and realtime chart mapping.
The previous production theme was build commit
`f0f67949604e10c03a0060d2c80d52487fa384ee` of the same v1.2.5 release.

Files under `assets/` and `index.html` are the generated static theme. Retain the
upstream MIT license and theme credit. Set the panel theme URL to this directory
at an immutable commit in the deployment fork.
