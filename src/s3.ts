import { S3Client, ListObjectsCommand, GetObjectCommand, PutObjectCommand, S3ServiceException } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import dotenv from 'dotenv'
dotenv.config()

const bucketName = process.env.S3_BUCKET_NAME
const region = process.env.S3_BUCKET_REGION

const client = new S3Client({
    region
})

async function listObjects() {
    const input = {
        Bucket: bucketName,
        MaxKeys: 10
    }
    const command = new ListObjectsCommand(input)
    return await client.send(command)
}

async function videoTitles() {
    const input = {
        Bucket: bucketName,
        MaxKeys: 100
    }
    const command = new ListObjectsCommand(input)
    const response = await client.send(command)
    const contents = response.Contents
    const videoNames = contents?.map((content) => content.Key)
    return videoNames
}

async function presignedUrl(title: string) {
    const input = {
        Bucket: bucketName,
        Key: title,
    }
    const command = new GetObjectCommand(input)
    const url = await getSignedUrl(client, command, { expiresIn: 3600 })
    return url
}

async function uploadFile(file) {
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    })

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
}

export default {
    listObjects,
    videoTitles,
    presignedUrl,
    uploadFile,
}