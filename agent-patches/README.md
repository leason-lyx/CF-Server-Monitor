# Twelve probe targets

This deployment retains six IPv4 targets and adds Guangdong and Beijing CT/CU/CM
IPv6 targets. Schema 8 adds node_5; schema 9 adds node_6 through node_8. Schema 3–8
wire serialization remains unchanged for older agents.

Apply node-8.patch to huilang-me/cfsm-agent commit
10e4938e999d8b30b4d9296df4c686983bfdb762 (v1.0.16 source). With Go 1.26.8 or newer:

```sh
go test ./...
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath \
  -ldflags '-s -w -X main.version=1.0.16-node8.1' \
  -o cf-probe-linux-amd64-node8 ./cmd/cf-probe
```

Install this binary only on machines selected for the extra targets. The upstream
installer does not support node_5 through node_8; reinstall these machines with
the patched binary. Their existing automatic-update setting remains disabled.
The panel manages all target addresses and explicit per-machine disable flags.

Before deployment, add servers.node_5 through servers.node_8 (TEXT DEFAULT '')
and matching ping_node_N/loss_node_N (INTEGER DEFAULT NULL) to both history tables.
The included database upgrade utility supports these additive columns.

The fork's upstream-sync workflow preserves local commits and stops on merge
conflicts. Review future upstream schema changes before merging. The Emerald
extension is pinned to an immutable commit in themes/emerald.
