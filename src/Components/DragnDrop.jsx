function DragnDrop({ fileName, onImageSelect }) {
  function selectFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onImageSelect(null, 'Choose an image file to continue.');
      return;
    }

    onImageSelect(file, '');
  }

  function handleDrop(event) {
    event.preventDefault();
    selectFile(event.dataTransfer.files[0]);
  }

  return (
    <label
      className="upload-area"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <span className="upload-area__icon" aria-hidden="true">↑</span>
      <strong>{fileName || 'Drop an image here'}</strong>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          selectFile(event.target.files[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}

export default DragnDrop;