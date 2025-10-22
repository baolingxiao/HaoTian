#!/bin/bash
BASE="https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets"

# 下载所有需要的文件
for file in moc/shizuku.moc \
            moc/shizuku.1024/texture_00.png \
            moc/shizuku.1024/texture_01.png \
            moc/shizuku.1024/texture_02.png \
            moc/shizuku.1024/texture_03.png \
            moc/shizuku.1024/texture_04.png \
            moc/shizuku.1024/texture_05.png \
            shizuku.physics.json \
            shizuku.pose.json; do
    mkdir -p $(dirname $file)
    curl -L "$BASE/$file" -o "$file" 2>&1 | grep -E "100|error" | tail -1
done

echo "✅ Shizuku model downloaded"
