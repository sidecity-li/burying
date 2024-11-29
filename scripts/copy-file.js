import fs from 'fs';
import path from 'path';

function getFilePath(rawPath) {
    const cwd = process.cwd();
    return path.resolve(cwd, rawPath)
}

export default function copyFile(options) {
    const {source, destination, beforeWrite} = options;
   
    const sourceFile = getFilePath(source);

    const destinationFile = getFilePath(destination);

    let content = fs.readFileSync(sourceFile, 'utf-8');

    if(beforeWrite) {
        content = beforeWrite(content)
    }

    fs.writeFileSync(destinationFile, content, 'utf-8')

}