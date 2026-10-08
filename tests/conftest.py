# tests/conftest.py
import os

os.environ["NO_GCE_CHECK"] = "True"
os.environ["GRPC_ENABLE_FORK_SUPPORT"] = "0"
