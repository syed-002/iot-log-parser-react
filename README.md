# IoT Log Parser Dashboard

The **IoT Log Parser Dashboard** is a React-based application designed to process and analyze IoT log files. It parses log entries, tracks error types, visualizes key metrics with dynamic charts, and presents comprehensive performance analytics.

---

## Features

- Parses various log formats and extracts key information.
- Detects and categorizes errors such as TimeoutError, NullPointerException, and more.
- Tracks malformed log entries.
- Displays performance metrics, including processing time and success rates.
- Provides dynamic visualizations using Recharts.

---

## Installation Instructions/Setup

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or above)
- npm (v8 or above)

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/syed-002/iot-log-parser-react.git
   cd iot-log-parser-react
   ```

2. Install dependencies:

   ```bash
   npm install
   npm install react react-dom react-scripts recharts web-vitals
   npm install @mui/material @emotion/react @emotion/styled
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to http://localhost:3000 to access the application.

## How to Run

1. Upload a `.log` file using the "Upload Log File" input field.
2. The application will automatically parse the file and:
   - Display extracted log entries.
   - Count and categorize errors.
   - Present performance metrics.
   - Visualize error counts in a bar chart.
3. Review error logs in the error log table below the chart.

<!-- ## Screenshots

1. Main Dashboard


2. Uploading Logs


3. Error Visualization -->

## Assumptions

1. **Log Format**: The log entries are assumed to follow specific formats:

   - Example for user actions:
     ```
     2024-12-03T10:00:00 user=john_doe ip=192.168.0.1 action=login
     ```
   - Example for errors:
     ```
     TimeoutError: Connection to DB failed
     2024-12-03T10:05:00.123
     NullPointerException at line 42
     2024-12-03T10:10:00.456
     ```

2. **Malformed Logs**: Any log entries that do not match the expected patterns are categorized as malformed.

3. **Error Types**: The application recognizes and categorizes the following errors:

   - `TimeoutError`
   - `NullPointerException`
   - `KeyError: 'action_type'`
   - `IndexOutOfBoundsException`
   - `InvalidBase64`
   - `MalformedJSON`

4. **Real-time Parsing**: The application processes logs synchronously and does not support real-time log streaming.

## Dependencies

The application relies on the following packages:

- **React**: Frontend framework for building the user interface.
- **Recharts**: Library for creating dynamic visualizations.
- **React Scripts**: CLI for managing the React project.
- **@testing-library**: For testing React components.

## Scripts

- **Start**: Launch the development server

  ```bash
  npm start
  ```

- **Build**: Create an optimized production build

  ```bash
  npm run build
  ```

- **Test**: Run unit tests
  ```bash
  npm test
  ```

<!-- ## Future Improvements

1. Add support for additional log formats.
2. Enhance the error detection algorithm to handle more complex patterns.
3. Include real-time log streaming functionality.
4. Add a search feature to filter log entries. -->
