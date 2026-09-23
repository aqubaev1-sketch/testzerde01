'use client';



import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  GraduationCap,
  Brain,
  Check,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import PracticeFeatureSlider from '@/components/card/PracticeFeatureSlider';
import { LandingHero } from '@/components/hero/LandingHero';

// Inter — переменный шрифт.
// subsets:
//  - 'latin'        — английский/цифры
//  - 'cyrillic'     — русский
//  - 'cyrillic-ext' — казахские буквы (ә, ғ, қ, ң, ө, ұ, ү, і, һ)
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
});

const SUBJECTS_LIST = [
  'Қазақстан тарихы',
  'Математикалық сауаттылық',
  'Оқу сауаттылығы',
  'Қазақ тілі',
  'Орыс тілі',
  'Ағылшын тілі',
  'Информатика',
  'Биология',
  'Химия',
  'Физика',
  'География',
  'Дүниежүзі тарихы',
  'Құқық негіздері',
  'Әдебиет',
];

export default function Home() {
  return (
   <>
   <div className="container py-12">
    <LandingHero/>
   </div>
   </>
  );
}