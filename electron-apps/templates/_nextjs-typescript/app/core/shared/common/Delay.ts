export namespace Delay {
    export function of(ms: number) {
        return new Promise<void>(res => {
            setTimeout(() => {
                res()
            }, ms);
        })
    }
}