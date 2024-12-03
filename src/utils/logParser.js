export const decodeBase64Image = (base64Image) => {
  const imageData = base64Image.split(",")[1]; // Extract the base64 data from the prefix
  return imageData; // This could be expanded to actually render the image in some cases
};

// export const parseLogEntry = (
//   logEntry,
//   incrementMalformedCount,
//   storeErrorLog
// ) => {
//   if (!logEntry.trim()) {
//     return null;
//   }

//   try {
//     // Handle the specific log format (tc: "2024-12-01T14:29:09.181812 user=user_502 ip=141.11.96.144 action=START")
//     const logPattern =
//       /tc:\s"([\d\-T:.]+)\suser=([a-zA-Z0-9_]+)\sip=([0-9.]+)\saction=([a-zA-Z0-9_]+)"/;
//     const match = logEntry.match(logPattern);

//     if (match) {
//       const timestamp = match[1];
//       const user = match[2];
//       const ip = match[3];
//       const action = match[4];

//       return {
//         type: "log_entry",
//         timestamp,
//         user,
//         ip,
//         action,
//       };
//     }

//     // Check for various error types like NullPointerException, TimeoutError, etc.
//     if (logEntry.includes("NullPointerException")) {
//       const timestampMatch = logEntry.match(
//         /NullPointerException\s+at\s+line\s+(\d+)\s+([\d\-T:.]+)/
//       );
//       if (timestampMatch) {
//         const timestamp = timestampMatch[2];
//         const message = "NullPointerException at line " + timestampMatch[1];
//         storeErrorLog({ timestamp, message, type: "NullPointerException" });
//         return { type: "null_pointer_exception", timestamp, message };
//       }
//     }

//     // Handle other errors (IndexOutOfBoundsException, TimeoutError, KeyError, etc.)
//     if (logEntry.includes("IndexOutOfBoundsException")) {
//       const timestampMatch = logEntry.match(
//         /IndexOutOfBoundsException\s+in\s+module\s+([a-zA-Z0-9_]+)\s+([\d\-T:.]+)/
//       );
//       if (timestampMatch) {
//         const timestamp = timestampMatch[2];
//         const message =
//           "IndexOutOfBoundsException in module " + timestampMatch[1];
//         storeErrorLog({
//           timestamp,
//           message,
//           type: "IndexOutOfBoundsException",
//         });
//         return { type: "index_out_of_bounds_exception", timestamp, message };
//       }
//     }

//     // Additional error checks ...

//     // Handle valid JSON logs
//     if (logEntry.startsWith("{")) {
//       const jsonLog = JSON.parse(logEntry);
//       return {
//         type: "json",
//         user: jsonLog.user,
//         timestamp: jsonLog.timestamp,
//         ip: jsonLog.ip,
//         event: jsonLog.event,
//         details: jsonLog.details,
//         image: jsonLog.iot_device_image
//           ? decodeBase64Image(jsonLog.iot_device_image)
//           : null,
//       };
//     }

//     // Handle general errors
//     if (logEntry.includes("ERROR")) {
//       return {
//         type: "error",
//         message: logEntry,
//       };
//     }

//     return null;
//   } catch (error) {
//     return {
//       type: "parse_error",
//       originalLog: logEntry,
//       error: error.message,
//     };
//   }
// };

export const parseLogEntry = (
  logEntry,
  incrementMalformedCount,
  storeErrorLog
) => {
  if (!logEntry.trim()) {
    // Skip empty or whitespace-only lines
    return null;
  }

  try {
    // Handle the specific log format (tc: "2024-12-01T14:29:09.181812 user=user_502 ip=141.11.96.144 action=START")
    const logPattern =
      /tc:\s"([\d\-T:.]+)\suser=([a-zA-Z0-9_]+)\sip=([0-9.]+)\saction=([a-zA-Z0-9_]+)"/;
    const match = logEntry.match(logPattern);

    if (match) {
      const timestamp = match[1];
      const user = match[2];
      const ip = match[3];
      const action = match[4];

      return {
        type: "log_entry",
        timestamp,
        user,
        ip,
        action,
      };
    }

    // Check for NullPointerException log entry
    if (logEntry.includes("NullPointerException")) {
      const timestampMatch = logEntry.match(
        /NullPointerException\s+at\s+line\s+(\d+)\s+([\d\-T:.]+)/ // Regex for matching the "NullPointerException" format
      );

      if (timestampMatch) {
        const timestamp = timestampMatch[2];
        const message = "NullPointerException at line " + timestampMatch[1];
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
    if (logEntry.includes("ERROR")) {
      return {
        type: "error",
        message: logEntry,
      };
    }

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
