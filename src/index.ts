import express from 'express'
import cors from 'cors'
import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from 'multer'
import dotenv from 'dotenv'
dotenv.config()

const bucketName = process.env.S3_BUCKET_NAME
const region = process.env.S3_BUCKET_REGION

const client = new S3Client({
    region
})

const app = express()
app.use(cors())

const storage = multer.memoryStorage()
const upload = multer({ storage })
const PORT = 3000

app.get('/', (req, res) => {
    res.send(`
        <h2>File Upload With <code>"Node.js"</code></h2>
        <form action="/api/upload" enctype="multipart/form-data" method="post">
          <div>Select a file: 
            <input type="file" name="file" />
          </div>
          <input type="submit" value="Upload" />
        </form>
    `)
})

app.get('/api/objects', async (req, res) => {
    const input = {
        Bucket: bucketName,
        MaxKeys: 10
    }
    const command = new ListObjectsCommand(input)
    const response = await client.send(command)
    res.json(response)
})

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const file = req.file
    console.log(file)
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: file?.originalname,
        Body: file?.buffer,
        ContentType: file?.mimetype,
    });

    try {
        const response = await client.send(command);
        console.log(response);
    } catch (caught) {
        if (
            caught instanceof S3ServiceException &&
            caught.name === "EntityTooLarge"
        ) {
            console.error(
                `Error from S3 while uploading object to ${bucketName}. \
  The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
  or the multipart upload API (5TB max).`,
            );
        } else if (caught instanceof S3ServiceException) {
            console.error(
                `Error from S3 while uploading object to ${bucketName}.  ${caught.name}: ${caught.message}`,
            );
        } else {
            throw caught;
        }
    }
})

app.get('/api/videoTitles', async (req, res) => {
    const input = {
        Bucket: bucketName,
        MaxKeys: 100
    }
    const command = new ListObjectsCommand(input)
    const response = await client.send(command)
    const contents = response.Contents
    const videoNames = contents?.map((content) => content.Key)
    res.json(videoNames)
})

app.get('/api/signedUrl/:title', async (req, res) => {
    // "Key": "Saintway – Here Comes The Fire.mp4",
    const title = req.params.title
    const input = {
        Bucket: bucketName,
        Key: title,
    }
    const command = new GetObjectCommand(input)
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    res.json({ url })
})

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
