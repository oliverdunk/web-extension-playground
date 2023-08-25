import {
  Browser,
  ManifestVersion,
  PlaygroundState,
} from "../components/StateProvider/StateProvider";
import { ContentScript } from "./contentScript";
import { HelloWorld } from "./helloWorld";
import { NewTabPage } from "./newTabPage";
import { SidePanel } from "./sidePanel";

export interface Template {
  id: string;
  name: string;
  manifest: {
    name: string;
    description: string;
    backgroundScripts: string[];
    contentScripts?: {
      matches: string[];
      js: string[];
    }[];
    permissions?: {
      sidePanel?: true;
    };
    sidepanelPath?: string;
    newTabPage?: string;
  };
  files: {
    name: string;
    text: (browserGlobal: string) => string;
  }[];
  filter?: (state: PlaygroundState) => boolean;
}

export function generateManifest(
  browser: Browser,
  manifestVersion: ManifestVersion,
  manifest: Template["manifest"]
): string {
  const result: { [key: string]: any } = {
    name: manifest.name,
    version: "0.1",
    manifest_version: manifestVersion === "MV2" ? 2 : 3,
    description: manifest.description,
  };

  if (manifest.backgroundScripts.length > 0) {
    switch (manifestVersion) {
      case "MV2":
        result["background"] = {
          scripts: manifest.backgroundScripts,
        };
        break;
      case "MV3":
        switch (browser) {
          case "Chrome":
          case "Safari":
            result["background"] = {
              service_worker: manifest.backgroundScripts[0],
            };
            break;
          case "Firefox":
            result["background"] = {
              scripts: manifest.backgroundScripts,
            };
            break;
        }
    }
  }

  if (manifest.contentScripts && manifest.contentScripts.length > 0) {
    result["content_scripts"] = manifest.contentScripts;
  }

  if (manifest.sidepanelPath) {
    switch (browser) {
      case "Chrome":
        result["side_panel"] = {
          default_path: manifest.sidepanelPath,
        };
        break;
      case "Firefox":
        result["sidebar_action"] = {
          default_panel: manifest.sidepanelPath,
        };
        break;
      default:
        throw new Error("Unexpected browser for sidepanelPath");
    }
  }

  if (manifest.newTabPage) {
    result["chrome_url_overrides"] = {
      newtab: manifest.newTabPage,
    };
  }

  if (manifest.permissions) {
    const permissions = [];

    if (manifest.permissions.sidePanel && browser === "Chrome") {
      permissions.push("sidePanel");
    }

    if (permissions.length > 0) {
      result["permissions"] = permissions;
    }
  }

  return JSON.stringify(result, undefined, 2);
}

export const templates = [HelloWorld, ContentScript, NewTabPage, SidePanel];
