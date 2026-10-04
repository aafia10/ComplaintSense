import sys
import os
import pytest

if __name__ == "__main__":
    # Add backend directory to sys.path
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, backend_dir)
    sys.path.insert(0, os.path.dirname(backend_dir))

    # Run pytest
    exit_code = pytest.main(["backend/tests", "-v"])
    sys.exit(exit_code)
