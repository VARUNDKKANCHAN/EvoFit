import threading

# Thread-safe global metrics store
class MetricsStore:
    def __init__(self):
        self.lock = threading.Lock()
        self.groq_latency_ms = 0.0
        self.total_500_errors = 0
        self.failed_logins = 0

    def update_latency(self, latency: float):
        with self.lock:
            # Simple moving average for recent latency (alpha = 0.1)
            if self.groq_latency_ms == 0.0:
                self.groq_latency_ms = latency
            else:
                self.groq_latency_ms = (self.groq_latency_ms * 0.9) + (latency * 0.1)

    def increment_error(self):
        with self.lock:
            self.total_500_errors += 1

    def increment_failed_login(self):
        with self.lock:
            self.failed_logins += 1

    def reset(self):
        with self.lock:
            self.groq_latency_ms = 0.0
            self.total_500_errors = 0
            self.failed_logins = 0

    def get_metrics(self):
        with self.lock:
            return {
                "groq_latency_ms": round(self.groq_latency_ms, 2),
                "total_500_errors": self.total_500_errors,
                "failed_logins": self.failed_logins
            }

GLOBAL_METRICS = MetricsStore()
