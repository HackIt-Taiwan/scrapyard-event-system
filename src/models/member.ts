import { Document } from "mongodb";

export interface IgnoreEncryption {
  _id: boolean;
  is_leader: boolean;
  email_verified: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface StudentID {
  card_front: string; // points to s3
  card_back: string; // points to s3
}

export interface Member extends Document {
  _id: string; // uuidv4
  is_leader: boolean; // if a member is team leader
  name: string;
  grade: string;
  school_name: string;
  phone_number: string;
  email: string;
  email_verified: boolean;
  team_id: string; // points to team's id
  rare_disease: string;
  diet: string; // allergens or specific diet required
  national_id: string;
  student_id: StudentID;
  birth_date: string;
  address: string;
  personal_affidavit: string; // url points to s3
  shirt_size: string;
  createdAt?: Date;
  updatedAt?: Date;

  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_national_id: string;

  ignore_encryption: IgnoreEncryption;
}

export const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  is_leader: true,
  email_verified: true,
  createdAt: true,
  updatedAt: true,
};

// TODO: add checks
