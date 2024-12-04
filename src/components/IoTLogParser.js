import React, { useState, useCallback } from "react";
import { parseLogEntry } from "./parseLogEntry";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/IoTLogParser.css";
import "../styles/FileUpload.css";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import FileUpload from "./fileUpload.js";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
  const [errorList, setErrorList] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    processingTime: 0,
    totalLogs: 0,
    successfulParse: 0,
    failedParse: 0,
    logsWithImages: 0, // New state for logs with images
    logsWithoutImages: 0,
  });
  const [malformedLogCount, setMalformedLogCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const incrementMalformedCount = useCallback(() => {
    setMalformedLogCount((prevCount) => prevCount + 1);
  }, []);

  const updateErrorCounts = (errorType) => {
    setErrorCounts((prevCounts) => ({
      ...prevCounts,
      [errorType]: prevCounts[errorType] + 1,
    }));
  };

  const storeErrorLog = useCallback((error) => {
    setErrorList((prevErrors) => [...prevErrors, error]);
  }, []);

  const readLogFile = async (file) => {
    setIsLoading(true);
    setLoadingMessage("Preparing to parse log file...");

    try {
      const fileText = await file.text();
      const logArray = fileText.split("\n");

      // Simulate a slight delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      setLoadingMessage("Parsing logs...");
      parseLogs(logArray);
    } catch (error) {
      console.error("Error reading file:", error);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const parseLogs = (logArray) => {
    const startTime = performance.now();
    const parsed = [];
    const errors = [];
    let logsWithImages = 0;
    let logsWithoutImages = 0;

    logArray.forEach((log, index) => {
      if (index % 100 === 0) {
        setLoadingMessage(`Parsing log ${index} of ${logArray.length}...`);
      }
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
          if (parsedEntry.image) {
            logsWithImages += 1; // Increment counter for logs with images
          } else if (parsedEntry.image === null) {
            logsWithoutImages += 1; // Increment counter for logs without images
          }
        }
      }
    });

    const endTime = performance.now();

    setParsedLogs(parsed);
    setPerformanceMetrics({
      processingTime: endTime - startTime,
      totalLogs: logArray.length,
      successfulParse: parsed.length,
      failedParse: errors.length,
      logsWithImages,
      logsWithoutImages,
    });

    setIsLoading(false);
    setLoadingMessage("");
  };

  const getLogsImageData = () => [
    { name: "Logs with Images", value: performanceMetrics.logsWithImages },
    {
      name: "Logs without Images",
      value: performanceMetrics.logsWithoutImages,
    },
  ];

  const handleTabChange = (event, newValue) => {
    if (parsedLogs.length > 1000) {
      setIsLoading(true);
      setLoadingMessage("Preparing tab data...");

      // Simulate processing time for large datasets
      setTimeout(() => {
        setActiveTab(newValue);
        setIsLoading(false);
        setLoadingMessage("");
      }, 500);
    } else {
      setActiveTab(newValue);
    }
  };

  const getErrorVsLogsData = () => {
    // Calculate total errors
    const totalErrors = Object.values(errorCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    // Calculate total logs
    const totalLogs =
      performanceMetrics.logsWithImages +
      performanceMetrics.logsWithoutImages +
      performanceMetrics.failedParse;

    return [
      { name: "Total Logs", value: totalLogs },
      { name: "Total Errors", value: totalErrors },
    ];
  };

  return (
    <div className={`dashboard-container ${isLoading ? "bg-gray-200" : ""}`}>
      <h1 className="dashboard-title">IoT Log Analysis Dashboard</h1>

      <FileUpload onFileUpload={readLogFile} />

      <Dialog
        open={isLoading}
        aria-labelledby="loading-dialog-title"
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          id="loading-dialog-title"
          style={{ textAlign: "center", color: "#333" }}
        >
          Processing
        </DialogTitle>
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <CircularProgress size={60} />
          <Typography
            variant="body2"
            style={{ marginTop: "15px", color: "#666" }}
          >
            {loadingMessage}
          </Typography>
        </DialogContent>
      </Dialog>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          //   onChange={(event, newValue) => setActiveTab(newValue)}
        >
          <Tab label="Performance Metrics" />
          <Tab label="Parsed logs" />
          <Tab label="Error logs" />
          <Tab label="Data Visualization" />
          {/* <Tab label="User & Event Analysis" /> */}
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <div className="metrics-grid">
          <div className="metrics-card">
            <h3 className="metrics-card-title">Processing Metrics</h3>
            <p>
              Processing Time: {performanceMetrics.processingTime.toFixed(2)} ms
            </p>
            <p>Total Logs: {performanceMetrics.totalLogs}</p>
            <p>Successful Parse: {performanceMetrics.totalLogs}</p>
            <p>Failed Parse: {performanceMetrics.failedParse}</p>
            <p>Logs with Images: {performanceMetrics.logsWithImages}</p>
            <p>
              Logs without Images:
              {performanceMetrics.logsWithoutImages}
            </p>
          </div>
          <div className="metrics-card">
            <h3 className="metrics-card-title">Error Tracking</h3>
            <p>Malformed Log Entries: {malformedLogCount}</p>
            {Object.entries(errorCounts).map(([type, count]) => (
              <p key={type}>
                {type}: {count}
              </p>
            ))}
          </div>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <div className="metrics-card">
          <h2 className="metrics-card-title">Parsed Logs</h2>
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>IP</th>
                <th>Action/Event</th>
                <th>Item Details</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {parsedLogs
                .filter((log) => log.event && log.user)
                .map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestamp}</td>
                    <td>{log.user || "N/A"}</td>
                    <td>{log.ip || "N/A"}</td>
                    <td>{log.event || "N/A"}</td>
                    <td>
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
                    <td>
                      {log.image ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
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
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        {/* Error Logs Tab Content */}
        <div className="metrics-card">
          <h2 className="metrics-card-title">Error Logs</h2>
          <table className="logs-table">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Timestamp</th>
                <th className="border p-2">Error Type</th>
                <th className="border p-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {errorList
                .filter(
                  (error) => error.timestamp && error.type && error.message
                ) // Filter out logs with no data
                .map((error, index) => (
                  <tr key={index}>
                    <td className="border p-2">{error.timestamp}</td>
                    <td className="border p-2">{error.type}</td>
                    <td className="border p-2">{error.message}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Graphs Tab Content */}
        <TabPanel value={activeTab} index={3}>
          <div className="visualization-container">
            {/* Error Types Bar Chart (existing) */}
            <div className="chart-card">
              <h2 className="chart-title">Error Types</h2>
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

            {/* Logs with/without Images Pie Chart */}
            <div className="chart-card">
              <h2 className="chart-title">
                Parsed Logs with vs without Images
              </h2>
              <PieChart width={400} height={300}>
                <Pie
                  data={getLogsImageData()}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {getLogsImageData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* Errors vs Logs Chart */}
            <div className="chart-card">
              <h2 className="chart-title">Errors vs Logs</h2>
              <BarChart width={400} height={300} data={getErrorVsLogsData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
        </TabPanel>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* Charts Tab Content */}
        {/* Include additional Recharts charts */}
      </TabPanel>

      {/* Similar modifications for other TabPanels... */}
    </div>
  );
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

export default IoTLogParser;
