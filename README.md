# setup-sentinel

<p align="left">
  <a href="https://github.com/volcano-coffee-company/setup-sentinel"><img alt="GitHub Actions status" src="https://github.com/volcano-coffee-company/setup-sentinel/workflows/Main%20workflow/badge.svg"></a>
</p>

This action sets up a [Sentinel](https://www.hashicorp.com/sentinel/) environment for use in actions by:

- optionally downloading and caching a version of Sentinel by version and adding to `PATH`

# Usage

See [action.yml](action.yml)

Basic:
```yaml
steps:
- uses: actions/checkout@master
- uses: volcano-coffee-company/setup-sentinel@v1
  with:
    version: '0.13'
- run: sentinel test
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
