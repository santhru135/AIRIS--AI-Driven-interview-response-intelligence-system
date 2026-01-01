#!/usr/bin/env python3
"""
Run the AIRIS API server
"""
import uvicorn
from api import app

if __name__ == "__main__":
    print("Starting AIRIS server...")
    uvicorn.run(app, host="0.0.0.0", port=8001)