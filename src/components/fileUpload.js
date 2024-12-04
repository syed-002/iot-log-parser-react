import React from "react";
import "../styles/FileUpload.css";

const FileUpload = ({ onFileUpload }) => {
  return (
    <div className="file-upload-container">
      <h2 className="text-xl font-semibold mb-4">Log File Upload</h2>
      <input
        type="file"
        accept=".log"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            onFileUpload(file);
          }
        }}
        className="file-upload-input"
      />
    </div>
  );
};

export default FileUpload;
