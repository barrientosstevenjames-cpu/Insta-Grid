import { useEffect, useState } from 'react';

function Download({ images }) {
  const [downloadItems, setDownloadItems] = useState([]);

  useEffect(() => {
    const items = images.map((image) => ({
      ...image,
      url: URL.createObjectURL(image.blob),
    }));

    setDownloadItems(items);
    return () => items.forEach((image) => URL.revokeObjectURL(image.url));
  }, [images]);

  return (
    <section className="download-panel" aria-labelledby="download-title">
      <div className="download-panel__heading">
        <div>
          <h2 id="download-title">Your images</h2>
          <p>
            {images.length
              ? `${images.length} image${images.length === 1 ? '' : 's'} ready`
              : 'Resize or cut an image to see your downloads here.'}
          </p>
        </div>
      </div>

      {downloadItems.length > 0 && (
        <ul className="download-list">
          {downloadItems.map((image) => (
            <li className="download-item" key={image.name}>
              <img src={image.url} alt="" />
              <span className="download-item__name" title={image.name}>{image.name}</span>
              <a
                className="download-item__button"
                href={image.url}
                download={image.name}
                aria-label={`Download ${image.name}`}
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Download;