import React from "react";

const MalformedLogs = ({ malformedLogCount }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold mb-2">Malformed Log Entries</h2>
      <p>Total Malformed Logs: {malformedLogCount}</p>
    </div>
  );
};

export default MalformedLogs;
