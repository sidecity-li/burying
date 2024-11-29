import copyFile from './copy-file.js'

const args = process.argv.slice(2);

const libName = args[0];

const cwd = process.cwd();

const source = `packages/${libName}/package.json`;

const destination = `${libName}/package.json`;

copyFile({
    source,
    destination,
    beforeWrite: (contentStr) => {
        const contentJson = JSON.parse(contentStr);
        const { main, dependencies, ...rest} = contentJson;

        return JSON.stringify({
            main: 'dist/index.es.js',
            types: "dist/index.d.ts",
            peerDependencies: dependencies,
            files: ["dist"],
            ...rest
        },null, '\t')
    }
})