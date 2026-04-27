# How to flash the ESP32

In this document we write about methods to flash the ESP32.

## Installing ESP-IDF SDK official Espressif method

Follow the steps here: https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html

## Installing via PlatformIO

### 1. Install PlatformIO
```bash
brew install platformio
```

### 2. Install missing Python modules for ESP-IDF 5.5.3
```bash
~/.platformio/penv/.espidf-5.5.3/bin/python -m pip install idf-component-manager
~/.platformio/penv/.espidf-5.5.3/bin/python -m pip install kconfgen esp-idf-kconfig
```

### 3. Create platformio.ini in oled1309/
```ini
[env:esp32]
platform = espressif32
board = esp32dev
framework = espidf
monitor_speed = 115200
```

### 4. Move source to src/, remove main/
```bash
mkdir src
cp main/oled1309.c src/
mv main main.bak
```

### 5. Disable certificate bundle in sdkconfig and sdkconfig.esp32
Replace `CONFIG_MBEDTLS_CERTIFICATE_BUNDLE=y` with `CONFIG_MBEDTLS_CERTIFICATE_BUNDLE=n`
(TLS certificates are not needed for OLED, and the build fails without this fix)

### 6. Build
```bash
pio run
```

### 7. Flash (connect ESP32 via USB first)
```bash
pio run -t upload
```

---

## Troubleshooting

### Board not detected by Mac
Check `ioreg -p IOUSB` — if it shows only controllers without child devices, the board is not seen at USB level at all.
Common causes, in order:
1. **Power-only USB cable** (most common on DevKitC, the bundled short cable is often charge-only). Use a cable known to transfer data.
2. **Loose micro-USB socket on the board** — wiggle it, watch for stable red power LED.
3. **macOS Sequoia "Allow accessory to connect" prompt** — if missed, toggle in *System Settings → Privacy & Security*.
4. **CH340 clone boards** need the driver from wch.cn; genuine CP2102 works out of the box on modern macOS.

When detected, the board appears as `/dev/cu.usbserial-*`, `/dev/cu.SLAB_USBtoUART`, or `/dev/cu.wchusbserial*`.

### `HTTPClientError` on `Installing platformio/tool-mkspiffs`
On Apple Silicon the PIO registry has no native `darwin_arm64` build for `tool-mkspiffs`, and the download often fails (especially through a VPN).

First try disabling the VPN and retrying. If it still fails, create a stub package so PIO stops fetching it — `mkspiffs` is not invoked when flashing an app that doesn't use SPIFFS:

```bash
mkdir -p ~/.platformio/packages/tool-mkspiffs
cat > ~/.platformio/packages/tool-mkspiffs/package.json <<'EOF'
{
  "name": "tool-mkspiffs",
  "version": "2.230.0",
  "description": "stub to bypass PIO registry fetch",
  "keywords": ["tool"],
  "repository": {"type":"git","url":"local://stub"}
}
EOF
```

Revert by deleting the directory.
