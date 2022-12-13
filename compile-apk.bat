@echo off

cd .\android
.\gradlew.bat assembleDebug | echo>nul
cd ..




set debug-apk-path=".\android\app\build\outputs\apk\debug\app-debug.apk"
set output-apk-path=".\TaskManager.apk"

copy %debug-apk-path% %output-apk-path%
