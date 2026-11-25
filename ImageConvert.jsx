import { useState } from 'react';
import {
  canvasToBlob,
  getFileBaseName,
  getFileExtension,
  loadImage,
} from './imageUtils';

const SIZE_OPTIONS = [
  { id: 'square', label: 'Square / US passport · 2 × 2 in', width: 600, height: 600 },
  { id: 'passport', label: 'Passport · 35 × 45 mm', width: 413, height: 531 },
  { id: '4x6', label: 'Print · 4 × 6 in', width: 1200, height: 1800 },
  { id: 'custom', label: 'Custom size', width: 800, height: 800 },
];

function ImageConvert({ file, onCreate }) {
  const [sizeId, setSizeId] = useState('square');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(800);
  const [fit, setFit] = useState('cover');
  const [format, setFormat] = useState('image/jpeg');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedSize = SIZE_OPTIONS.find((option) => option.id === sizeId);
  const outputWidth = sizeId === 'custom' ? Number(width) : selectedSize.width;
  const outputHeight = sizeId === 'custom' ? Number(height) : selectedSize.height;

  function chooseSize(event) {
    const nextSize = SIZE_OPTIONS.find((option) => option.id === event.target.value);
    setSizeId(nextSize.id);
    setError('');
  }

  async function convertImage() {
    if (!Number.isInteger(outputWidth) || !Number.isInteger(outputHeight) ||
      outputWidth < 1 || outputHeight < 1) {
      setError('Enter a width and height greater than zero.');
      return;
    }

    if (outputWidth * outputHeight > 40000000) {
      setError('Choose dimensions with a total of 40 megapixels or less.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const image = await loadImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Your browser could not prepare the resized image.');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, outputWidth, outputHeight);

      const scale = fit === 'cover'
        ? Math.max(outputWidth / image.width, outputHeight / image.height)
        : Math.min(outputWidth / image.width, outputHeight / image.height);
      const drawnWidth = image.width * scale;
      const drawnHeight = image.height * scale;
      const left = (outputWidth - drawnWidth) / 2;
      const top = (outputHeight - drawnHeight) / 2;

      context.drawImage(image, left, top, drawnWidth, drawnHeight);
      const blob = await canvasToBlob(canvas, format);
      const extension = getFileExtension(format);
      const sizeLabel = sizeId === 'custom' ? 'custom' : sizeId;

      onCreate([{
        name: `${getFileBaseName(file.name)}-${sizeLabel}.${extension}`,
        blob,
      }]);
    } catch (convertError) {
      setError(convertError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel" aria-labelledby="resize-title">
      <div className="tool-panel__heading">
        <span className="tool-panel__number">01</span>
        <div>
          <h2 id="resize-title">Resize for print</h2>
          <p>Make a passport photo, square image, or custom size.</p>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="convert-size">Output size</label>
        <select id="convert-size" value={sizeId} onChange={chooseSize}>
          {SIZE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      {sizeId === 'custom' && (
        <div className="dimension-fields">
          <div className="form-field">
            <label htmlFor="convert-width">Width (px)</label>
            <input
              id="convert-width"
              type="number"
              min="1"
              value={width}
              onChange={(event) => setWidth(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="convert-height">Height (px)</label>
            <input
              id="convert-height"
              type="number"
              min="1"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="convert-fit">Image fit</label>
        <select id="convert-fit" value={fit} onChange={(event) => setFit(event.target.value)}>
          <option value="cover">Crop to fill</option>
          <option value="contain">Fit whole image on white</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="convert-format">File format</label>
        <select
          id="convert-format"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>

      <p className="tool-panel__note">
        Output: {outputWidth || 0} × {outputHeight || 0} px. Print presets use 300 px per inch.
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="button" onClick={convertImage} disabled={busy}>
        {busy ? 'Resizing…' : 'Resize image'}
      </button>
    </section>
  );
}

export default ImageConvert;
