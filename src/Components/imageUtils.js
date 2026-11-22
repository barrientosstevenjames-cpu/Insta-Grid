export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image could not be opened.'));
    };
    image.src = url;
  });
}

export function canvasToBlob(canvas, format) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('The image could not be converted.'));
        return;
      }

      if (blob.type !== format) {
        reject(new Error(`Your browser does not support ${format.split('/')[1].toUpperCase()} export.`));
        return;
      }

      resolve(blob);
    }, format, 0.92);
  });
}

export function getFileBaseName(fileName) {
  return fileName.replace(/\.[^.]+$/, '') || 'image';
}

export function getFileExtension(format) {
  return format === 'image/jpeg' ? 'jpg' : format.split('/')[1];
}
