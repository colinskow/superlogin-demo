# SuperLogin Demo

[Live Demo](https://superlogin-demo.herokuapp.com)

A sample single-page application built with [SuperLogin](https://github.com/colinskow/superlogin), [PouchDB](http://pouchdb.com) and [AngularJS](https://angularjs.org), along with [Angular Material](https://material.angularjs.org).

For issues and feature requests visit the [issue tracker](https://github.com/colinskow/superlogin-demo/issues).

## Requirements

- NodeJS
- CouchDB
- Redis

## How to use

1. `npm install`
2. `bower install`
3. (Optional) follow the instructions in `env.example.sh` to configure your access credentials
4. Ensure Redis and CouchDB are running
5. `npm start`

## How to deploy to Heroku & Cloudant
- Register with a DBaaS (Database as a Service) like [Cloudant](https://cloudant.com/sign-up/).
- Enable CORS (cross origin Resource Sharing):
  Under *Account* go to *CORS* and enable this for All domains
- Register with a PaaS (Platform as a service) like [Heroku](https://www.heroku.com/).
- Create app & deploy superlogin-demo, see: [Heroku: Getting started with Node.js](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- Enable the [Redis addon](https://elements.heroku.com/addons/heroku-redis).
- In the app's settings, set the Config Variables, see: `env.example.sh`.
  - `DB_HOST`: `yourcloudantusername.cloudant.com`
  - `DB_USER`: `yourcloudantusername`
  - `DB_PASS`: `yourcloudantpassword`

## Demonstrates These Projects

##### [SuperLogin](https://github.com/colinskow/superlogin)
Powerful authentication for APIs and single page apps using the CouchDB ecosystem which supports a variety of providers.
  
##### [NG-SuperLogin](https://github.com/colinskow/ng-superlogin)
Angular bindings for the SuperLogin project.

##### [NG-Pouch-Mirror](https://github.com/colinskow/ng-pouch-mirror)
Simple 3-way sync between a remote database, memory, and disk using [PouchDB](http://pouchdb.com).
