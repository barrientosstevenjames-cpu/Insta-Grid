import { useEffect, useState } from 'react';
import Download from '../Components/Download';
import DragnDrop from '../Components/DragnDrop';
import ImageConvert from '../Components/ImageConvert';
import ImageCutter from '../Components/ImageCutter';
import './Home.css';

function Home() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [outputImages, setOutputImages] = useState([]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleImageSelect(nextFile, error) {
    if (error) {
      setUploadError(error);
      return;
    }

    setFile(nextFile);
    setOutputImages([]);
    setUploadError('');
  }

  return (
    <main className="home-page">
      <div className="home-page__content">
        <header className="home-header">
        </header>

        <section className="intro">
          <h1>InstaGrid</h1>
        </section>

        <section className="upload-section" aria-labelledby="upload-title">
          <div className="section-heading">
            <div>
              <h2 id="upload-title">Insert image here</h2>
            </div>
          </div>
          <DragnDrop fileName={file && file.name} onImageSelect={handleImageSelect} />
          {uploadError && <p className="form-error" role="alert">{uploadError}</p>}
        </section>

        {file ? (
          <div className="workspace">
            <div className="tool-stack">
              <ImageConvert file={file} onCreate={setOutputImages} />
              <ImageCutter file={file} onCreate={setOutputImages} />
            </div>

            <aside className="home-sidebar">
              <section className="source-preview" aria-label="Selected image">
                <h2>Selected image</h2>
                <img src={previewUrl} alt="Selected original" />
                <p>{file.name}</p>
              </section>
              <Download images={outputImages} />
            </aside>
          </div>
        ) : (
          <div className="home-empty">
          </div>
        )}
      </div>
    </main>
  );
}

export default Home;