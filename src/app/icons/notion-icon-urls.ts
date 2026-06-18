import bellUrl from "@notion-icons/bell-55534e-icon.svg?url";
import bellSlashUrl from "@notion-icons/bell-slash-55534e-icon.svg?url";
import chartBarLineUrl from "@notion-icons/chart-bar-line-55534e-icon.svg?url";
import chartBarVerticalUrl from "@notion-icons/chart-bar-vertical-55534e-icon.svg?url";
import chartBarHorizontalUrl from "@notion-icons/chart-bar-horizontal-55534e-icon.svg?url";
import checkmarkListUrl from "@notion-icons/checkmark-list-55534e-icon.svg?url";
import circleDashedUrl from "@notion-icons/circle-dashed-55534e-icon.svg?url";
import cloudUrl from "@notion-icons/cloud-55534e-icon.svg?url";
import compassUrl from "@notion-icons/compass-55534e-icon.svg?url";
import computerWindowUrl from "@notion-icons/computer-window-55534e-icon.svg?url";
import cursorClickUrl from "@notion-icons/cursor-click-55534e-icon.svg?url";
import directionalSignUrl from "@notion-icons/directional-sign-55534e-icon.svg?url";
import documentUrl from "@notion-icons/document-55534e-icon.svg?url";
import documentsUrl from "@notion-icons/documents-55534e-icon.svg?url";
import eyeUrl from "@notion-icons/eye-55534e-icon.svg?url";
import eyeSlashUrl from "@notion-icons/eye-slash-55534e-icon.svg?url";
import graduationCapUrl from "@notion-icons/graduation-cap-55534e-icon.svg?url";
import gridSquare2x2Url from "@notion-icons/grid-square-2x2-55534e-icon.svg?url";
import houseUrl from "@notion-icons/house-55534e-icon.svg?url";
import informationCircleUrl from "@notion-icons/information-circle-55534e-icon.svg?url";
import lightningBoltUrl from "@notion-icons/lightning-bolt-55534e-icon.svg?url";
import listBulletUrl from "@notion-icons/list-bullet-55534e-icon.svg?url";
import listUrl from "@notion-icons/list-55534e-icon.svg?url";
import peopleUrl from "@notion-icons/people-55534e-icon.svg?url";
import pencilListUrl from "@notion-icons/pencil-list-55534e-icon.svg?url";
import squareDashedUrl from "@notion-icons/square-dashed-55534e-icon.svg?url";
import tagUrl from "@notion-icons/tag-55534e-icon.svg?url";
import userUrl from "@notion-icons/user-55534e-icon.svg?url";
import wrenchUrl from "@notion-icons/wrench-55534e-icon.svg?url";

/** Slugs match filenames in `notion-icons-svg-55534e` (without `-55534e-icon.svg`). */
export const NOTION_ICON_URLS = {
  bell: bellUrl,
  "bell-slash": bellSlashUrl,
  "chart-bar-horizontal": chartBarHorizontalUrl,
  "chart-bar-line": chartBarLineUrl,
  "chart-bar-vertical": chartBarVerticalUrl,
  "checkmark-list": checkmarkListUrl,
  "circle-dashed": circleDashedUrl,
  cloud: cloudUrl,
  compass: compassUrl,
  "computer-window": computerWindowUrl,
  "cursor-click": cursorClickUrl,
  "directional-sign": directionalSignUrl,
  document: documentUrl,
  documents: documentsUrl,
  eye: eyeUrl,
  "eye-slash": eyeSlashUrl,
  "graduation-cap": graduationCapUrl,
  "grid-square-2x2": gridSquare2x2Url,
  house: houseUrl,
  "information-circle": informationCircleUrl,
  "lightning-bolt": lightningBoltUrl,
  "list-bullet": listBulletUrl,
  list: listUrl,
  "pencil-list": pencilListUrl,
  people: peopleUrl,
  "square-dashed": squareDashedUrl,
  tag: tagUrl,
  user: userUrl,
  wrench: wrenchUrl,
} as const;

export type NotionIconName = keyof typeof NOTION_ICON_URLS;

export function getNotionIconUrl(name: NotionIconName): string {
  return NOTION_ICON_URLS[name];
}
