import * as zlib from 'zlib';


export class GZipHelper {
    static zip(stringValue: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            zlib.gzip(Buffer.from(stringValue, 'utf-8'), (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }

    static unzip(bytes: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            zlib.gunzip(bytes, (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result.toString('utf-8'));
            });
        });
    }
}