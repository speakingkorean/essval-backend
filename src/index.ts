import express from 'express'
import cors from 'cors'
import s3 from './s3.js'
import mysql from './database.js'
import logger from './logger.js'
import multer from 'multer'
import { getVideoDurationInSeconds } from 'get-video-duration'
import { StatusCodes } from 'http-status-codes'

const PORT = 3000

const app = express()
app.use(cors())
app.use(express.json())

const storage = multer.memoryStorage()
const upload = multer({ storage })

app.get('/', (req, res) => {
    res.send(`  hi  `)
})

app.get('/api/objects', async (req, res) => {
    res.json(await s3.listObjects())
})

app.get('/api/videoTitles', async (req, res) => {
    res.json(await s3.videoTitles())
})

app.get('/api/signedUrl/:id', async (req, res) => {
    const id = req.params.id
    res.json(await s3.presignedUrl(id))
})

app.get('/api/videoDuration/:id', async (req, res) => {
    const id = req.params.id
    const url = await s3.presignedUrl(id)
    const duration = await getVideoDurationInSeconds(url)
    res.json(duration)
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const file = req.file
    res.json(await s3.uploadFile(file))
})

app.get('/video/all', async (req, res) => {
    res.json(await mysql.getVideos())
})

app.get('/video/find/:id', async (req, res) => {
    const id = req.params.id
    res.json(await mysql.getVideo(+id))
})

app.post('/video/new', async (req, res) => {
    const { title, duration, tags, date } = req.body
    const result = await mysql.uploadVideoWithTags(title, duration, tags, date)
    res.status(StatusCodes.CREATED).json({ result })
})

// app.use((err: Error, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send('Something broke 💩')
// })

app.listen(PORT, () => {
    logger.info(`Running on Port ${PORT}`)
})
