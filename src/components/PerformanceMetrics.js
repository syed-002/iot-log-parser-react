import React from "react";

const PerformanceMetrics = ({ performanceMetrics }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold">Performance Metrics</h2>
      <p>Processing Time: {performanceMetrics.processingTime.toFixed(2)} ms</p>
      <p>Total Logs: {performanceMetrics.totalLogs}</p>
      <p>Successful Parse: {performanceMetrics.successfulParse}</p>
      <p>Failed Parse: {performanceMetrics.failedParse}</p>
    </div>
  );
};

export default PerformanceMetrics;
