export type InvitationStatus = "pending" | "accepted" | "rejected";
export type InvitationDirection = "builder_to_broker" | "broker_to_builder";

export interface InvitationCompanyRef {
  _id: string;
  companyName?: string;
  contactNumber?: string;
  email?: string;
}

export interface BrokerInvitation {
  _id: string;
  companyId?: InvitationCompanyRef | string;
  brokerId?: string | { _id: string; name?: string; phoneNumber?: string };
  brokerPhoneNumber: string;
  status: InvitationStatus;
  direction?: InvitationDirection;
  note?: string;
  respondedAt?: string;
  createdAt?: string;
}

export interface BrokerInvitationListResponse {
  status?: number;
  statusCode?: number;
  message: string;
  data: BrokerInvitation[];
}

export interface BuilderSuggestion {
  _id: string;
  companyName?: string;
  contactNumber?: string;
  email?: string;
}

export interface BuilderSuggestionsResponse {
  status?: number;
  statusCode?: number;
  message?: string;
  data: BuilderSuggestion[];
}
