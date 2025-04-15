@echo off
echo Removing existing Git repository...
rmdir /s /q .git

echo Initializing new Git repository...
git init

echo Creating initial commit...
git add .
git commit -m "Initial commit"

echo Setting up new remote repository...
git remote add origin https://github.com/jdevop33/hockey-pouches.git

echo Ready to push to new repository!
echo Run the following command to push to GitHub:
echo git push -u origin main

pause
