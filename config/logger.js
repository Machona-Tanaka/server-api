const fs = require('fs');
const path = require('path');
const util = require('util');

class Logger {
  constructor(options = {}) {
    // Configuration with defaults
    this.config = {
      logLevel: options.logLevel || 'info',  // 'error', 'warn', 'info', 'debug', 'trace'
      logToConsole: options.logToConsole !== false,
      logToFile: options.logToFile || false,
      filePath: options.filePath || './logs/app.log',
      maxFileSize: options.maxFileSize || 1024 * 1024 * 10, // 10MB
      maxFiles: options.maxFiles || 5,
      timestampFormat: options.timestampFormat || 'YYYY-MM-DD HH:mm:ss',
      ...options
    };

    // Create log directory if needed
    if (this.config.logToFile) {
      this.ensureLogDirectoryExists();
      this.currentFileStream = null;
    }

    // Log level priority mapping
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };
  }

  ensureLogDirectoryExists() {
    const dir = path.dirname(this.config.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  rotateLogFile() {
    if (!this.config.logToFile) return;

    try {
      const stats = fs.statSync(this.config.filePath);
      if (stats.size > this.config.maxFileSize) {
        // Close current stream if exists
        if (this.currentFileStream) {
          this.currentFileStream.end();
        }

        // Rotate files
        for (let i = this.config.maxFiles - 1; i > 0; i--) {
          const current = `${this.config.filePath}.${i}`;
          const next = `${this.config.filePath}.${i + 1}`;
          if (fs.existsSync(current)) {
            fs.renameSync(current, next);
          }
        }

        // Move current to .1
        fs.renameSync(this.config.filePath, `${this.config.filePath}.1`);

        // Create new log file
        this.currentFileStream = fs.createWriteStream(this.config.filePath, { flags: 'a' });
      }
    } catch (err) {
      // File doesn't exist or other error - create new
      if (err.code === 'ENOENT') {
        this.currentFileStream = fs.createWriteStream(this.config.filePath, { flags: 'a' });
      } else {
        console.error('Log rotation error:', err);
      }
    }
  }

  getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    // For more advanced formatting, use a library like date-fns or moment
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.config.logLevel];
  }

  log(level, message, ...args) {
    if (!this.shouldLog(level)) return;

    const timestamp = this.getTimestamp();
    const formattedMessage = util.format(message, ...args);
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage}\n`;

    // Console output
    if (this.config.logToConsole) {
      const colors = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[35m', // Magenta
        trace: '\x1b[37m'  // White
      };
      console.log(`${colors[level] || ''}${logEntry}\x1b[0m`);
    }

    // File output
    if (this.config.logToFile) {
      this.rotateLogFile();
      if (!this.currentFileStream) {
        this.currentFileStream = fs.createWriteStream(this.config.filePath, { flags: 'a' });
      }
      this.currentFileStream.write(logEntry);
    }
  }

  // Convenience methods
  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  trace(message, ...args) {
    this.log('trace', message, ...args);
  }

  // Cleanup
  close() {
    if (this.currentFileStream) {
      this.currentFileStream.end();
    }
  }
}

// Singleton instance (optional)
const logger = new Logger({
  logLevel: process.env.LOG_LEVEL || 'info',
  logToFile: process.env.NODE_ENV === 'production',
  filePath: './logs/app.log'
});

module.exports = {
  Logger,
  logger // singleton instance
};