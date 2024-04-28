ROOT=$PWD/node_modules/monaco-editor/esm/vs
OPTS="--no-source-maps"        # Parcel options - See: https://parceljs.org/cli.html

npx parcel build $ROOT/language/json/json.worker.js $OPTS
npx parcel build $ROOT/language/css/css.worker.js $OPTS
npx parcel build $ROOT/language/html/html.worker.js $OPTS
npx parcel build $ROOT/language/typescript/ts.worker.js $OPTS
npx parcel build $ROOT/editor/editor.worker.js $OPTS
