"""
Scheduler Service - Handles automated scheduled tasks.

Schedules:
- 1:00 AM daily: Update all investment prices from yfinance

Usage:
    from services.scheduler import start_scheduler, shutdown_scheduler
    
    # Start on app startup
    start_scheduler()
    
    # Stop on app shutdown
    shutdown_scheduler()
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging

# Configure logging for scheduler
logging.basicConfig()
logging.getLogger('apscheduler').setLevel(logging.INFO)

# Global scheduler instance
_scheduler: BackgroundScheduler = None


def price_update_job():
    """Job to update all investment prices."""
    print(f"\n🔔 Scheduled price update triggered at {datetime.now()}")
    try:
        from services.price_service import update_all_investment_prices
        result = update_all_investment_prices()
        print(f"📈 Scheduled update result: {result}")
    except Exception as e:
        print(f"❌ Scheduled price update failed: {e}")


def start_scheduler():
    """
    Start the background scheduler with configured jobs.
    Call this on application startup.
    """
    global _scheduler
    
    if _scheduler is not None:
        print("⚠️ Scheduler already running")
        return
    
    _scheduler = BackgroundScheduler(timezone="UTC")
    
    # Schedule price update at 1:00 AM UTC daily
    # Adjust the hour based on your timezone needs
    # 1 AM UTC = 8:30 AM IST, 8 PM EST (previous day), 5 PM PST (previous day)
    _scheduler.add_job(
        price_update_job,
        trigger=CronTrigger(hour=1, minute=0),
        id='daily_price_update',
        name='Daily Investment Price Update',
        replace_existing=True
    )
    
    _scheduler.start()
    print("✅ Scheduler started - Price updates scheduled for 1:00 AM UTC daily")
    
    # Log next run time
    job = _scheduler.get_job('daily_price_update')
    if job:
        print(f"📅 Next scheduled run: {job.next_run_time}")


def shutdown_scheduler():
    """
    Shutdown the scheduler gracefully.
    Call this on application shutdown.
    """
    global _scheduler
    
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        print("🛑 Scheduler stopped")


def get_scheduler_status():
    """Get current scheduler status and next run times."""
    global _scheduler
    
    if _scheduler is None:
        return {"status": "not_running", "jobs": []}
    
    jobs = []
    for job in _scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None
        })
    
    return {
        "status": "running",
        "jobs": jobs
    }


def trigger_price_update_now():
    """
    Manually trigger the price update job immediately.
    Useful for testing or manual updates.
    """
    print("🔄 Manual price update triggered")
    price_update_job()
