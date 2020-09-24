declare module 'snoostream' {
  import Snoowrap, { SnoowrapOptions } from 'snoowrap';
  import { ListingOptions } from 'snoowrap/dist/objects/Listing';
  import * as events from 'events';

  // Snoowrap
  // function SnooStream(options: SnoowrapOptions, drift?: number): SnooStreamInstance;
  // function SnooStream(snooWrapInstance: Snoowrap, drift?: number): SnooStreamInstance;

  class SnooStream {
    constructor(options: SnoowrapOptions, drift?: number);
    constructor(snooWrapInstance: Snoowrap, drift?: number);

    commentStream(subreddit: string, options?: Options): events.EventEmitter;
    submissionStream(subreddit: string, options?: Options): events.EventEmitter;
  }

  interface SnooStreamOptions {
    regex?: RegExp;
    rate?: number;
  }

  type Options = SnooStreamOptions & Partial<ListingOptions>;
  export = SnooStream;
}