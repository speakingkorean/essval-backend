import express from 'express'
import cors from 'cors'
import s3 from './s3.js';
import mysql from './database.js';
import multer from 'multer'
import dotenv from 'dotenv'
import { getVideoDurationInSeconds } from 'get-video-duration';
dotenv.config()

const PORT = 3000

const app = express()
app.use(cors())

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

app.get("/notes", async (req, res) => {
    res.send(await mysql.getNotes())
})

app.get("/notes/:id", async (req, res) => {
    const id = req.params.id
    res.send(await mysql.getNote(id))
})

app.post("/notes", async (req, res) => {
    const { title, contents } = req.body
    res.status(201).send(await mysql.createNote(title, contents))
})

// app.use((err: Error, req, res, next) => {
//     console.error(err.stack)
//     res.status(500).send('Something broke 💩')
// })

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
