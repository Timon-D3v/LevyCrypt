/**
 * Uploads an image to the ImageKit server.
 * @param {string} base64 - The base64 encoded image data.
 * @param {string} name - The name of the image file.
 * @param {string} folder - The folder path where the image should be uploaded.
 * @returns {Promise<Object>} - An object with the path of the uploaded image and the server response.
 */
const imagekitUpload = async (base64, name, folder) => {
  try {
    const res = await new Promise((resolve, reject) => {
      imagekit.upload({
        file: base64,
        fileName: name,
        folder: folder,
        useUniqueFileName: false
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const path = `https://ik.imagekit.io/timon${folder}${name}`;
    return { path, res };
  } catch (error) {
    return { path: "", res: error };
  }
};

export default {
    imagekitUpload: imagekitUpload
};

export {
    imagekitUpload
};