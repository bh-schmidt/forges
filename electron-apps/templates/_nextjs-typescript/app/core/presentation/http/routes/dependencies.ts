import { DependencyHandler } from "@infrastructure/handlers/dependency-handler/DependencyHandler"
import { Router } from "express"

const depencencies = Router()

depencencies.patch('/:state', (req, res) => {
    const state = req.params.state == 'true'
    DependencyHandler.events.emit('install', state)
    res.send()
})

export default depencencies