export type User = {
    user_id: string; 
    username: string;
    email: string;
    firstname?: string | null;
    lastname?: string | null;
    profession?: string | null;
    sexe?: "M" | "F" | "OTHER" | null;
    public_mode: boolean;
    created_at: string; // timestamp
  };
  
export type Presence = {
    user_id: string;
    status: "WORKING" | "PAUSE" | "OFFLINE";
    current_activity?: string | null;
    energy_level?: number | null;
    updated_at: string; // timestamp
  };
  
export type ActivityLog = {
    id: string; 
    user_id: string; 
    previous_status?: string | null;
    new_status?: string | null;
    activity?: string | null;
    energy_level?: number | null;
    created_at: string; // timestamp
  };
  
export type Task = {
    id: string; 
    user_id: string; 
    name: string;
    tag?: string | null;
    prefix_sentence?: string | null;
    is_current?: boolean | null;
    start_time?: string | null; // timestamp
    finish_time?: string | null; // timestamp
    start_date?: string | null; // date (ISO 8601)
    end_date?: string | null; // date (ISO 8601)
    is_recurring: boolean;
    is_planned: boolean;
    created_at: string; // timestamp
  };
  
export type Link = {
    id: string; 
    user_id: string; 
    network_name: string;
    network_link: string;
    created_at: string; // timestamp
  };
  
export type WorkSession = {
    id: string; 
    user_id: string;
    started_at: string; // timestamp
    ended_at?: string | null; // timestamp
    duration_minutes?: number | null;
    created_at: string; // timestamp
  };
  