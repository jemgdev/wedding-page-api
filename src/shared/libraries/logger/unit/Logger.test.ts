import { Logger } from '../Logger'
import { Loggerfy } from 'loggerfy'

// Mock the loggerfy module
jest.mock('loggerfy', () => {
  const mockLoggerfyInstance = {
    info: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    error: jest.fn().mockReturnThis(),
    setCode: jest.fn().mockReturnThis(),
    setDetail: jest.fn().mockReturnThis(),
    setMessage: jest.fn().mockReturnThis(),
    setMetadata: jest.fn().mockReturnThis(),
    write: jest.fn(),
  };
  // Mock the Loggerfy constructor to return our mock instance
  return {
    Loggerfy: jest.fn(() => mockLoggerfyInstance),
  };
});

describe('Logger', () => {
  let logger: Logger;
  let mockLoggerfyInstance: jest.Mocked<{
    info: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
    setCode: jest.Mock;
    setDetail: jest.Mock;
    setMessage: jest.Mock;
    setMetadata: jest.Mock;
    write: jest.Mock;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock instance created by the mocked Loggerfy constructor
    mockLoggerfyInstance = new Loggerfy() as any; // Cast to any to bypass type checking
    logger = new Logger();
  });

  const message = 'Test message';
  const code = 'TEST_CODE';
  const detail = 'Test detail';
  const meta = { key: 'value' };

  describe('info', () => {
    it('should call loggerfy.info with correct arguments and chain methods', () => {
      logger.info(message, code, detail, meta);

      expect(mockLoggerfyInstance.info).toHaveBeenCalledTimes(1);
      expect(mockLoggerfyInstance.setCode).toHaveBeenCalledWith(code);
      expect(mockLoggerfyInstance.setDetail).toHaveBeenCalledWith(detail);
      expect(mockLoggerfyInstance.setMessage).toHaveBeenCalledWith(message);
      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith(meta);
      expect(mockLoggerfyInstance.write).toHaveBeenCalledTimes(1);
    });

    it('should call loggerfy.info with empty meta object if meta is undefined', () => {
      logger.info(message, code, detail, undefined);

      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith({});
    });
  });

  describe('warn', () => {
    it('should call loggerfy.warn with correct arguments and chain methods', () => {
      logger.warn(message, code, detail, meta);

      expect(mockLoggerfyInstance.warn).toHaveBeenCalledTimes(1);
      expect(mockLoggerfyInstance.setCode).toHaveBeenCalledWith(code);
      expect(mockLoggerfyInstance.setDetail).toHaveBeenCalledWith(detail);
      expect(mockLoggerfyInstance.setMessage).toHaveBeenCalledWith(message);
      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith(meta);
      expect(mockLoggerfyInstance.write).toHaveBeenCalledTimes(1);
    });

    it('should call loggerfy.warn with empty meta object if meta is undefined', () => {
      logger.warn(message, code, detail, undefined);

      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith({});
    });
  });

  describe('error', () => {
    it('should call loggerfy.error with correct arguments and chain methods', () => {
      logger.error(message, code, detail, meta);

      expect(mockLoggerfyInstance.error).toHaveBeenCalledTimes(1);
      expect(mockLoggerfyInstance.setCode).toHaveBeenCalledWith(code);
      expect(mockLoggerfyInstance.setDetail).toHaveBeenCalledWith(detail);
      expect(mockLoggerfyInstance.setMessage).toHaveBeenCalledWith(message);
      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith(meta);
      expect(mockLoggerfyInstance.write).toHaveBeenCalledTimes(1);
    });

    it('should call loggerfy.error with empty meta object if meta is undefined', () => {
      logger.error(message, code, detail, undefined);

      expect(mockLoggerfyInstance.setMetadata).toHaveBeenCalledWith({});
    });
  });
});