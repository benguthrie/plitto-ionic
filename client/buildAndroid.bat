cd C:\xampp\htdocs\plitto-ionic\client
pause;
grunt init
pause;
grunt clean
grunt wiredep
grunt init
grunt compress
cordova build android --release
cordova run android
pause;