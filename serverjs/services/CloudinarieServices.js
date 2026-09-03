const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFilesToCloudinary = async files => {
  const uploadPromises = files.map(file =>
    cloudinary.uploader.upload(file.path, {
      upload_preset: process.env.IMG_UPLOAD_PRESET
    })
  )

  const uploadResults = await Promise.all(uploadPromises)
  return uploadResults.map(result => result.secure_url)
}
