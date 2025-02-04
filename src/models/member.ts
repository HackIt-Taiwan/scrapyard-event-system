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

export interface Member {
  _id: string; // uuidv4
  is_leader: boolean; // if a member is team leader
  name_en: string;
  name_zh: string;
  grade: string;
  school: string;
  telephone: string;
  email: string;
  email_verified: boolean;
  team_id: string; // points to team's id
  diet?: string; // allergens or specific diet required
  special_needs?: string;
  national_id: string;
  student_id: StudentID;
  birth_date: Date;
  address: string;
  personal_affidavit: string; // url points to s3
  shirt_size: string;
  createdAt?: Date;
  updatedAt?: Date;

  emergency_contact_name: string;
  emergency_contact_telephone: string;
  emergency_contact_national_id: string;

  ignore_encryption: IgnoreEncryption;

  signature: string;
  parent_signature: string;
}

export const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  is_leader: true,
  email_verified: true,
  createdAt: true,
  updatedAt: true,
};
