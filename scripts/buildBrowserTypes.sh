#!/bin/sh

# Move into a temporary directory
rm -rf tmp && mkdir -p tmp
cd tmp

# Clone types package
curl -o types.tgz $(npm view @types/webextension-polyfill dist.tarball)
tar -xzvf types.tgz

# Create types file by concatenating all types
for f in webextension-polyfill/namespaces/*.d.ts; do
sed '/import/d' $f | sed 's/export namespace/declare namespace/g' >> browser.d.ts
done

sed '/import/d' webextension-polyfill/index.d.ts | sed '/export = Browser;/d' | sed 's/declare namespace Browser/declare namespace browser/' >> browser.d.ts
echo $"interface Window {\nbrowser: typeof Browser;\n}" >> browser.d.ts

# Save to src/ folder
cd ..
mkdir -p src/static
cp tmp/browser.d.ts src/static/browser.d.ts.txt
