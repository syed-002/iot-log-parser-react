import React from "react";

const LogFileUpload = ({ readLogFile }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold mb-2">Upload Log File</h2>
      <input
        type="file"
        accept=".log"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            readLogFile(file);
          }
        }}
      />
    </div>
  );
};

export default LogFileUpload;
