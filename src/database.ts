// https://www.youtube.com/watch?v=Hej48pi_lOc
import mysql from 'mysql2'

import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

async function getNotes() {
    const [rows] = await pool.query("SELECT * FROM notes")
    return rows
}

async function getNote(id: string) {
    const [rows] = await pool.query(`
        SELECT * 
        FROM notes
        WHERE id = ?
        `, [id])
    return rows[0]
}

async function createNote(title: string, contents: string) {
    const [result] = await pool.query(`
        INSERT INTO notes (title, contents)
        VALUES (?, ?)
        `, [title, contents])
    const id = result.insertId
    console.log(id)
    return getNote(id)
}

export default {
    getNotes,
    getNote,
    createNote
}