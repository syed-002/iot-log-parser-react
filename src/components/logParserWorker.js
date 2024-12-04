// logParserWorker.js
import { parseLogEntry } from "./parseLogEntry";
onmessage = function (e) {
  const { logs, incrementMalformedCount, storeErrorLog, updateErrorCounts } =
    e.data;

  const parsed = [];
  const errors = [];
  let logsWithImages = 0;
  let logsWithoutImages = 0;

  logs.forEach((log, index) => {
    const parsedEntry = parseLogEntry(
      log,
      incrementMalformedCount,
      storeErrorLog,
      updateErrorCounts
    );
    if (parsedEntry) {
      if (parsedEntry.type === "error" || parsedEntry.type === "parse_error") {
        errors.push(parsedEntry);
      } else {
        parsed.push(parsedEntry);
        if (parsedEntry.image) {
          logsWithImages += 1;
        } else if (parsedEntry.image === null) {
          logsWithoutImages += 1;
        }
      }
    }
  });

  postMessage({
    parsedLogs: parsed,
    errorLogs: errors,
    logsWithImages,
    logsWithoutImages,
  });
};
