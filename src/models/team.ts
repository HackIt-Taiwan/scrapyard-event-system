export interface IgnoreEncryption {
  _id: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface Team {
  _id: string; // uuidv4
  team_name: string;
  team_size: number;
  leader_id: string;
  teacher_id: string;
  members_id: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;

  ignore_encryption: IgnoreEncryption;
}

export interface TeamLink extends Team {
  leader_link: string;
  members_link: Array<string>;
  teacher_link: string;
}

export const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  createdAt: true,
  updatedAt: true,
};
