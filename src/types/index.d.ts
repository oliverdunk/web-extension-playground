declare module "*.scss";
declare module "url:*";

declare var monaco: typeof import("monaco-editor");

interface Window {
  // Globals
  monaco: typeof import("monaco-editor");
  ts: typeof import("typescript");

  // Monaco loader script
  // Based on https://github.com/suren-atoyan/monaco-loader
  require: {
    (paths: string[], callback: Function);
    config(params: {
      paths?: {
        vs?: string;
        sandbox?: string;
      };
      ignoreDuplicateModules: string[];
    }): void;
  };

  // State
  editorLoaded?: boolean;
}
