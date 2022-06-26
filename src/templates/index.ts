import { HelloWorld } from "./helloWorld";

export interface Template {
  name: string;
  files: {
    name: string;
    text: (browserGlobal: string) => string;
  }[];
}

export const templates = [HelloWorld];
