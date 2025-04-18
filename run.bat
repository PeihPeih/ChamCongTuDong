@echo off

REM Navigate to the frontend directory and start the frontend
cd .\frontend_timekeeping\
echo Starting frontend...
start cmd /k "npm start"
cd ..

REM Navigate to the backend directory and start the backend
cd .\backend_timekeeping\
echo Starting backend...
start cmd /k "node .\index.js"
cd ..

REM Navigate to the face_recognize directory and start the face recognition service
cd .\face_recognize_timekeeping\
echo Starting face recognition service...
start cmd /k "python -m run"
cd ..

echo All services started!
pause