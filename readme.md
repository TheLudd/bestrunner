# bestrunner (working name)

Simply the best runner, the master of test runners. The strict enforcer of working code. Blacklisting all bugs...

Built to execute tests non blocking, i.e. not waiting for the first test to finish before starting the second. Also intended to be as configurable as possible.

## structure

This repository currently contains one module called `runner` which is intended to be the core for the project. It can take pre and post hooks allowing for reporting of test progress.

Future intended modules can be named like:
  * `ui-*` different ways of definning tests. `ui-bdd` would be the equivelent of `mocha`
  * `reporter-*` different type of reporters
  * ... other useful common code
