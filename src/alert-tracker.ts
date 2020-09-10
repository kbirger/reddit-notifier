import * as fs from 'fs';
import * as path from 'path';
export class AlertTracker {
  constructor(private readonly dataDir: string) {

  }

  private get filePath() {
    return path.join(this.dataDir, 'last-alert');
  }
  getLastAlerted(): number {
    if (fs.existsSync('last-alert')) {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return parseInt(data);
    }

    return 0;
  }

  setLastAlerted(utcTicks: number): void {
    fs.writeFileSync(this.filePath, utcTicks.toString(), 'utf8');
  }

  isMoreRecentThanLastAlert(utcTicks: number): boolean {
    return utcTicks > this.getLastAlerted();
  }
}