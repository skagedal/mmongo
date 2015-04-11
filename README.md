# mmongo
Conveniently run mongo client tools on a Meteor database.

MongoDB includes a bunch of shell commands[1] that connect to a database
server and do things: `mongo`, `mongodump`, `mongorestore`, `mongooplog`,
`mongoimport`, `mongoexport`, `mongostat`, `mongotop` and `mongofiles`.

To connect to a database, you need to specify the hostname, the port
and credentials.  Meteor gives you these in form of a MongoDB 
Connection String if you do 'meteor mongo --url'.  Unfortunately,
the MongoDB tools do not support this Connection String, so you need
to rewrite things to pass the proper parameter.  That's a hassle, 
and that's what this tool can help you with (until MongoDB fixes this).

## Installation

Put `mmongo.js` somewhere in your `$PATH` as `mmongo`, for example:

    sudo cp mmongo.js /usr/local/bin/mmongo
    sudo chmod +x /usr/local/bin/mmongo

## Usage

To open up a mongo shell on your meteor database, just like `meteor
mongo`:

    mmongo

On a deployed mongo instance:

    mmongo example.meteor.com

To give arguments (see `mongo --help`), add `run` and then the arguments:

    mmongo example.meteor.com run --eval 'printjson(db.getCollectionNames())'

To run any of the other tools, remove the "mongo"-prefix from that
command.  For example, to dump a database:

    mmongo example.meteor.com dump

Or export the `tasks` database as a json file:

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