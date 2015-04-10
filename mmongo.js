#!/usr/bin/env node

var url = require('url');
var child_process = require('child_process');
var util = require('util');

subcommands = {
  'dump': { exec: 'mongodump' },
  'dump': { exec: 'mongodump' },
  'restore': { exec: 'mongorestore' },
  'oplog': { exec: 'mongooplog' },
  'import': { exec: 'mongoimport' },
  'export': { exec: 'mongoexport' },
  'stat': { exec: 'mongostat' },
  'top': { exec: 'mongotop' },
  'files': { exec: 'mongofiles' }
};

function main() {
  args = process.argv.slice(2);

  if (args[0] == '--help') {
    printUsageAndExit();
  }

  var dryRun = false;
  if (args[0] == '--dry') {
    dryRun = true;
    args.shift();
  }

  command = 'mongo';
  if (args[0] in subcommands) {
    command = subcommands[args[0]].exec;
    args.shift();
  } 

  if (args.length == 0 || args[0] === '.') {
    mUrl = getMeteorMongoUrl();
  } else {
    mUrl = getMeteorMongoUrl(args[0]);
  }
  args.shift();

  urlObj = url.parse(mUrl);

  var newArgs = ['--host', urlObj.host];
  if (typeof urlObj.auth === 'string') {
    auth = urlObj.auth.split(':');
    if (auth[0])
      newArgs.push('--username', auth[0]);
    if (auth[1]);
      newArgs.push('--password', auth[1]);
  }

  var db = urlObj.pathname.replace(/^\//, '');
  if (command === 'mongo')
    newArgs.push(db);
  else
    newArgs.push('--db', db);
  
  newArgs = newArgs.concat(args);

  var fullCommand = shellQuote([command].concat(newArgs));
  if (dryRun) {
    console.log(fullCommand);
  } else {
    child_process.spawn(command, newArgs, { stdio: 'inherit' });
  }
}

function getMeteorMongoUrl(site) {
  var args = ['mongo', '--url'];
  if (site)
    args.push(site);

  var ret = child_process.spawnSync('meteor', args);
  if (ret.status != 0) {
    var exc = new MeteorMongoException(ret.status, ret.stderr);
    exc.status = ret.status;
    throw(exc);
  }
  return ret.stdout.toString().trim();
}

function MeteorMongoException(status, stderr) {
  this.status = status;
  this.stderr = stderr;
  this.toString = function () { 
    return (util.format("meteor mongo returned %d with message:\n%s",
			status, stderr.toString()));
  };
}

// Adapted from https://github.com/substack/node-shell-quote
// By James Halliday, MIT licensed
function shellQuote(xs) {
  return xs.map(function (s) {
    if (s && typeof s === 'object') {
      return s.op.replace(/(.)/g, '\\$1');
    }
    else if (/["\s]/.test(s) && !/'/.test(s)) {
      return "'" + s.replace(/(['\\])/g, '\\$1') + "'";
    }
    else if (/["'\s]/.test(s)) {
      return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
    }
    else {
      return String(s).replace(/([\\$`()!#&*|])/g, '\\$1');
    }
  }).join(' ');
}

function printUsageAndExit() {
  console.log(
    "Usage: mmongo [--dry] [COMMAND] [SITE] [ARGS]\n\n"+
    " - Use the --dry flag to see what would've been executed.\n" +
    " - COMMAND can be any of:\n" +
    Object.keys(subcommands).map(function(s){return ("     "+s)}).join("\n") + "\n" +
    '   where "dump", for example, runs the "mongodump" command.\n' +
    '   No specified command means the "mongo" tool is run.\n' +
    ' - SITE is a meteor site, or "." for your local site.\n' +
    '   If you wish to specify further ARGS, you need to give a site\n' +
    '   or ".".\n'
  );
  process.exit(0);
}

main();

