@echo off
echo Adding changes...
git add .

echo.
echo Committing changes...
git commit -m "Auto-update: %date% %time%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done!
pause
