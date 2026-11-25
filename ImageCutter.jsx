import { useState } from 'react';
import {
  canvasToBlob,
  getFileBaseName,
  getFileExtension,
  loadImage,
} from './imageUtils';

const GRID_OPTIONS = [
  { id: '2x2', label: '2 × 2 grid', rows: 2, columns: 2 },
  { id: '3x3', label: '3 × 3 grid', rows: 3, columns: 3 },
  { id: '4x4', label: '4 × 4 grid', rows: 4, columns: 4 },
  { id: 'custom', label: 'Custom grid', rows: 2, columns: 2 },
];

function ImageCutter({ file, onCreate }) {
  const [gridId, setGridId] = useState('2x2');
  const [rows, setRows] = useState(2);
  const [columns, setColumns] = useState(2);
  const [format, setFormat] = useState('image/jpeg');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedGrid = GRID_OPTIONS.find((option) => option.id === gridId);
  const outputRows = gridId === 'custom' ? Number(rows) : selectedGrid.rows;
  const outputColumns = gridId === 'custom' ? Number(columns) : selectedGrid.columns;

  function chooseGrid(event) {
    const nextGrid = GRID_OPTIONS.find((option) => option.id === event.target.value);
    setGridId(nextGrid.id);
    if (nextGrid.id === 'custom') {
      setRows(nextGrid.rows);
      setColumns(nextGrid.columns);
    }
    setError('');
  }

  async function cutImage() {
    if (!Number.isInteger(outputRows) || !Number.isInteger(outputColumns) ||
      outputRows < 1 || outputColumns < 1 || outputRows > 10 || outputColumns > 10) {
      setError('Choose between 1 and 10 rows and columns.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const image = await loadImage(file);
      if (image.width * image.height > 40000000) {
        throw new Error('This image is over 40 megapixels and is too large to cut safely.');
      }
      if (outputRows > image.height || outputColumns > image.width) {
        throw new Error('Rows and columns cannot be larger than the image dimensions.');
      }

      const extension = getFileExtension(format);
      const baseName = getFileBaseName(file.name);
      const pieces = [];

      for (let row = 0; row < outputRows; row += 1) {
        const top = Math.floor((row * image.height) / outputRows);
        const bottom = Math.floor(((row + 1) * image.height) / outputRows);

        for (let column = 0; column < outputColumns; column += 1) {
          const left = Math.floor((column * image.width) / outputColumns);
          const right = Math.floor(((column + 1) * image.width) / outputColumns);
          const pieceWidth = right - left;
          const pieceHeight = bottom - top;
          const canvas = document.createElement('canvas');
          canvas.width = pieceWidth;
          canvas.height = pieceHeight;

          const context = canvas.getContext('2d');
          if (!context) throw new Error('Your browser could not prepare the image pieces.');

          if (format === 'image/jpeg') {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, pieceWidth, pieceHeight);
          }

          context.drawImage(
            image,
            left,
            top,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          const blob = await canvasToBlob(canvas, format);
          pieces.push({
            name: `${baseName}-row-${row + 1}-column-${column + 1}.${extension}`,
            blob,
          });
        }
      }

      onCreate(pieces);
    } catch (cutError) {
      setError(cutError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel" aria-labelledby="cut-title">
      <div className="tool-panel__heading">
        <span className="tool-panel__number">02</span>
        <div>
          <h2 id="cut-title">Cut into a grid</h2>
          <p>Split your image into equal pieces to download separately.</p>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="cut-grid">Grid size</label>
        <select id="cut-grid" value={gridId} onChange={chooseGrid}>
          {GRID_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
      </div>

      {gridId === 'custom' && (
        <div className="dimension-fields">
          <div className="form-field">
            <label htmlFor="cut-rows">Rows</label>
            <input
              id="cut-rows"
              type="number"
              min="1"
              max="10"
              value={rows}
              onChange={(event) => setRows(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="cut-columns">Columns</label>
            <input
              id="cut-columns"
              type="number"
              min="1"
              max="10"
              value={columns}
              onChange={(event) => setColumns(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-field">
        <label htmlFor="cut-format">Piece format</label>
        <select
          id="cut-format"
          value={format}
          onChange={(event) => setFormat(event.target.value)}
        >
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
        </select>
      </div>

      <p className="tool-panel__note">
        {outputRows} rows × {outputColumns} columns · {outputRows * outputColumns} pieces
      </p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="button" onClick={cutImage} disabled={busy}>
        {busy ? 'Cutting…' : 'Cut image'}
      </button>
    </section>
  );
}

export default ImageCutter;
