#!/bin/bash

# Ensure screenshots directory exists
mkdir -p /Users/anu/todo\ app/screenshots

echo "This script will help you manually copy each image to the screenshots folder."
echo "You'll need to specify the full path to each image file."
echo ""
echo "If you need to see what's in your recent images in Downloads, run:"
echo "ls -lt ~/Downloads/*.{png,jpg,jpeg} | head -10"
echo ""

# Array of destination filenames
DESTINATIONS=(
  "calendar_view.png"
  "focus_timer.png"
  "achievements.png"
  "login.png"
  "matrix.png"
  "analytics.png"
  "add_task.png"
  "task_list.png"
)

# Process each destination
for dest in "${DESTINATIONS[@]}"; do
  echo "Processing: $dest"
  read -p "Enter the path to the image file (or 'skip' to skip this one): " source_path
  
  if [[ "$source_path" != "skip" ]]; then
    if [ -f "$source_path" ]; then
      cp "$source_path" "/Users/anu/todo app/screenshots/$dest"
      echo "Copied to /Users/anu/todo app/screenshots/$dest"
    else
      echo "Error: File not found. Skipping."
    fi
  else
    echo "Skipping $dest"
  fi
  echo ""
done

echo "Screenshot copying complete. Files in screenshots directory:"
ls -la "/Users/anu/todo app/screenshots/" 