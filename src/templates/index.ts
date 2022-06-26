import {
  Browser,
  ManifestVersion,
} from "../components/StateProvider/StateProvider";
import { HelloWorld } from "./helloWorld";
import { NewTabPage } from "./newTabPage";

export interface Template {
  name: string;
  manifest: {
    name: string;
    description: string;
    backgroundScripts: string[];
    newTabPage?: string;
  };
  files: {
    name: string;
    text: (browserGlobal: string) => string;
  }[];
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

  if (manifest.newTabPage) {
    result["chrome_url_overrides"] = {
      newtab: manifest.newTabPage,
    };
  }

  return JSON.stringify(result, undefined, 2);
}

export const templates = [HelloWorld, NewTabPage];
