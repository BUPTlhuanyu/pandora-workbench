/**
 * @file
 */
export function isFilePath(path: string) {
    if (typeof path !== 'string') {
        return false;
    }
    const lastIndexof = path.lastIndexOf('/');
    const fileName = path.substring(lastIndexof);
    return fileName.indexOf('.') > -1;
}