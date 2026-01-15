import offlineCloudinary from '../utils/offline-cloudinary.js';

export const viewImage = async(req, res)=>{
    const uploadId = req.params.id
    const mappings = offlineCloudinary.mappingsInMemory
    res.setHeader("Content-Disposition", "inline")
    return res.sendFile(`${mappings[uploadId]}`)
}