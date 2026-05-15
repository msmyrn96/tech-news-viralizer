from dotenv import load_dotenv
load_dotenv()

import schedule
import time
from shared.database import init_db
from worker.scheduler import job, drip_score_job, init_seen_urls


def main() -> None:
    print("Initializing database...")
    init_db()
    print("Loading known URLs...")
    init_seen_urls()

    print("Running initial scrape...")
    job()

    schedule.every(5).minutes.do(job)
    schedule.every(60).seconds.do(drip_score_job)

    print("Worker running. Ctrl+C to stop.")
    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == '__main__':
    main()
