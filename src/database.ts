import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function getVideos() {
    const [rows] = await pool.query("SELECT * FROM videos")
    return rows
}

async function getVideo(id: number): Promise<RowDataPacket | undefined> {
    const [rows] = await pool.query<RowDataPacket[]>(`
        SELECT * 
        FROM videos
        WHERE id = ?
        `, [id])
    return rows[0]
}

async function uploadVideoWithTags(title: string, duration: number, tags: string[], date: Date) {
    const tag_ids = await toTagIds(tags)
    return await uploadVideoWithTagIds(title, duration, tag_ids, date)
}

async function uploadVideoWithTagIds(title: string, duration: number, tag_ids: number[], date: Date) {
    const [resultSetHeader] = await pool.query<ResultSetHeader>(`
        INSERT INTO videos (title, duration, date)
        VALUES (?, ?, ?)
        `, [title, duration, date])
    const video_id = resultSetHeader.insertId
    const resultSetHeaders = []
    for (const tag_id of tag_ids) {
        resultSetHeaders.push(await tag(video_id, tag_id))
    }
    return resultSetHeaders
}

async function toTagIds(tags: string[]): Promise<number[]> {
    return await Promise.all(tags.map(tag => getTagId(tag)))
}

interface Tag extends RowDataPacket {
    id: number
    name: string
}

async function getTagId(tag: string): Promise<number> {
    const [rows] = await pool.query(`
        SELECT id FROM tags
        WHERE name = ?
        `, [tag])
    return rows[0].id
}

async function tag(video_id: number, tag_id: number): Promise<ResultSetHeader> {
    // const tag_id = await t_id
    const [resultSetHeader] = await pool.query<ResultSetHeader>(`
        INSERT INTO videos_tags (video_id, tag_id)
        VALUES (?, ?)
        `, [video_id, tag_id])
    // const id = result.insertId
    return resultSetHeader
}

export default {
    getVideos,
    getVideo,
    uploadVideoWithTags,
}