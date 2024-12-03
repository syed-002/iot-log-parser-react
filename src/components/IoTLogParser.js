import React, { useState, useEffect, useCallback } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// Function to decode the base64 image (if present)
const decodeBase64Image = (base64Image) => {
  const imageData = base64Image.split(",")[1]; // Extract the base64 data from the prefix
  return imageData; // This could be expanded to actually render the image in some cases
};

const parseLogEntry = (
  logEntry,
  incrementMalformedCount,
  storeErrorLog,
  updateErrorCounts
) => {
  if (!logEntry.trim()) {
    // Skip empty or whitespace-only lines
    return null;
  }

  try {
    // Handle the specific log format (tc: "2024-12-01T14:29:09.181812 user=user_502 ip=141.11.96.144 action=START")
    // const logPattern =
    //   /tc:\s"([\d\-T:.]+)\suser=([a-zA-Z0-9_]+)\sip=([0-9.]+)\saction=([a-zA-Z0-9_]+)"/;
    const logPattern =
      /([\d\-T:.]+)\suser=([a-zA-Z0-9_]+)\sip=([0-9.]+)\saction=([a-zA-Z0-9_]+)/;

    const match = logEntry.match(logPattern);

    if (match) {
      const timestamp = match[1];
      const user = match[2];
      const ip = match[3];
      const action = match[4];

      // Return in JSON-like structure
      return {
        type: "json", // Type set to "json" to follow the same structure as JSON-based logs
        timestamp,
        user,
        ip,
        event: action, // Treat action as the event
        details: null, // Add more fields as needed
        image: null, // Handle image if needed later
      };
    }

    // Check for NullPointerException log entry
    if (logEntry.includes("NullPointerException")) {
      const timestampMatch = logEntry.match(
        /NullPointerException\s+at\s+line\s+(\d+)\s+([\d\-T:.]+)/ // Regex for matching the "NullPointerException" format
      );

      if (timestampMatch) {
        const timestamp = timestampMatch[2];
        updateErrorCounts("NullPointerException");
        const message = "NullPointerException at line 42" + timestampMatch[2];
        storeErrorLog({ timestamp, message, type: "NullPointerException" });
        return { type: "null_pointer_exception", timestamp, message };
      }
    }

    // Check for IndexOutOfBoundsException log entry
    if (logEntry.includes("IndexOutOfBoundsException")) {
      const timestampMatch = logEntry.match(
        /IndexOutOfBoundsException\s+in\s+module\s+([a-zA-Z0-9_]+)\s+([\d\-T:.]+)/ // Regex for matching the "IndexOutOfBoundsException" format
      );

      if (timestampMatch) {
        updateErrorCounts("IndexOutOfBoundsException");
        const timestamp = timestampMatch[2];
        const message =
          "IndexOutOfBoundsException in module " + timestampMatch[1];
        storeErrorLog({
          timestamp,
          message,
          type: "IndexOutOfBoundsException",
        });
        return { type: "index_out_of_bounds_exception", timestamp, message };
      }
    }

    // Check for timeout error log entry
    if (logEntry.includes("TimeoutError: Connection to DB failed")) {
      const timestampMatch = logEntry.match(
        /TimeoutError: Connection to DB failed\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );

      if (timestampMatch) {
        updateErrorCounts("TimeoutError");

        const timestamp = timestampMatch[1];
        const message = "TimeoutError: Connection to DB failed";
        storeErrorLog({ timestamp, message, type: "TimeoutError" });
        return { type: "timeout_error", timestamp, message };
      }
    }

    // Check for KeyError
    if (logEntry.includes("KeyError: 'action_type'")) {
      const timestampMatch = logEntry.match(
        /KeyError: 'action_type'\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );

      if (timestampMatch) {
        updateErrorCounts("KeyError");

        const timestamp = timestampMatch[1];
        const message = "KeyError: 'action_type'";
        storeErrorLog({ timestamp, message, type: "KeyError" });
        return { type: "key_error", timestamp, message };
      }
    }

    // Check for InvalidBase64 error
    if (logEntry.includes("InvalidBase64")) {
      const timestampMatch = logEntry.match(
        /InvalidBase64:\s(.+)\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );

      if (timestampMatch) {
        updateErrorCounts("InvalidBase64");

        const timestamp = timestampMatch[2];
        const message = "InvalidBase64: " + timestampMatch[1];
        storeErrorLog({ timestamp, message, type: "InvalidBase64" });
        return { type: "invalid_base64", timestamp, message };
      }
    }

    // Check for other general error logs
    if (logEntry.includes("Malformed JSON object")) {
      const timestampMatch = logEntry.match(
        /Malformed JSON object\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );

      if (timestampMatch) {
        updateErrorCounts("MalformedJSON");
        const timestamp = timestampMatch[1];
        const message = "Malformed JSON object";
        storeErrorLog({ timestamp, message, type: "MalformedJSON" });

        // Increment malformed log count
        incrementMalformedCount(); // This line is added
        return { type: "malformed_json", timestamp, message };
      }
    }

    // Handle standard log entry parsing
    if (logEntry.startsWith("{")) {
      const jsonLog = JSON.parse(logEntry);
      return {
        type: "json",
        user: jsonLog.user,
        timestamp: jsonLog.timestamp,
        ip: jsonLog.ip,
        event: jsonLog.event,
        details: jsonLog.details,
        image: jsonLog.iot_device_image
          ? decodeBase64Image(jsonLog.iot_device_image)
          : null,
      };
    }

    // General error handling for unknown errors
    // if (logEntry.includes("ERROR")) {
    //   return {
    //     type: "error",
    //     message: logEntry,
    //   };
    // }

    // Return null for malformed logs
    return null;
  } catch (error) {
    return {
      type: "parse_error",
      originalLog: logEntry,
      error: error.message,
    };
  }
};

const IoTLogParser = () => {
  const [parsedLogs, setParsedLogs] = useState([]);
  const [errorCounts, setErrorCounts] = useState({
    TimeoutError: 0,
    NullPointerException: 0,
    KeyError: 0,
    IndexOutOfBoundsException: 0,
    InvalidBase64: 0,
    MalformedJSON: 0,
  });
  const [errorLogs, setErrorLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    processingTime: 0,
    totalLogs: 0,
    successfulParse: 0,
    failedParse: 0,
  });
  const [malformedLogCount, setMalformedLogCount] = useState(0); // State to track malformed logs
  const [errorList, setErrorList] = useState([]); // State to store all errors with timestamp

  // Callback function to increment malformed log count
  const incrementMalformedCount = useCallback(() => {
    setMalformedLogCount((prevCount) => prevCount + 1);
  }, []);

  const updateErrorCounts = (errorType) => {
    setErrorCounts((prevCounts) => ({
      ...prevCounts,
      [errorType]: prevCounts[errorType] + 1,
    }));
  };

  // Callback function to store error logs
  const storeErrorLog = useCallback((error) => {
    setErrorList((prevErrors) => [...prevErrors, error]);
  }, []);

  // Read logs from a file (this part assumes logs will be uploaded)
  const readLogFile = async (file) => {
    const fileText = await file.text();
    const logArray = fileText.split("\n");
    parseLogs(logArray);
  };

  const parseLogs = (logArray) => {
    const startTime = performance.now();

    const parsed = [];
    const errors = [];

    logArray.forEach((log) => {
      const parsedEntry = parseLogEntry(
        log,
        incrementMalformedCount,
        storeErrorLog,
        updateErrorCounts
      );
      if (parsedEntry) {
        // If parsed entry is an error type, add to error list
        if (
          parsedEntry.type === "error" ||
          parsedEntry.type === "parse_error"
        ) {
          errors.push(parsedEntry);
        } else {
          console.log(parsedEntry);
          parsed.push(parsedEntry); // Add non-error logs to parsed
        }
      }
    });

    const endTime = performance.now();

    setParsedLogs(parsed);
    setErrorLogs(errors);
    setPerformanceMetrics({
      processingTime: endTime - startTime,
      totalLogs: logArray.length,
      successfulParse: parsed.length,
      failedParse: errors.length,
    });
  };

  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">IoT Log Parser Dashboard</h1>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold">Performance Metrics</h2>
          <p>
            Processing Time: {performanceMetrics.processingTime.toFixed(2)} ms
          </p>
          <p>Total Logs: {performanceMetrics.totalLogs}</p>
          <p>Successful Parse: {performanceMetrics.successfulParse}</p>
          <p>Failed Parse: {performanceMetrics.failedParse}</p>
        </div>
      </div>

      {/* Log File Input */}
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

      {/* Malformed Log Count */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">Malformed Log Entries</h2>
        <p>Total Malformed Logs: {malformedLogCount}</p>
      </div>

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
            {errorList
              .filter((error) => error.timestamp && error.type && error.message) // Filter out logs with no data
              .map((error, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border p-2">{error.timestamp}</td>
                  <td className="border p-2">{error.type}</td>
                  <td className="border p-2">{error.message}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Error Count Chart */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">Error Types</h2>
        <BarChart
          width={600}
          height={300}
          data={Object.entries(errorCounts).map(([type, count]) => ({
            type,
            count,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Parsed Logs Table */}
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
            {parsedLogs
              .filter((log) => log.event && log.user) // Example filter to only show logs with an event and user
              .map((log, index) => (
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
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
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
    </div>
  );
};

export default IoTLogParser;
