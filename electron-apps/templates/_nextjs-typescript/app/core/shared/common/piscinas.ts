import Piscina from "piscina";

export const ipcPiscina = new Piscina({
    minThreads: 1,
    maxThreads: 4,
    idleTimeout: 10_000
})