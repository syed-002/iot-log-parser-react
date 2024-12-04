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

## Screenshots
![Screenshot 2024-12-04 at 7 15 07 AM](https://github.com/user-attachments/assets/d6b07df0-c078-4484-8546-d114ac1706e3)
![Screenshot 2024-12-04 at 7 15 22 AM](https://github.com/user-attachments/assets/c49a6398-7910-4c68-a65b-cbd3b8fd5374)
![Screenshot 2024-12-04 at 7 15 32 AM](https://github.com/user-attachments/assets/9e81d036-d922-4d1a-9ce4-84c0445c816a)
![Screenshot 2024-12-04 at 7 15 48 AM](https://github.com/user-attachments/assets/b2ffeb21-35e5-4845-b50a-d827d5574fe0)



## Assumptions

1. **Log Format**: The log entries are assumed to follow specific formats:

   - Example for user actions:
     ```
     2024-12-01T14:29:09.181812 user=user_502 ip=141.11.96.144 action=START
     {"user": "user_152", "timestamp": "2024-12-01T16:20:41.181812", "ip": "196.56.235.78", "event": "error", "details": {"item_id": 7290, "quantity": 3, "price": 270.26}, "iot_device_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABjCAIAAAC35NHlAAAByElEQVR4nO2asW3DMBBF6SCFF0iWSOUxDKRJn1VcZZCMkCaAx3CVJewuVcoUBAwBkmXq7h/JL/xXyhZ5z5+SLJKbz9/3tEYeWhcQhcTYkBgbEmPjsVpPz7u/8cHzaRvUXbjYpM/4U7hh7FCct7J9s5CoxAyF5lNQ0YUk5vn5UdHhxfyVQdxWe7sHi6EGkr8dpBj2zuZsTUPxHvAHkbNNJTZLRFzOlpXYbeLi8rSvxNiQ2A2iLzBzL0qMDYmxITE2JMYGcl7x6eM4Png57IFdlAMQm/QZf1rZcONZXH/5/lp6ik3PMD1sv8YMVulevECMYjarTB03i5jHKlPBbbGY3ypT7mZbf1ntc2yZGCquTElo5uUyJYaOKzMfmmd1U4lVx7kY3amYf4m9UzE/PYpBdkR0J9Zgn8fP6xukyyHDt5jzaQvceNRLYo33UmFDuxz2OaWIPXAtE4vb05cMYqjQIq7YIZbE/DVFWyXzUPRUVsEqea4xW311rJJzXjFXWfg6U00pA5gwvVY8aVjZ5wpyiruVwyS9/POAIzE2JMaGxNiQGBsSY0NibEiMDYmxITE2JMaGxNiQGBsSY0NibEiMDYmxITE2Viv2D4QBeNIojM4HAAAAAElFTkSuQmCC"}

     ```
   - Example for errors:
     ```
      MALFORMED_LOG_ENTRY
      TimeoutError: Connection to DB failed 2024-12-01T13:12:16.199997
      KeyError: 'action_type' 2024-11-30T12:56:56.199997
      InvalidBase64: Data cannot be decoded 2024-12-01T18:59:52.199997
      Malformed JSON object 2024-12-01T08:04:38.199997
      NullPointerException at line 42 2024-12-01T10:48:21.199997
      IndexOutOfBoundsException in module user_activity 2024-12-01T12:57:54.199997
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
