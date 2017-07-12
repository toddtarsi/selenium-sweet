## Builder Plugin

Avoid wading through the guts of SE builder trying to evolve your test steps, and centralize your team around a custom step list easily. Instead, just modify your json in your github file, publish your changes to your repo, and reload SE builder. Voila! New steps. 

### How to use this repo

Check out https://github.com/toddtarsi/selenium-sweet/tree/master/packages/se-sweet-example-repo/config for an example configuration. 

### How does it work?

Basically, the github integration fetches the data, the app performs some string matching to create the appropriate steps and parameters, and lastly the step list and categories list are both replaced by custom steps.

Also, it does a little bit of work to generate the stepData internal object from the step json data. It is able to do this because step order is irrelevant in the se-builder / selenium-ide transpiler system. Parameters are handled at both ends by collapsing to dicts and keying by name.

### Constraints

These new custom steps won't work when run in playback via SE builder.
In order for playback to work on our custom steps, we would need to write additional playback logic.

### Prerequisites

This plugin relies on the github integration plugin to perform its data fetching,
and SE Builders sqlite storage to store and manage configuration details.
It simply 
