# Ninth probe target (node_5)

This deployment adds one extra target so six existing IPv4 targets and three
Guangdong IPv6 targets can run together. Configuration schema 8 adds `node_5`;
schema 3–7 serialization remains unchanged for existing agents.

The matching agent patch applies to `huilang-me/cfsm-agent` commit
`10e4938e999d8b30b4d9296df4c686983bfdb762` (v1.0.16 source).
Apply `node-5.patch` in a clean checkout, run `go test ./...`, and build with Go
1.26.8 or newer:

```sh
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath \
  -ldflags '-s -w -X main.version=1.0.16-node5.1' \
  -o cf-probe-linux-amd64-node5 ./cmd/cf-probe
```

Installed only on the five IPv6-capable machines. The public upstream installer
still installs the standard agent and does not accept `-node_5`; reinstalls on
these machines must use the patched binary. Automatic agent updates are disabled
in this deployment. Probe config remains managed by the panel.

Before deployment, add `servers.node_5 TEXT DEFAULT ''` and
`ping_node_5 INTEGER DEFAULT NULL`, `loss_node_5 INTEGER DEFAULT NULL` to both
history tables. Existing history is preserved. The database upgrade utility also
supports these additive columns.

The fork's upstream-sync workflow preserves local commits and stops on merge
conflicts; review future upstream schema changes before merging.
