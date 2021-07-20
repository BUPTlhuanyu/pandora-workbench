/**
 * @file
 */
export function blobToBase64(blob: File) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = function (e: ProgressEvent<FileReader>) {
            e.target ? resolve(e.target.result) : reject(new Error('transfer base64 failed'));
        };

        reader.onabort = function () {
            reject(new Error('[pandora]: image data abort'));
        }

        reader.onerror = function () {
            reject(new Error('[pandora]: image data error'));
        }

        reader.readAsDataURL(blob);
    });
}

// TODO: 完善并放到 common 中
export function getFileName() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const hours = date.getHours();
    const second = date.getSeconds();
    const milsecond = date.getMilliseconds();
    return `${year}${month}${day}${hours}${second}${milsecond}${Math.random()* 1e6 | 0}.png`;
}
