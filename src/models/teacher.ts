export interface IgnoreEncryption {
  _id: boolean;
  will_attend: boolean;
  email_verified: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface Teacher {
  _id: string; // uuidv4
  name: string;
  school: string;
  phone_number: string;
  email: string;
  email_verified: boolean;
  team_id: string; // points to team's id
  diet?: string; // allergens or specific diet required
  special_needs?: string;
  national_id: string;
  birth_date: Date;
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
  email_verified: true,
  createdAt: true,
  updatedAt: true,
};

// TODO: add checks
