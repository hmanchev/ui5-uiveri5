# Development

## Git

### Make a fork
Fork a repository from Github UI.

Clone fork locally:
```
git clone git@github.wdf.sap.corp:<i-user>/<reponame>
```

Configure the origin:
```
git remote add upstream git@github.wdf.sap.corp:<origin org name>/<reponame>
```

### Make changes and push commits
Possibly work in a local branch:
```
git checkout -b <local branch>
```

Make changes, commit them:
```
git commit -am "chore: minor stuff"
```

Push the new commit to remote fork:
```
git push origin <local branch>
```

### Make pull request, discuss and make more commits, update the pull request

### Once pull is merged, update the fork
Take upstream changes locally:
```
git checkout master
git fetch upstream
git rebase upstream/master
```

Update the fork remote repo:
```
git push origin master
```

And delete the local branch:
```
git branch -d <local branch>
```

### [More info](https://2buntu.com/articles/1459/keeping-your-forked-repo-synced-with-the-upstream-source/)

## Testing

### Run all unit test
```
$ npm run test
```

### Run specific unit test
```
$ npm run test --specs spec/StatisticsCollector.spec.js
```

## Release
### Release new version

Assuming you have local copy of a fork with `upstream` and `origin` remotes setup correctly.

* Create a local branch over an up-to-date master branch
```
git checkout -b release
```

* Increment version in package.json.
Increment patch number if this release contains only bugfixes, increment minor version number if contains features.

* Commit version increment change
```
git commit -am "chore: update version to 1.xx.v"
```

* Prepare release description.
Check recent commits and prepare a good commit message. Use "Feature: " prefix for new features and "Fix: " for bug fixes.
Mention explicitly each feature in a new message.
```
Feature: waitForUI5 handles periodic events
```

* Create annotated tag
```
git tag -a v1.xx.y -m "<message 1>" -m "<message 2>"
```

* Push the new tag
```
git push --follow-tags origin release:master
```
