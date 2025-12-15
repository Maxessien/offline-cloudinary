import offlineCloudinary from '../utils/offline-cloudinary.js';
import fs from 'fs/promises';

export const viewImage = async(req, res)=>{
    const uploadId = req.params.id
    const data = await fs.readFile("uploads.json", "utf-8")
    const mappings = JSON.parse(data)
    res.setHeader("Content-Disposition", "inline")
    return res.sendFile(`${offlineCloudinary.rootPath}/${mappings[uploadId]}`)
}