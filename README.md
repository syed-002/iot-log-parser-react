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

const parseLogEntry = (logEntry, incrementMalformedCount, storeErrorLog, updateErrorCounts) => {
if (!logEntry.trim()) {
return null;
}

try {
const logPattern =
/([\d\-T:.]+)\suser=([a-zA-Z0-9_]+)\sip=([0-9.]+)\saction=([a-zA-Z0-9_]+)/;

    const match = logEntry.match(logPattern);

    if (match) {
      const timestamp = match[1];
      const user = match[2];
      const ip = match[3];
      const action = match[4];

      return {
        type: "json",
        timestamp,
        user,
        ip,
        event: action,
        details: null,
        image: null,
      };
    }

    if (logEntry.includes("NullPointerException")) {
      const timestampMatch = logEntry.match(
        /NullPointerException\s+at\s+line\s+(\d+)\s+([\d\-T:.]+)/
      );
      if (timestampMatch) {
        const timestamp = timestampMatch[2];
        const message = "NullPointerException at line " + timestampMatch[1];
        storeErrorLog({ timestamp, message, type: "NullPointerException" });
        updateErrorCounts("NullPointerException");
        return { type: "null_pointer_exception", timestamp, message };
      }
    }

    if (logEntry.includes("TimeoutError: Connection to DB failed")) {
      const timestampMatch = logEntry.match(
        /TimeoutError: Connection to DB failed\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        const message = "TimeoutError: Connection to DB failed";
        storeErrorLog({ timestamp, message, type: "TimeoutError" });
        updateErrorCounts("TimeoutError");
        return { type: "timeout_error", timestamp, message };
      }
    }

    if (logEntry.includes("KeyError: 'action_type'")) {
      const timestampMatch = logEntry.match(
        /KeyError: 'action_type'\s(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+)/
      );
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        const message = "KeyError: 'action_type'";
        storeErrorLog({ timestamp, message, type: "KeyError" });
        updateErrorCounts("KeyError");
        return { type: "key_error", timestamp, message };
      }
    }

    // Handle additional error types similarly...

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
const [errorLogs, setErrorLogs] = useState([]);
const [performanceMetrics, setPerformanceMetrics] = useState({
processingTime: 0,
totalLogs: 0,
successfulParse: 0,
failedParse: 0,
});
const [malformedLogCount, setMalformedLogCount] = useState(0);
const [errorList, setErrorList] = useState([]);
const [errorCounts, setErrorCounts] = useState({
TimeoutError: 0,
NullPointerException: 0,
KeyError: 0,
IndexOutOfBoundsException: 0,
InvalidBase64: 0,
MalformedJSON: 0,
});

const incrementMalformedCount = useCallback(() => {
setMalformedLogCount((prevCount) => prevCount + 1);
}, []);

const storeErrorLog = useCallback((error) => {
setErrorList((prevErrors) => [...prevErrors, error]);
}, []);

const updateErrorCounts = (errorType) => {
setErrorCounts((prevCounts) => ({
...prevCounts,
[errorType]: prevCounts[errorType] + 1,
}));
};

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
        if (
          parsedEntry.type === "error" ||
          parsedEntry.type === "parse_error"
        ) {
          errors.push(parsedEntry);
        } else {
          parsed.push(parsedEntry);
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

      {/* Error Count Chart */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="font-bold mb-2">Error Types</h2>
        <BarChart width={600} height={300} data={Object.entries(errorCounts).map(([type, count]) => ({ type, count }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>

      {/* Error Logs Table */}
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
    </div>

);
};

export default IoTLogParser;
