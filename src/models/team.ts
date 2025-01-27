export interface IgnoreEncryption {
  _id: boolean;
  createdAt: boolean;
  updatedAt: boolean;
}

export interface Team {
  _id: string; // uuidv4
  team_name: string;
  team_size: number;
  members_id?: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;

  ignore_encryption: IgnoreEncryption;
}

export const defaultIgnoreEncryption: IgnoreEncryption = {
  _id: true,
  createdAt: true,
  updatedAt: true,
};

// TODO: add checks
