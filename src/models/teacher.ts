import { Document } from "mongodb";

export interface IgnoreEncryption {
  _id: boolean;
  will_attend: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface Teacher extends Document {
  _id: string; // uuidv4
  name: string;
  school_name: string;
  phone_number: string;
  email: string;
  team_id: string; // points to team's id
  diet: string; // allergens or specific diet required
  rare_disease: string;
  national_id: string;
  birth_date: string;
  address: string;
  will_attend: boolean;
  teacher_affidavit: string; // url points to s3
  createdAt?: Date;
  updatedAt?: Date;

  ignore_encryption: IgnoreEncryption;
}

export const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  will_attend: true,
  createdAt: true,
  updatedAt: true,
};

// TODO: add checks
