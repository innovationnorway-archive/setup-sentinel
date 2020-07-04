# setup-sentinel

<p align="left">
  <a href="https://github.com/innovationnorway/setup-sentinel"><img alt="GitHub Actions status" src="https://github.com/innovationnorway/setup-sentinel/workflows/build-test/badge.svg"></a>
</p>

This action sets up a [Sentinel](https://docs.hashicorp.com/sentinel/) environment for use in actions by:

- optionally downloading and caching a version of Sentinel by version and adding to `PATH`

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@v2
- uses: innovationnorway/setup-sentinel@v1
  with:
    version: '~0.15'
- run: sentinel test
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
