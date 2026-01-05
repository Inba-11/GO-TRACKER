#!/usr/bin/env python3
"""
Production Startup Script for GO Tracker
Manages both Python scraper and Node.js API server
"""

import subprocess
import threading
import time
import signal
import sys
import os
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProductionManager:
    def __init__(self):
        self.processes = {}
        self.running = True
        
    def start_api_server(self):
        """Start the Node.js API server"""
        try:
            logger.info("🚀 Starting Node.js API server...")
            
            # Check if Node.js is available
            try:
                subprocess.run(['node', '--version'], check=True, capture_output=True)
            except subprocess.CalledProcessError:
                logger.error("❌ Node.js not found. Please install Node.js first.")
                return None
            
            # Install dependencies if needed
            if not os.path.exists('node_modules'):
                logger.info("📦 Installing Node.js dependencies...")
                subprocess.run(['npm', 'install', 'express', 'cors', 'mongodb', 'express-rate-limit', 'dotenv'], 
                             check=True, cwd='.')
            
            # Start the API server
            process = subprocess.Popen(
                ['node', 'api_server.js'],
                cwd='.',
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            self.processes['api_server'] = process
            logger.info("✅ API server started successfully")
            
            # Monitor API server output
            def monitor_api():
                for line in iter(process.stdout.readline, ''):
                    if line:
                        logger.info(f"[API] {line.strip()}")
                    if not self.running:
                        break
            
            threading.Thread(target=monitor_api, daemon=True).start()
            return process
            
        except Exception as e:
            logger.error(f"❌ Failed to start API server: {e}")
            return None
    
    def start_scraper(self):
        """Start the Python scraper"""
        try:
            logger.info("🔄 Starting Python scraper...")
            
            # Check if required Python packages are available
            required_packages = ['pymongo', 'requests', 'beautifulsoup4', 'selenium', 'schedule', 'python-dotenv']
            missing_packages = []
            
            for package in required_packages:
                try:
                    __import__(package.replace('-', '_'))
                except ImportError:
                    missing_packages.append(package)
            
            if missing_packages:
                logger.info(f"📦 Installing missing Python packages: {', '.join(missing_packages)}")
                subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing_packages, check=True)
            
            # Start the scraper
            process = subprocess.Popen(
                [sys.executable, 'production_scheduler.py'],
                cwd='.',
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            self.processes['scraper'] = process
            logger.info("✅ Scraper started successfully")
            
            # Monitor scraper output
            def monitor_scraper():
                for line in iter(process.stdout.readline, ''):
                    if line:
                        logger.info(f"[SCRAPER] {line.strip()}")
                    if not self.running:
                        break
            
            threading.Thread(target=monitor_scraper, daemon=True).start()
            return process
            
        except Exception as e:
            logger.error(f"❌ Failed to start scraper: {e}")
            return None
    
    def check_mongodb(self):
        """Check if MongoDB is running"""
        try:
            from pymongo import MongoClient
            client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
            client.server_info()
            client.close()
            logger.info("✅ MongoDB is running")
            return True
        except Exception as e:
            logger.error(f"❌ MongoDB not available: {e}")
            logger.error("Please start MongoDB before running the production system")
            return False
    
    def start_all(self):
        """Start all services"""
        logger.info("🎯 Starting GO Tracker Production System")
        logger.info("=" * 60)
        
        # Check prerequisites
        if not self.check_mongodb():
            return False
        
        # Start API server
        api_process = self.start_api_server()
        if not api_process:
            return False
        
        # Wait a bit for API server to start
        time.sleep(3)
        
        # Start scraper
        scraper_process = self.start_scraper()
        if not scraper_process:
            return False
        
        logger.info("=" * 60)
        logger.info("🎉 Production system started successfully!")
        logger.info("📊 API Server: http://localhost:5001/api/health")
        logger.info("🔄 Scraper: Running in background")
        logger.info("📝 Logs: Check production.log for detailed logs")
        logger.info("🛑 Press Ctrl+C to stop all services")
        logger.info("=" * 60)
        
        return True
    
    def stop_all(self):
        """Stop all services gracefully"""
        logger.info("🛑 Stopping all services...")
        self.running = False
        
        for name, process in self.processes.items():
            try:
                logger.info(f"Stopping {name}...")
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=10)
                    logger.info(f"✅ {name} stopped gracefully")
                except subprocess.TimeoutExpired:
                    logger.warning(f"⚠️ Force killing {name}...")
                    process.kill()
                    process.wait()
                    logger.info(f"✅ {name} force stopped")
                    
            except Exception as e:
                logger.error(f"Error stopping {name}: {e}")
        
        logger.info("✅ All services stopped")
    
    def monitor_health(self):
        """Monitor system health"""
        while self.running:
            try:
                # Check if processes are still running
                for name, process in list(self.processes.items()):
                    if process.poll() is not None:
                        logger.error(f"❌ {name} has stopped unexpectedly!")
                        
                        # Restart the process
                        if name == 'api_server':
                            logger.info(f"🔄 Restarting {name}...")
                            new_process = self.start_api_server()
                            if new_process:
                                self.processes[name] = new_process
                        elif name == 'scraper':
                            logger.info(f"🔄 Restarting {name}...")
                            new_process = self.start_scraper()
                            if new_process:
                                self.processes[name] = new_process
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error in health monitoring: {e}")
                time.sleep(60)
    
    def run(self):
        """Main run loop"""
        try:
            if not self.start_all():
                return
            
            # Start health monitoring
            health_thread = threading.Thread(target=self.monitor_health, daemon=True)
            health_thread.start()
            
            # Keep main thread alive
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            logger.info("🛑 Received shutdown signal")
        except Exception as e:
            logger.error(f"❌ Fatal error: {e}")
        finally:
            self.stop_all()

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}")
    sys.exit(0)

def main():
    """Main entry point"""
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create and run production manager
    manager = ProductionManager()
    manager.run()

if __name__ == "__main__":
    main()