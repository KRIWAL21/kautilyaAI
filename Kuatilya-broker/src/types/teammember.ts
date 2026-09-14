export interface TeamMember {
  _id: string;
  brokerId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberPayload {
  name: string;
  email: string;
  phone: string;
  role?: string;
  status?: string;
}

export interface UpdateTeamMemberPayload extends Partial<CreateTeamMemberPayload> {}

export interface TeamMemberResponse {
  items: TeamMember[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
