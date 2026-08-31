import * as React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Shield,
  ShieldAlert,
  User,
  Users,
  Wallet,
  X,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';

const defaultProps: Partial<LucideProps> = {
  strokeWidth: 1.75,
  size: 20
};

export function IconActivity(props: LucideProps) {
  return <Activity {...defaultProps} {...props} />;
}

export function IconAlertCircle(props: LucideProps) {
  return <AlertCircle {...defaultProps} {...props} />;
}

export function IconAlertTriangle(props: LucideProps) {
  return <AlertTriangle {...defaultProps} {...props} />;
}

export function IconCalendar(props: LucideProps) {
  return <Calendar {...defaultProps} {...props} />;
}

export function IconCheck(props: LucideProps) {
  return <Check {...defaultProps} {...props} />;
}

export function IconCheckCircle(props: LucideProps) {
  return <CheckCircle {...defaultProps} {...props} />;
}

export function IconClock(props: LucideProps) {
  return <Clock {...defaultProps} {...props} />;
}

export function IconHeart(props: LucideProps) {
  return <Heart {...defaultProps} {...props} />;
}

export function IconHome(props: LucideProps) {
  return <Home {...defaultProps} {...props} />;
}

export function IconMapPin(props: LucideProps) {
  return <MapPin {...defaultProps} {...props} />;
}

export function IconMessageSquare(props: LucideProps) {
  return <MessageSquare {...defaultProps} {...props} />;
}

export function IconPhone(props: LucideProps) {
  return <Phone {...defaultProps} {...props} />;
}

export function IconPhoneCall(props: LucideProps) {
  return <PhoneCall {...defaultProps} {...props} />;
}

export function IconShield(props: LucideProps) {
  return <Shield {...defaultProps} {...props} />;
}

export function IconShieldAlert(props: LucideProps) {
  return <ShieldAlert {...defaultProps} {...props} />;
}

export function IconUser(props: LucideProps) {
  return <User {...defaultProps} {...props} />;
}

export function IconUsers(props: LucideProps) {
  return <Users {...defaultProps} {...props} />;
}

export function IconWallet(props: LucideProps) {
  return <Wallet {...defaultProps} {...props} />;
}

export function IconX(props: LucideProps) {
  return <X {...defaultProps} {...props} />;
}

export function IconXCircle(props: LucideProps) {
  return <XCircle {...defaultProps} {...props} />;
}

export function IconChevronRight(props: LucideProps) {
  return <ChevronRight {...defaultProps} {...props} />;
}

export function IconChevronLeft(props: LucideProps) {
  return <ChevronLeft {...defaultProps} {...props} />;
}

export function IconChevronDown(props: LucideProps) {
  return <ChevronDown {...defaultProps} {...props} />;
}
