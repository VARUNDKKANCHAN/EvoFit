import sys
import subprocess

def main():
    print("[*] Launching EvoFit Unified Test Suite...")
    print("[*] Running 'pytest backend/tests/test_all.py -v'...\n")
    try:
        # Call pytest using the python executable to ensure virtualenv packages are used
        res = subprocess.run([sys.executable, "-m", "pytest", "backend/tests/test_all.py", "-v"], check=True)
        print("\n[+] ALL TESTS COMPLETED SUCCESSFULLY!")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"\n[!] TESTS FAILED! Error code: {e.returncode}")
        return e.returncode

if __name__ == "__main__":
    sys.exit(main())
