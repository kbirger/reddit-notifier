import * as fs from 'fs';
import { AlertTracker } from './alert-tracker';

jest.mock('fs');

describe('AlertTracker', () => {
  let writeFileSyncSpy: jest.SpyInstance;
  let existsSyncspy: jest.SpyInstance;
  let readFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    writeFileSyncSpy = jest.spyOn(fs, 'writeFileSync');
    readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
    existsSyncspy = jest.spyOn(fs, 'existsSync');
  });

  afterEach(() => {
    writeFileSyncSpy.mockRestore();
    readFileSyncSpy.mockRestore();
    existsSyncspy.mockRestore();
  });

  describe('getLastAlerted', () => {
    it('should return 0 when data file not found', () => {
      // Arrange
      existsSyncspy.mockReturnValue(false);
      const tracker = new AlertTracker('.');

      // Act
      const alerted = tracker.getLastAlerted();

      // Assert
      expect(alerted).toEqual(0);
    });

    it('should return expected value when data exists', () => {
      // Arrange
      existsSyncspy.mockReturnValue(true);
      readFileSyncSpy.mockReturnValue('1234321');

      const tracker = new AlertTracker('.');

      // Act
      const alerted = tracker.getLastAlerted();

      // Assert
      expect(alerted).toEqual(1234321);
    });
  });

  describe('setLastAlerted', () => {
    it('should update data file', () => {
      // Arrange 
      const tracker = new AlertTracker('.');

      // Act
      tracker.setLastAlerted(54321);

      // Assert
      expect(writeFileSyncSpy).toHaveBeenCalledWith('last-alert', '54321', 'utf8');

    });
  });

  describe('isMoreRecentThanLastAlert', () => {
    it('should return true when given time is more recent', () => {
      // Arrange 
      const tracker = new AlertTracker('.');
      readFileSyncSpy.mockReturnValue('5');
      existsSyncspy.mockReturnValue(true);

      // Act
      const result = tracker.isMoreRecentThanLastAlert(6);

      // Assert
      expect(result).toEqual(true);
    });

    it('should return false when given time is not more recent', () => {
      // Arrange 
      const tracker = new AlertTracker('.');
      readFileSyncSpy.mockReturnValue('5');
      existsSyncspy.mockReturnValue(true);

      // Act
      const result = tracker.isMoreRecentThanLastAlert(4);

      // Assert
      expect(result).toEqual(false);
    });
  });
});