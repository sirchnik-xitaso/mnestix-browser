# Workflows

## Commit Messages

We use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. See
the [angular convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) for
more details on the types of commits. (Note: `style`-commit is only for formatting changes not CSS styling. Use `fix` or
`feat` for CSS changes.)

As release notes are generated from commit messages, please keep in mind to write meaningful commit messages.

## Git Flow

This project follows a `dev` + `main` branching strategy:

- The `main` branch is reserved for stable releases.
- The `dev` branch is used for ongoing development. Snapshots of `dev` are pushed to
  [Docker Hub](https://hub.docker.com/r/mnestix/mnestix-browser/tags).

GitHub Actions automatically run tests and build the project on pull requests to either branch.

Hotfixes are done by PRs to `main` and then merged back into `dev`.

![git-flow](./git-flow.drawio.svg)

## Releases

### Versioning Convention

We use the Semantic Versioning Specification for our versioning. Semantic Versioning specifies that the version number
is split into three parts:

- **Major**: Increased when introducing a breaking change that breaks compatibility with older versions (e.g., migrating
  to a new version of the AAS standard).
- **Minor**: Increased when introducing new functionality that is backwards-compatible (e.g., adding a comparison
  feature). If a breaking change is accidentally introduced, it is fixed in a new version rather than rolling back.
- **Patch**: Increased for minor functionality, performance improvements, or bug fixes.

### Release Process

The release process is fully automated and triggered by a push to the `main` branch. The following steps are executed:

1. The version number is automatically determined based on the commit messages since the last release. The
   [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification is used to determine the type of
   version bump. (Note: `docs`: no release, invalid: no release.)
2. A changelog is generated from commits.
3. A GitHub Release is created with the changelog.
4. A Docker image is built and pushed to Docker Hub.
5. All issues resolved in the release are commented with a notification of the new release.

You can use the dry-run mode of semantic-release to check the version bump before pushing to `main`:

```bash
yarn semantic-release --dry-run
```
