import React from "react";

const ErrorLogs = ({ errorList }) => {
  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h2 className="font-bold mb-2">Error Logs</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">Error Type</th>
            <th className="border p-2">Message</th>
          </tr>
        </thead>
        <tbody>
          {errorList.map((error, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border p-2">{error.timestamp}</td>
              <td className="border p-2">{error.type}</td>
              <td className="border p-2">{error.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ErrorLogs;
