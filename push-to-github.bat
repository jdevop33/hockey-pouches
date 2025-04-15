@echo off
echo Pushing code to GitHub...

git remote remove origin
git remote add origin https://github.com/jdevop33/hockey-pouches.git
git push -u origin hockey-b2c

echo Done!
pause
