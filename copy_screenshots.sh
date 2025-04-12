#!/bin/bash

# Ensure screenshots directory exists
mkdir -p /Users/anu/todo\ app/screenshots

# Get recents folder path (typical macOS location)
RECENTS=~/Downloads

# List image files from the recents folder, sorted by modification time (newest first)
echo "Found these recent images:"
find "$RECENTS" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ls -lt | head -n 10

echo ""
echo "This script will help you copy the 8 most recent images to the correct screenshot locations."
echo "Please confirm these are the right files (in this order):"
echo "1. Calendar View → calendar_view.png"
echo "2. Focus Timer → focus_timer.png" 
echo "3. Achievements → achievements.png"
echo "4. Login Screen → login.png"
echo "5. Eisenhower Matrix → matrix.png"
echo "6. Analytics Dashboard → analytics.png"
echo "7. Add Task Modal → add_task.png"
echo "8. Task List → task_list.png"
echo ""
read -p "Proceed with copying? (y/n): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    # Get the 8 most recent images
    IMAGES=($(find "$RECENTS" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -print0 | xargs -0 ls -t | head -n 8))
    
    # Check if we found enough images
    if [ ${#IMAGES[@]} -lt 8 ]; then
        echo "Error: Found only ${#IMAGES[@]} images, but need 8."
        exit 1
    fi
    
    # Copy images to destination with proper names
    cp "${IMAGES[0]}" "/Users/anu/todo app/screenshots/calendar_view.png"
    cp "${IMAGES[1]}" "/Users/anu/todo app/screenshots/focus_timer.png"
    cp "${IMAGES[2]}" "/Users/anu/todo app/screenshots/achievements.png"
    cp "${IMAGES[3]}" "/Users/anu/todo app/screenshots/login.png"
    cp "${IMAGES[4]}" "/Users/anu/todo app/screenshots/matrix.png"
    cp "${IMAGES[5]}" "/Users/anu/todo app/screenshots/analytics.png"
    cp "${IMAGES[6]}" "/Users/anu/todo app/screenshots/add_task.png"
    cp "${IMAGES[7]}" "/Users/anu/todo app/screenshots/task_list.png"
    
    echo "Successfully copied screenshots to /Users/anu/todo app/screenshots/"
    ls -la "/Users/anu/todo app/screenshots/"
else
    echo "Operation cancelled."
fi 