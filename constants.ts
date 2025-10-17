import type { Tone, Style, Voice } from './types';

interface LabeledOption<T> {
  value: T;
  label: string;
}

export const TONE_OPTIONS: LabeledOption<Tone>[] = [
  { value: 'Formal', label: 'Trang trọng' },
  { value: 'Informative', label: 'Cung cấp thông tin' },
  { value: 'Conversational', label: 'Thân mật' },
  { value: 'Persuasive', label: 'Thuyết phục' },
  { value: 'Humorous', label: 'Hài hước' },
  { value: 'Empathetic', label: 'Đồng cảm' },
  { value: 'Inspirational', label: 'Truyền cảm hứng' },
];

export const STYLE_OPTIONS: LabeledOption<Style>[] = [
  { value: 'Narrative', label: 'Kể chuyện' },
  { value: 'Descriptive', label: 'Miêu tả' },
  { value: 'Expository', label: 'Giải thích' },
  { value: 'Persuasive', label: 'Thuyết phục' },
  { value: 'Technical', label: 'Kỹ thuật' },
  { value: 'Academic', label: 'Học thuật' },
  { value: 'Business', label: 'Kinh doanh' },
];

export const VOICE_OPTIONS: LabeledOption<Voice>[] = [
  { value: 'Authoritative', label: 'Chuyên gia' },
  { value: 'Conversational', label: 'Trò chuyện' },
  { value: 'Personal', label: 'Cá nhân' },
  { value: 'Humorous', label: 'Hài hước' },
  { value: 'Professional', label: 'Chuyên nghiệp' },
  { value: 'Empathetic', label: 'Đồng cảm' },
  { value: 'Persuasive', label: 'Thuyết phục' },
];

export const LANGUAGE_OPTIONS: { value: string, label: string }[] = [
    { value: 'Vietnamese', label: 'Tiếng Việt' },
    { value: 'English', label: 'Tiếng Anh (Quốc tế)' },
    { value: 'Korean', label: 'Tiếng Hàn' },
    { value: 'Japanese', label: 'Tiếng Nhật' },
    { value: 'Spanish', label: 'Tiếng Tây Ban Nha' },
    { value: 'Hindi', label: 'Tiếng Hindi' },
];