import { apiClient } from "./axios";

export interface CreateTicketRequest {
  title: string;
  description: string;
  branchId: number;
  departmentId: number;
  systemId: number;
  statusId: number;
  priorityId: number;
  createdBy: string;
}

export interface UpdateTicketRequest {
  ticketId: number;
  title: string;
  description: string;
  branchId: number;
  departmentId: number;
  systemId: number;
  priorityId: number;
  updatedBy: string;
}

export interface UpdateTicketStatusRequest {
  ticketId: number;
  statusId: number;
  updatedBy: string;
}

export interface Ticket {
  ticketId: number;
  title: string;
  description: string;
  branchId: number;
  branchName?: string;
  departmentId: number;
  departmentName?: string;
  systemId: number;
  systemName?: string;
  statusId: number;
  status?: string;
  priorityId: number;
  priority?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TicketMedia {
  ticketMediaId: number;
  ticketId: number;
  mediaUrl: string;
  mediaType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface UploadMediaRequest {
  ticketId: number;
  file: File | Blob;
  uploadedBy: string;
}

export const createTicket = async (
  payload: CreateTicketRequest
): Promise<Ticket> => {
  try {
    const response = await apiClient.post<Ticket>("/tickets", payload);
    return response.data;
  } catch (error: any) {
    console.error("Create ticket error:", error);
    throw error;
  }
};

export const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const response = await apiClient.get<Ticket[]>("/tickets");
    return response.data;
  } catch (error: any) {
    console.error("Get all tickets error:", error);
    throw error;
  }
};

export const updateTicket = async (
  payload: UpdateTicketRequest
): Promise<Ticket> => {
  try {
    const response = await apiClient.put<Ticket>("/tickets", payload);
    return response.data;
  } catch (error: any) {
    console.error("Update ticket error:", error);
    throw error;
  }
};

export const getTicketById = async (ticketId: number): Promise<Ticket> => {
  try {
    const response = await apiClient.get<Ticket>(`/tickets/${ticketId}`);
    return response.data;
  } catch (error: any) {
    console.error("Get ticket by ID error:", error);
    throw error;
  }
};

export const deleteTicket = async (
  ticketId: number,
  updatedBy: string
): Promise<void> => {
  try {
    await apiClient.delete(`/tickets/${ticketId}`, {
      params: { ticketId, updatedBy },
    });
  } catch (error: any) {
    console.error("Delete ticket error:", error);
    throw error;
  }
};

export const getTicketsBySystemId = async (
  systemId: number
): Promise<Ticket[]> => {
  try {
    const response = await apiClient.get<Ticket[]>(
      `/tickets/system/${systemId}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Get tickets by system ID error:", error);
    throw error;
  }
};

export const getTicketsByUserId = async (userId: string): Promise<Ticket[]> => {
  try {
    const response = await apiClient.get<Ticket[]>(`/tickets/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Get tickets by user ID error:", error);
    throw error;
  }
};

export const updateTicketStatus = async (
  payload: UpdateTicketStatusRequest
): Promise<Ticket> => {
  try {
    const response = await apiClient.patch<Ticket>("/tickets/status", payload);
    return response.data;
  } catch (error: any) {
    console.error("Update ticket status error:", error);
    throw error;
  }
};

export const uploadTicketMedia = async (
  ticketId: number,
  file: any,
  uploadedBy: string
): Promise<TicketMedia> => {
  try {
    const formData = new FormData();
    formData.append("TicketId", ticketId.toString());
    formData.append("File", file);
    formData.append("UploadedBy", uploadedBy);

    const response = await apiClient.post<TicketMedia>(
      `/tickets/${ticketId}/media`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Upload ticket media error:", error);
    throw error;
  }
};

export const getTicketMedia = async (
  ticketId: number
): Promise<TicketMedia[]> => {
  try {
    const response = await apiClient.get<TicketMedia[]>(
      `/tickets/${ticketId}/media`
    );
    return response.data;
  } catch (error: any) {
    console.error("Get ticket media error:", error);
    throw error;
  }
};

export const deleteTicketMedia = async (
  ticketId: number,
  ticketMediaId: number
): Promise<void> => {
  try {
    await apiClient.delete(`/tickets/${ticketId}/media/${ticketMediaId}`);
  } catch (error: any) {
    console.error("Delete ticket media error:", error);
    throw error;
  }
};
