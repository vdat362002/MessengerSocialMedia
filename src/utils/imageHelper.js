export const uploadImage = async (files, type) => {
  const images = []

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    type === 'avatar' ? formData.append('upload_preset', 'dqrj70n4') : formData.append('upload_preset', 'b4l5pggi')
    formData.append('cloud_name', 'vandat-social')

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/vandat-social/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      images.push(data.secure_url)
    } catch (err) {
      console.log(err)
    }
  }

  return images
}

// import cloudinary from '../services/cloudinaryService';

// export const uploadImage = async (files, type) => {
//   const images = [];
//   for (const file of files) {
//     try {
//       const response = await cloudinary.uploader.upload(file.path, {
//         folder: `/WebChat/${type === 'avatar' ? "avatar" : "image"}/`,
//       });
//       images.push(response.secure_url);
//     } catch (err) {
//       console.log(err);
//     }
//   }
//   return images;
// }
