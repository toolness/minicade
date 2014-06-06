[![Build Status](https://travis-ci.org/toolness/minicade.png)](https://travis-ci.org/toolness/minicade)

Minicade makes it super easy to collaboratively create an arcade of
mini HTML5-based games with your friends.

## Prerequisites

You'll need node 0.10.

## Quick Start

```
git clone git://github.com/toolness/minicade
cd minicade
npm install
npm test
DEBUG= node app.js
```

Then visit http://localhost:3000.

## Environment Variables

**Note:** When an environment variable is described as representing a
boolean value, if the variable exists with *any* value (even the empty
string), the boolean is true; otherwise, it's false.

* `MONGODB_URL` is the URL to the MongoDB instance, e.g.
  `mongodb://localhost/minicade`. If not present, the app just
  stores user data in memory, which is useful for development but
  not much else.

* `DEBUG` represents a boolean value. Setting this to true makes the server
  not aggressively cache templates and other resources, among other things.

* `PORT` is the port that the server binds to. Defaults to 3000.

* `GA_TRACKING_ID` is the Google Analytics Tracking ID for your app.
  Optional.

* `GA_HOSTNAME` is the hostname of your app for Google Analytics tracking.
  It's usually the top-level domain of your app. If `GA_TRACKING_ID` is
  defined, this must be defined too.
