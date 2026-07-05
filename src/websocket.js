import WebSocket from 'ws';
import { logger } from './logger.js';

class DerivWebSocket {
  constructor(url, onMessage, onError) {
    this.url = url;
    this.ws = null;
    this.onMessage = onMessage;
    this.onError = onError;
    this.reqId = 1;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
          logger.success('✅ WebSocket connected to Deriv');
          this.reconnectAttempts = 0;
          this.startPing();
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.onMessage(message);
          } catch (error) {
            logger.error('Failed to parse message', { raw: data, error: error.message });
          }
        });

        this.ws.on('error', (error) => {
          logger.error('WebSocket error', { message: error.message });
          this.onError(error);
        });

        this.ws.on('close', () => {
          logger.warn('WebSocket disconnected');
          this.stopPing();
          this.attemptReconnect();
        });
      } catch (error) {
        logger.error('Connection failed', { message: error.message });
        reject(error);
      }
    });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      message.req_id = message.req_id || this.reqId++;
      this.ws.send(JSON.stringify(message));
      return message.req_id;
    } else {
      logger.warn('WebSocket not ready, message not sent', { message });
      return null;
    }
  }

  subscribe(subscription) {
    const reqId = this.send(subscription);
    if (reqId) {
      this.subscriptions.set(reqId, subscription);
    }
    return reqId;
  }

  unsubscribe(stream) {
    this.send({ forget: stream });
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ ping: 1 });
      }
    }, 30000);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.warn(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect().catch(err => {
        logger.error('Reconnection failed', { attempt: this.reconnectAttempts });
      }), this.reconnectDelay * this.reconnectAttempts);
    } else {
      logger.error('Max reconnection attempts reached. Exiting.');
      process.exit(1);
    }
  }

  close() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default DerivWebSocket;
