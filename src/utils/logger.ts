import { createLogger, format, transports } from "winston";

// Custom format function: timestamp first, then level, then message
const customFormat = format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    let msg = message;

    // Append metadata if any (optional)
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return `[${timestamp}] [${level.toUpperCase()}] ${msg}`;
  }
);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat,
    format.colorize({ all: true, level: true })
  ),
  transports: [new transports.Console()],
});

export default logger;
