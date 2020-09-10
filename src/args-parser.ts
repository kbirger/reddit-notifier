import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const program = new Command();
program
  .version(readPackageVersion())
  .option('-c, --config-file <path>', 'path to configuration file',
    path.join(getHome(), '.reddit-notifier', 'config.json'))
  .option('-d, --data-dir <path>', 'path to data directory for storing state',
    path.join(getHome(), '.reddit-notifier', 'data'))
  .option('-t, --test', 'do not push anything, only log', false);

interface CommandlineArguments {
  configFile: string;
  dataDir: string;
  test: boolean;
}
export function parseArguments(args?: string[]): CommandlineArguments {
  args = args ?? process.argv;
  program.parse(args);
  return {
    configFile: program.configFile,
    dataDir: program.dataDir,
    test: program.test
  };
}

function getHome() {
  return os.homedir();
}

function readPackageVersion() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
    const data = JSON.parse(rawData);

    return data.version;
  } catch {
    return '0.0.0';
  }
}