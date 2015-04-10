# mmongo
Conveniently run mongo client tools on a Meteor database.

MongoDB includes a (bunch of shell commands)[1] that connect to a database
server and do things: `mongo`, `mongodump`, `mongorestore` and such.

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

Type `mmongo --help` to get these instructions:

    mmongo [--dry] [COMMAND] [SITE] [ARGS]
    
     - Use the --dry flag to see what would've been executed.
     - COMMAND can be any of:
         dump
         restore
         oplog
         import
         export
         stat
         top
         files
       where "dump", for example, runs the "mongodump" command.
       No specified command means the "mongo" tool is run.
     - SITE is a meteor site, or "." for your local site.
       If you wish to specify further ARGS, you need to give a site
       or ".".

## Fork me

https://github.com/skagedal/mmongo


  [1]: http://docs.mongodb.org/manual/reference/program/