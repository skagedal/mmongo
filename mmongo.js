#!/usr/bin/env node

var url = require('url');
var child_process = require('child_process');
var util = require('util');

subcommands = {
  '--help': { help: true },
  'run': { exec: 'mongo', db: ["DB"] },
  'dump': { exec: 'mongodump', db: ["--db", "DB"] },
  'restore': { exec: 'mongorestore', db: ["--db", "DB"] },
  'import': { exec: 'mongoimport', db: ["--db", "DB"] },
  'export': { exec: 'mongoexport', db: ["--db", "DB"] },
  'files': { exec: 'mongofiles', db: ["--db", "DB"] },
  'oplog': { exec: 'mongooplog', db: ["--db", "DB"] },
  'stat': { exec: 'mongostat', db: [] },
  'top': { exec: 'mongotop', db: [] }
};

function main() {
  args = parseArgs(process.argv.slice(2));

  if (args.command.help)
    printUsageAndExit();

  var mUrl = getMeteorMongoUrl(args.site);
  var urlObj = url.parse(mUrl);
  var newArgs = buildArgs (args.command, args.commandArgs, urlObj);

  if (args.dryRun) {
    var fullCommand = shellQuote([args.command.exec].concat(newArgs));
    console.log(fullCommand);
    // console.log([args.command.exec].concat(newArgs));
  } else {
    child_process.spawn(args.command.exec, newArgs, { stdio: 'inherit' });
  }
}

function parseArgs(args) {
  parsedArgs = {};

  // 1. Flags to mmongo

  if (args[0] === '--dry') {
    parsedArgs.dryRun = true;
    args.shift();
  }

  // 2. A site is specified unless we go directly to the command

  if (!(args[0] in subcommands) && args.length > 0) {
    parsedArgs.site = args[0];
    args.shift();
  } else {
    parsedArgs.site = null;
  }

  // 3. A subcommand (or "run" if none given)

  if (args[0] in subcommands) {
    parsedArgs.command = subcommands[args[0]];
    args.shift();
  } else {
    parsedArgs.command = subcommands['run'];
  }

  // 4. The rest is args to the subcommand
  parsedArgs.commandArgs = args;

  return parsedArgs;
}

function buildArgs(command, commandArgs, urlObj) {
  var args = ['--host', urlObj.host];
  if (typeof urlObj.auth === 'string') {
    var auth = urlObj.auth.split(':');
    if (auth[0])
      args.push('--username', auth[0]);
    if (auth[1])
      args.push('--password', auth[1]);
  }

  // The various mongo commands have different conventions
  // for passing the database; some don't want a database at all.
  var db = urlObj.pathname.replace(/^\//, '');
  var dbArgs = command.db.map (function (s) {
    return (s === "DB") ? db : s;
  });
  args = args.concat(dbArgs);
  
  return args.concat(commandArgs);
}

function getMeteorMongoUrl(site) {
  var args = ['mongo', '--url'];
  if (site)
    args.push(site);

  var ret;
  
  if (process.platform === 'win32') {
    ret = child_process.spawnSync('meteor.bat', args);
  } else {
    ret = child_process.spawnSync('meteor', args);
  }
  
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

function repeat(s, n) {
  return new Array(n + 1).join(s);
}

function usageCommand(key) {
  command = subcommands[key].exec;
  if (!command)
    return '';
  return "      " + key + ":" + repeat(" ", 10 - key.length) + 
    command + "\n";
}

function printUsageAndExit() {
  console.log(
    'Usage: mmongo [--dry | --help] [SITE] [COMMAND] [ARGS]\n\n'+
    " - Use the --dry flag to see what would've been executed.\n" +
    ' - SITE is a meteor site, like "example.meteor.com".\n' +
    '   To access the local site, put nothing here.\n' + 
    ' - COMMAND can be any of:\n' +
    Object.keys(subcommands).map(usageCommand).join("") +
    ' - ARGS is any arguments to that command.\n'
  );
  process.exit(0);
}

main();

