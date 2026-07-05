#!/bin/bash

# Bot Process Manager
# Start, stop, and monitor the bot

PID_FILE="bot.pid"
LOG_DIR="logs"
BOT_FILE="src/bot.js"

command=$1

case $command in
  start)
    echo "🚀 Starting Deriv Trading Bot..."
    if [ -f $PID_FILE ]; then
      echo "⚠️  Bot already running (PID: $(cat $PID_FILE))"
      exit 1
    fi
    nohup node $BOT_FILE > $LOG_DIR/bot.log 2>&1 &
    echo $! > $PID_FILE
    echo "✅ Bot started (PID: $(cat $PID_FILE))"
    echo "📊 Monitor: tail -f $LOG_DIR/info-*.log"
    ;;
  stop)
    if [ -f $PID_FILE ]; then
      PID=$(cat $PID_FILE)
      echo "🛑 Stopping bot (PID: $PID)..."
      kill $PID
      rm $PID_FILE
      echo "✅ Bot stopped"
    else
      echo "⚠️  Bot is not running"
    fi
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    if [ -f $PID_FILE ]; then
      PID=$(cat $PID_FILE)
      if ps -p $PID > /dev/null; then
        echo "✅ Bot is running (PID: $PID)"
      else
        echo "❌ Bot crashed (PID file: $PID)"
        rm $PID_FILE
      fi
    else
      echo "❌ Bot is not running"
    fi
    ;;
  logs)
    tail -f $LOG_DIR/info-$(date +%Y-%m-%d).log
    ;;
  *)
    echo "Usage: ./scripts/manager.sh [start|stop|restart|status|logs]"
    ;;
esac
