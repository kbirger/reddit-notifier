export interface IAlertTracker {
  getLastAlerted(): number;
  setLastAlerted(utcTicks: number): void;
  isMoreRecentThanLastAlert(utcTicks: number): boolean;
}

export interface IMonitor {
  start(): void;
  verifyRunning(): void;
}

export interface IPushbulletNotifier {
  pushMessage(noteBody: string): Promise<unknown>;
  pushMessage(noteTitle: string, noteBody: string): Promise<unknown>;
}

export type MatchSpec = {
  [key in keyof PostJson]?: FieldMatchSpec
};

export interface FieldMatchSpecClause {
  matches?: string;
  greaterThan?: number;
  lessThan?: number;
  equals?: string | boolean | number;
}


export interface FieldMatchSpec {
  any?: FieldMatchSpecClause[],
  none?: FieldMatchSpecClause[]
}


export interface Config {
  pushbullet: PushBulletConfiguration;
  monitor: MonitorConfiguration;
}

export interface PushBulletConfiguration {
  apiKey: string;
  deviceId: PushBulletDeviceIdConfiguration,
  encryptionKeyBase64?: string;
}

export interface MonitorConfiguration {
  subreddit: string;
  matches: MatchSpec;
}
// eslint-disable-next-line @typescript-eslint/ban-types
export type PushBulletDeviceIdConfiguration = string | string[] | {};

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PostJson {
  approved_at_utc: string,
  subreddit: string,
  selftext: string,
  author_fullname: string,
  saved: boolean,
  mod_reason_title: string,
  gilded: number,
  clicked: boolean,
  title: string,
  link_flair_richtext: [],
  subreddit_name_prefixed: string,
  hidden: boolean,
  pwls: string,
  link_flair_css_class: string,
  downs: number,
  top_awarded_type: string,
  hide_score: boolean,
  name: string,
  quarantine: boolean,
  link_flair_text_color: string,
  upvote_ratio: number,
  author_flair_background_color: string,
  subreddit_type: string,
  ups: number,
  total_awards_received: number,
  media_embed: any,
  author_flair_template_id: string,
  is_original_content: boolean,
  user_reports: any[],
  secure_media: string,
  is_reddit_media_domain: boolean,
  is_meta: boolean,
  category: string,
  secure_media_embed: any,
  link_flair_text: string,
  can_mod_post: boolean,
  score: number,
  approved_by: string,
  author_premium: boolean,
  thumbnail: string,
  edited: boolean,
  author_flair_css_class: string,
  author_flair_richtext: [],
  gildings: any,
  content_categories: string,
  is_self: boolean,
  mod_note: string,
  created: number,
  link_flair_type: string,
  wls: string,
  removed_by_category: string,
  banned_by: string,
  author_flair_type: string,
  domain: string,
  allow_live_comments: boolean,
  selftext_html: string,
  likes: string,
  suggested_sort: string,
  banned_at_utc: string,
  view_count: string,
  archived: boolean,
  no_follow: boolean,
  is_crosspostable: boolean,
  pinned: boolean,
  over_number: boolean,
  all_awardings: any[],
  awarders: any[],
  media_only: boolean,
  can_gild: boolean,
  spoiler: boolean,
  locked: boolean,
  author_flair_text: string,
  treatment_tags: any[],
  visited: boolean,
  removed_by: string,
  num_reports: string,
  distinguished: string,
  subreddit_id: string,
  mod_reason_by: string,
  removal_reason: string,
  link_flair_background_color: string,
  id: string,
  is_robot_indexable: boolean,
  report_reasons: string,
  author: string,
  discussion_type: string,
  num_comments: number,
  send_replies: boolean,
  whitelist_status: string,
  contest_mode: boolean,
  mod_reports: any[],
  author_patreon_flair: boolean,
  author_flair_text_color: string,
  permalink: string,
  parent_whitelist_status: string,
  stickied: boolean,
  url: string,
  subreddit_subscribers: number,
  created_utc: number,
  num_crossposts: number,
  media: string,
  is_video: boolean
}

/* eslint-enable @typescript-eslint/no-explicit-any */
