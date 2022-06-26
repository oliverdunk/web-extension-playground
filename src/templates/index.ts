import { HelloWorld } from "./helloWorld";
import { NewTabPage } from "./newTabPage";

export interface Template {
  name: string;
  files: {
    name: string;
    text: (browserGlobal: string) => string;
  }[];
}

export const templates = [HelloWorld, NewTabPage];
