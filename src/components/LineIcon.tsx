import React from "react";
import {
  Banknote,
  BadgeCheck,
  BellRing,
  Brain,
  BriefcaseBusiness,
  CalendarCheck,
  Building2,
  CarFront,
  ChartColumnIncreasing,
  CircleHelp,
  Coins,
  Construction,
  Crown,
  Drama,
  Euro,
  Eye,
  Globe,
  Handshake,
  Heart,
  KeyRound,
  Landmark,
  Laptop,
  Laugh,
  type LucideIcon,
  Medal,
  Megaphone,
  MessageCircle,
  MicVocal,
  Package,
  Phone,
  Rocket,
  ScanFace,
  Smartphone,
  Sparkles,
  Star,
  ThumbsDown,
  TrendingDown,
  TriangleAlert,
  UserRound,
  Users,
} from "lucide-react";
import { colors, alpha } from "../brand/tokens";

// Iconografía de línea (estilo SF Symbols) para docks y rótulos: trazo fino blanco sobre baldosa de cristal oscuro.
// Nada de emojis. Dinero y resultados con el color de resultado; el resto en blanco con un halo suave del color de acento.

const ICONS: Record<string, LucideIcon> = {
  alert: TriangleAlert,
  badge: BadgeCheck,
  banknote: Banknote,
  bell: BellRing,
  brain: Brain,
  briefcase: BriefcaseBusiness,
  building: Building2,
  calendar: CalendarCheck,
  car: CarFront,
  chart: ChartColumnIncreasing,
  coins: Coins,
  construction: Construction,
  crown: Crown,
  euro: Euro,
  eye: Eye,
  globe: Globe,
  handshake: Handshake,
  heart: Heart,
  help: CircleHelp,
  key: KeyRound,
  landmark: Landmark,
  laptop: Laptop,
  laugh: Laugh,
  masks: Drama,
  medal: Medal,
  megaphone: Megaphone,
  message: MessageCircle,
  mic: MicVocal,
  package: Package,
  phone: Phone,
  rocket: Rocket,
  selfie: ScanFace,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  "thumbs-down": ThumbsDown,
  "trending-down": TrendingDown,
  user: UserRound,
  users: Users,
};
// Iconos que hablan de dinero o resultados: van con el color de resultado.
const YELLOW = new Set(["euro", "coins", "banknote"]);

export const hasLineIcon = (name: string) => name in ICONS;

export const LineIconTile: React.FC<{ readonly name: string; readonly size: number }> = ({ name, size }) => {
  const Icon = ICONS[name];
  if (!Icon) return null;
  const tone = YELLOW.has(name) ? colors.highlight : "#ffffff";
  const glow = YELLOW.has(name) ? alpha(colors.highlight, .22) : alpha(colors.accentHi, .26);
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: size * 0.26,
        background: `radial-gradient(70% 70% at 50% 42%, ${glow} 0%, rgba(255,255,255,0) 70%), linear-gradient(160deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.05) 100%)`,
        backdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,.22)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 14px 34px rgba(0,0,0,.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={size * 0.5} color={tone} strokeWidth={1.6} absoluteStrokeWidth={false} />
    </div>
  );
};
