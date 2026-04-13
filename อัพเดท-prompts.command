#!/bin/bash

echo "🍌 อัพเดท Nano Banana Prompts..."
echo ""

# 1. ดึงข้อมูลใหม่จาก GitHub ต้นทาง
echo "📥 กำลังดึงข้อมูลใหม่..."
cd "/Users/timjanepat/Documents/🍱 Vibe Project 2026/🤠 Nano Banana Web/awesome-nano-banana-pro-prompts"
git pull
echo ""

# 2. Parse README → prompts.json
echo "⚙️  กำลัง parse ข้อมูล..."
cd "/Users/timjanepat/Documents/🍱 Vibe Project 2026/🤠 Nano Banana Web/nano-banana-gallery"
npm run parse
echo ""

# 3. Push ขึ้น GitHub → Vercel deploy อัตโนมัติ
echo "🚀 กำลัง push ขึ้น Vercel..."
git add public/prompts.json
git commit -m "update prompts $(date '+%Y-%m-%d %H:%M')"
git push
echo ""

echo "✅ เสร็จแล้ว! เว็บจะอัพเดทใน ~30 วินาที"
echo ""
read -p "กด Enter เพื่อปิด..."
