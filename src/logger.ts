import { pino } from 'pino'


const logger = pino({
    transport: {
        target: 'pino-pretty',
        level: process.env.PINO_LOG_LEVEL || 'info',
        options: {
            // translateTime: true
        }
    }
})

export default logger