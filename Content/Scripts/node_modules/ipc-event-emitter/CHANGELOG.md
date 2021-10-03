**2.0.2** - 2019-06-19

- update insecure dev dependency: WS-2018-0590

**2.0.1** - 2019-01-06

- update insecure dependencies

**2.0.0** - 2017-01-22

- **Breaking change**: rename `fix` -> `pin`
- add `unpin` method to remove pinned events
- improve env-var boolification
- disable "error" event pinning
- build cleanup: babel5 -> babel6, grunt -> gulp4
- package.json: require Node.js >= v0.5.9 for Process.send/ChildProcess.send
- document the non-default export, IPCEventEmitter
- more tests
- doc tweaks

**1.0.0** - 2015-12-01

- fix boolean casting of the `IPC_EVENT_EMITTER_DEBUG` environment variable

**0.1.1** - 2015-10-23

- fix Node.js v4.x matching: Node.js > 4.0.0 -> Node.js >= 4.0.0

**0.1.0** - 2015-09-22

- `emit` and `fix` now return promises
- make test less error-prone on Node.js v4.0.0
- fix emit-logger integration
- add a timeout option

**0.0.4** - 2015-09-22

- docfix: add `emit` to the TOC

**0.0.3** - 2015-09-22

- add the full GitHub metadata

**0.0.2** - 2015-09-22

- travis: increase mocha timeout to avoid spurious test failures
- add missing GitHub repo link

**0.0.1** - 2015-09-22

- initial release
