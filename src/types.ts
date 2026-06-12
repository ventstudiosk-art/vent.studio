export interface Booking {
  id?: string;
  date: string; // YYYY-MM-DD
  time: string; // hh:mm
  name: string;
  email: string;
  meeting_type: 'ig_call' | 'phone_call' | 'zoom' | 'ig_chat' | 'email' | 'sms';
  contact_value: string;
  about_business: string;
  topic: string;
}

export type MeetingType = Booking['meeting_type'];

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
}
