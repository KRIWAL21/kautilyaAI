export interface BrokerTask {
  _id: string;
  brokerId: string;
  teamMemberId: {
    _id: string;
    name: string;
  };
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrokerTaskPayload {
  teamMemberId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export interface UpdateBrokerTaskPayload extends Partial<CreateBrokerTaskPayload> {}
