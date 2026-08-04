export type WiringTraceItem = {
  id: string;
  title: string;
  implementationSource: string;
  start: string;
  pathHops: string[];
  nodesTouched: string[];
  facets: string;
  missingSeatFlag?: string;
  deferredOrBlocked?: string;
};

export type WiringSeatTraces = {
  id: string;
  label: string;
  items: WiringTraceItem[];
};

export type CanonicalNode = {
  node: string;
  definition: string;
  altitude: string;
  seats: string[];
  existenceBucket: string;
  humanProvisioningDependency: string | null;
};

export type CantItem = {
  id: string;
  title: string;
  failureMode: string;
  whereItHangs: string[];
  guardToAdd: string;
  seats: string[];
};

export type FurnishItem = {
  id: string;
  title: string;
  opsNode: string;
  purpose: string;
  attachesToFunctionNodes: string[];
  doesNotChangeFunction: string;
};

export type HumanProvisioningNode = {
  node: string;
  requiresToExist: string;
  scope: string;
  inheritedBy: string;
  relatedFunctionSeats: string[];
};
