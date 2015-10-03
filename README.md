# mmongo

MongoDB includes a bunch of [shell commands][1] that connect to a
database server and do things: `mongo`, `mongodump`, `mongorestore`,
`mongooplog`, `mongoimport`, `mongoexport`, `mongostat`, `mongotop`
and `mongofiles`.

To connect to a database, you need to specify hostname, port, database
and credentials.  Meteor gives you these in form of a MongoDB
[Connection String][2] if you do `meteor mongo --url`.  Unfortunately, the
MongoDB tools do not support this Connection String, so you need to
rewrite things to pass the proper parameter.  That's a hassle, and
that's what this tool can help you with (until MongoDB [fixes this][3]).

## Installation

`mmongo` requires an installation of Node.js 0.12.  It does not use the 
Node.js that comes bundled with Meteor.

`mmongo` is available at NPM, so if you use that do:

    npm -g install mmongo

Otherwise, just put `mmongo.js` somewhere in your `$PATH` as `mmongo`,
for example using:

    sudo cp mmongo.js /usr/local/bin/mmongo
    sudo chmod +x /usr/local/bin/mmongo

## Usage

To open up a mongo shell on your meteor database, just like `meteor
mongo`:

    mmongo

To open up a mongo shell On a deployed Meteor instance:

    mmongo example.meteor.com

To give arguments (see `mongo --help`), add `run` and then the arguments:

    mmongo example.meteor.com run --eval 'printjson(db.getCollectionNames())'

    mmongo example.meteor.com run my-mongo-script.js

To run any of the other tools, remove the "mongo"-prefix from that
command.  For example, to dump a database:

    mmongo example.meteor.com dump

Or to export a collection named "tasks" as a json file:

    mmongo example.meteor.com export -c tasks

I have not tested the `oplog` and `files` tools much.  `stat` and
`top` do not seem to authenticate on meteor.com sites, but work locally. 

If you wish to see what command would be executed without actually
running it, use the "--dry" option as the very first argument to
`mmongo`:

    mmongo --dry example.meteor.com import foo.json

To get a reminder of the arguments, use `mmongo --help`.

## Fork me

https://github.com/skagedal/mmongo


  [1]: http://docs.mongodb.org/manual/reference/program/
  [2]: http://docs.mongodb.org/manual/reference/connection-string/
  [3]: https://jira.mongodb.org/browse/SERVER-3254
