import http from 'http';
import { DependencyHandler } from '../DependencyHandler';

export async function install(callbackPort: number | undefined, handler: DependencyHandler) {
    handler.logger.info('Installing dependencies')
    await sendCallback(callbackPort, true)
}

function sendCallback(callbackPort: number | undefined, state: boolean) {
    if (!callbackPort) {
        return;
    }

    return new Promise((resolve, reject) => {
        const req = http.request({
            port: callbackPort,
            host: 'localhost',
            method: 'PATCH',
            path: `/dependencies/${state}`
        })

        req.on('finish', () => {
            resolve(true)
        })

        req.on('error', (err) => {
            reject(new Error(`Connection error: ${err.message}`));
        });

        req.end()
    });
}