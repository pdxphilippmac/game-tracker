export type PatchMilestone = {
  label: string;
  startTime?: number;
  endTime?: number;
  featuredNames?: string[];
};

export type UpcomingVersion = {
  version?: string;
  versionName?: string;
  startTime?: number;
  label: string;
};

export type PatchStatus = {
  currentVersion: string;
  currentVersionName?: string;
  patchStartTime?: number;
  patchEndTime?: number;
  currentPhase?: PatchMilestone;
  nextMilestone?: PatchMilestone;
  nextVersion?: UpcomingVersion;
  summary?: string;
};
