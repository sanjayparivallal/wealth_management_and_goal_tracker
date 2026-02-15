from celery_app import celery_app
from datetime import datetime

@celery_app.task(name="daily_price_update")
def price_update_task():
    """Celery task to update all investment prices."""
    current_time = datetime.now()
    print(f"[INFO] 🔔 Celery task: Price update triggered at {current_time}")
    
    try:
        from services.price_service import update_all_investment_prices
        result = update_all_investment_prices()
        print(f"[INFO] 📈 Price update result: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] ❌ Price update failed: {e}")
        raise e

def trigger_price_update_now():
    """
    Manually trigger the price update job immediately.
    Useful for testing or manual updates.
    """
    print("[INFO] 🔄 Manual price update triggered via Celery")
    # Use delay() to send the task to the queue
    price_update_task.delay()

