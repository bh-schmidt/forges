export namespace Random {
    export function maxFloat(max: number) {
        return Math.random() * max;
    }

    export function maxInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    export function randomFloat(min: number, max: number) {
        const realMax = max - min + 1
        return Math.random() * realMax + min;
    }

    export function randomInt(min: number, max: number) {
        const realMax = max - min + 1
        return Math.floor(Math.random() * realMax + min);
    }
}