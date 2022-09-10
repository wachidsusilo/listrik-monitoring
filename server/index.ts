import next from 'next'
import { parse } from 'url'
import { createServer } from 'http'
import { Server } from 'ws'
import { Client, devConnection } from './socket'
import { getData } from './firebase'
import { isValidPeriodType } from '../model/date'

const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()
const port = parseInt(process.env.PORT ?? '3000') ?? 3000

const devSocket = new Server({noServer: true})
devSocket.on('connection', devConnection)

export const getClients = (): Array<Client> => {
    return Array.from(devSocket.clients).map(socket => socket as Client)
}

export const findClientById = (id: string) => {
    for (const client of getClients()) {
        if (client.id === id && client.uid) {
            return client
        }
    }
}

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const url = parse(req.url ?? '', true)
        if (url.pathname === '/api/data') {
            res.setHeader('Content-Type', 'application/json')
            const type = url.query.type
            if (!type || typeof type !== 'string' || !isValidPeriodType(type)) {
                res.end(JSON.stringify({
                    error: 'invalid_type',
                    message: 'The request sent has invalid period type.',
                    data: []
                }))
                return
            }

            getData(type)
                .then((data) => {
                    res.end(JSON.stringify({
                        error: null,
                        message: null,
                        data: data
                    }))
                })
                .catch((e) => {
                    console.log(e)
                    res.end(JSON.stringify({
                        error: e?.code ?? 'internal_server_error',
                        message: e?.message ?? 'An error has occurred while processing the data.',
                        data: []
                    }))
                })
            return
        }
        handle(req, res, url).then()
    })

    server.on('upgrade', (req, socket, head) => {
        const url = parse(req.url ?? '', true)

        if (url.pathname === '/api/device') {
            devSocket.handleUpgrade(req, socket, head, (ws) => {
                devSocket.emit('connection', ws, req)
            })
        }
    })

    server.listen(port, () => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('server ready on http://localhost:3000')
        }
    })
})