cd ./android

.\gradlew.bat assembleDebug


cd ..

set debug-apk-path=.android/app/build/outputs/apk/app-debug.apk
set output-apk-path=./TaskManager.apk

copy %debug-apk-path% %output-apk-path%
