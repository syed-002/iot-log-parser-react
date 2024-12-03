import React from "react";

const ParsedLogs = ({ parsedLogs }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">Parsed Logs</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">User</th>
            <th className="border p-2">IP</th>
            <th className="border p-2">Action/Event</th>
            <th className="border p-2">Item Details</th>
            <th className="border p-2">Image</th>
          </tr>
        </thead>
        <tbody>
          {parsedLogs.map((log, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border p-2">{log.timestamp}</td>
              <td className="border p-2">{log.user || "N/A"}</td>
              <td className="border p-2">{log.ip || "N/A"}</td>
              <td className="border p-2">{log.event || "N/A"}</td>
              <td className="border p-2">
                {log.details ? (
                  <>
                    <div>Item ID: {log.details.item_id}</div>
                    <div>Quantity: {log.details.quantity}</div>
                    <div>Price: {log.details.price}</div>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
              <td className="border p-2">
                {log.image ? (
                  <img
                    src={`data:image/png;base64,${log.image}`}
                    alt="Device Image"
                    className="w-16 h-16"
                  />
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParsedLogs;
