### User (users)
- id : uuid
- username : string (unique)
- email : string (unique)
- firstname : string | null
- lastname : string | null
- profession : string | null
- sexe : "M" | "F" | "OTHER" | null
- public_mode : boolean (default = false)
- created_at : timestamp

### Presence (presence) — état LIVE
- user_id : uuid (FK → users.id, 1-1)
- status : "WORKING" | "PAUSE" | "OFFLINE"
- current_activity : string | null
- energy_level : number (1–100) | null
- updated_at : timestamp


### ActivityLog (activity_logs) — historique
- id : uuid
- user_id : uuid (FK → users.id)
- previous_status : string | null
- new_status : string | null
- activity : string | null
- energy_level : number | null
- created_at : timestamp


### Task (tasks)
- id : uuid
- user_id : uuid (FK → users.id)
- name : string
- tag : string | null
- start_time : timestamp | null
- finish_time : timestamp | null
- start_date : date | null
- end_date : date | null
- is_recurring : boolean
- is_planned : boolean
- created_at : timestamp


### Link (links) — réseaux sociaux
- id : uuid
- user_id : uuid (FK → users.id)
- network_name : string
- network_link : string
- created_at : timestamp


# WorkSession (work_sessions) — time tracking
- id : uuid
- user_id : uuid (FK → users.id)
- started_at : timestamp
- ended_at : timestamp | null
- duration_minutes : number | null
- created_at : timestamp