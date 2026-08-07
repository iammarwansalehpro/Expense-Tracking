# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript, Tailwind CSS v4 (CSS-first), shadcn/ui, Zustand

## Users

บุคคลทั่วไป (Public Users) และ Guest ที่ต้องการแอปบันทึกรายจ่ายส่วนบุคคลที่ใช้งานง่าย รวดเร็ว และเน้นความเป็นส่วนตัวของข้อมูล

## Product Purpose

แอปพลิเคชันบันทึกรายจ่ายส่วนบุคคล (SlipSave - Smart Expense Tracker) ที่มาพร้อมระบบอ่านข้อมูลจากสลิปโอนเงินอัตโนมัติ (OCR) เน้นประมวลผลบนฝั่งผู้ใช้ (Client-side) เพื่อรักษาความเป็นส่วนตัวของข้อมูลการเงิน และออกแบบให้รองรับการใช้งานระดับโปรดักชัน

## Positioning

การรวมความสามารถอ่านสลิปธนาคารด้วยเทคโนโลยี OCR เข้ากับการออกแบบแอปการเงินที่สวยงาม ทันสมัย (Liquid Glass UI) และประมวลผลข้อมูลทุกอย่างแบบ Client-side ทำให้ผู้ใช้รู้สึกปลอดภัยและได้รับประสบการณ์การใช้งานระดับโลก

## Operating Context

ผู้ใช้งานจะบันทึกรายจ่ายเป็นประจำทุกวัน (หรือสแกนบิลเมื่อโอนเงิน) บนโทรศัพท์มือถือผ่าน Web Browser (รองรับ PWA) ดังนั้น UI จะต้องออกแบบแบบ Mobile-First ใช้งานมือเดียวได้ง่าย และมีระบบสรุปข้อมูลทั้งรายวัน รายสัปดาห์ และรายเดือน

## Capabilities and Constraints

- ใช้ Tailwind CSS v4 โดยตั้งค่า theme ผ่าน `index.css` โดยตรง (ไม่ใช้ config file ภายนอก)
- ใช้ Zustand เป็นแหล่งข้อมูลเดียว (Single Source of Truth)
- ข้อมูลจะต้องรองรับการเชื่อมต่อกับ Firebase (Auth, Firestore, Storage) แบบ Multi-tenant ในเฟสต่อไป
- ระบบ OCR จะต้องประมวลผลด้วย Tesseract.js (ฝั่ง Client)

## Brand Commitments

- **Typography:** Noto Sans Thai
- **Design Style:** "Liquid Glass" (Glassmorphism), สีหลักเป็นโทนม่วง/ลาเวนเดอร์ (Purple/Lavender) สะอาดตา ทันสมัย และรู้สึกพรีเมียม
- **Vibe:** เป็นมืออาชีพ (Professional), โดดเด่น (Bold), และน่าใช้งาน (Delightful)

## Evidence on Hand

- มี Mockup ข้อมูลจำลอง (Dummy Data) จำนวน 27 รายการแล้ว
- มีโครงสร้างหน้าเว็บ (Home, Expenses, Statistics, Settings) ครบถ้วนแล้ว
