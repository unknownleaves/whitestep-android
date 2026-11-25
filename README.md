# Whitestep for Android

Android app for **Whitestep · Bermuda homes for sale**. The website lives in
`app/src/main/assets/www/` and runs inside a full-screen WebView, so the app
works the same as the site: search, filters, saved homes and enquiry forms.

- Saved homes and filters are kept on the phone (localStorage).
- Listing links, sponsor links, email and phone open in the phone's browser or mail app.
- The Android back button goes back through pages, then closes the app.

## Getting the APK

Every push to `main` builds the app on GitHub and publishes it as a Release.
The newest APK is always at:

**https://github.com/unknownleaves/whitestep-android/releases/latest/download/whitestep-debug.apk**

Open that link on an Android phone, then open the downloaded file to install
(allow "Install unknown apps" when asked). Pushing a tag such as `v1.0.0`
publishes a release under that version name instead.

## Signed release build (for Google Play or long-term installs)

The debug APK is fine for testing. For a release APK signed with your own key:

```bash
keytool -genkeypair -v -keystore release.jks -alias whitestep \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.jks   # macOS: base64 -i release.jks
```

Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `SIGNING_KEYSTORE_BASE64` | output of the base64 command |
| `SIGNING_STORE_PASSWORD` | keystore password |
| `SIGNING_KEY_ALIAS` | `whitestep` |
| `SIGNING_KEY_PASSWORD` | key password |

The next build then also produces `whitestep-release.apk`. Keep `release.jks`
safe and out of Git — you need the same key for every future update.

## Updating the site in the app

Replace the files in `app/src/main/assets/www/`, bump `versionCode` and
`versionName` in `app/build.gradle`, and push.

## Building locally

Requires JDK 17 and the Android SDK (Android Studio installs both):

```bash
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```
