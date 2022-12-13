@echo off

cd ./android

.\gradlew.bat assembleDebug

cd ..

set debug-apk-path="./android/app/build/outputs/apk/debug/app-debug.apk"
set output-apk-path="./TaskManager.apk"

copy /y %debug-apk-path% %output-apk-path%
