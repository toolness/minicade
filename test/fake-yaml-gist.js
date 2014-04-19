var fs = require('fs');

var TEMPLATE = {
  "url": "https://api.github.com/gists/11083257",
  "forks_url": "https://api.github.com/gists/11083257/forks",
  "commits_url": "https://api.github.com/gists/11083257/commits",
  "id": "11083257",
  "git_pull_url": "https://gist.github.com/11083257.git",
  "git_push_url": "https://gist.github.com/11083257.git",
  "html_url": "https://gist.github.com/11083257",
  "files": {
    "minicade.yaml": {
      "filename": "minicade.yaml",
      "type": "text/yaml",
      "language": "YAML",
      "raw_url": "https://gist.githubusercontent.com/toolness/11083257/raw/0ebd30648ad6c929ce105fae2c861e98c3e18809/minicade.yaml",
      "size": 0,
      "content": ""
    }
  },
  "public": true,
  "created_at": "2014-04-19T12:36:14Z",
  "updated_at": "2014-04-19T12:36:15Z",
  "description": "Sample Minicade Gist",
  "comments": 0,
  "user": null,
  "comments_url": "https://api.github.com/gists/11083257/comments",
  "owner": {
    "login": "toolness",
    "id": 124687,
    "avatar_url": "https://avatars.githubusercontent.com/u/124687?",
    "gravatar_id": "b6c1ebb35d0c41dfe0728dd0dc6ae5b1",
    "url": "https://api.github.com/users/toolness",
    "html_url": "https://github.com/toolness",
    "followers_url": "https://api.github.com/users/toolness/followers",
    "following_url": "https://api.github.com/users/toolness/following{/other_user}",
    "gists_url": "https://api.github.com/users/toolness/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/toolness/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/toolness/subscriptions",
    "organizations_url": "https://api.github.com/users/toolness/orgs",
    "repos_url": "https://api.github.com/users/toolness/repos",
    "events_url": "https://api.github.com/users/toolness/events{/privacy}",
    "received_events_url": "https://api.github.com/users/toolness/received_events",
    "type": "User",
    "site_admin": false
  },
  "forks": [],
  "history": [
    {
      "user": {
        "login": "toolness",
        "id": 124687,
        "avatar_url": "https://avatars.githubusercontent.com/u/124687?",
        "gravatar_id": "b6c1ebb35d0c41dfe0728dd0dc6ae5b1",
        "url": "https://api.github.com/users/toolness",
        "html_url": "https://github.com/toolness",
        "followers_url": "https://api.github.com/users/toolness/followers",
        "following_url": "https://api.github.com/users/toolness/following{/other_user}",
        "gists_url": "https://api.github.com/users/toolness/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/toolness/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/toolness/subscriptions",
        "organizations_url": "https://api.github.com/users/toolness/orgs",
        "repos_url": "https://api.github.com/users/toolness/repos",
        "events_url": "https://api.github.com/users/toolness/events{/privacy}",
        "received_events_url": "https://api.github.com/users/toolness/received_events",
        "type": "User",
        "site_admin": false
      },
      "version": "715a0b93475ac668ae0444764ed23867ced5e52d",
      "committed_at": "2014-04-19T12:36:14Z",
      "change_status": {
        "total": 5,
        "additions": 5,
        "deletions": 0
      },
      "url": "https://api.github.com/gists/11083257/715a0b93475ac668ae0444764ed23867ced5e52d"
    }
  ]
};

module.exports = function(filename) {
  var gist = JSON.parse(JSON.stringify(TEMPLATE));
  var absPath = __dirname + '/yaml/' + filename;
  var file = gist.files['minicade.yaml'];

  file.size = fs.statSync(absPath).size;
  file.content = fs.readFileSync(absPath, 'utf-8');

  return gist;
};
