import os
import subprocess
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))


def run_service(relative_app_path):
    subprocess.Popen([sys.executable, relative_app_path], cwd=BACKEND_DIR)


if __name__ == "__main__":
    run_service("grievance_app/app.py")
    run_service("user_app/app.py")
    run_service("admin_app/app.py")
    run_service("api_gateway/app.py")

    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("\nTerminating the processes")
