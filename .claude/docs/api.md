# API Endpoints

> Alle backend endpoints met request/response voorbeelden

**Base URL:** `https://api.studieplanner.havun.nl` (productie)
**Lokaal:** `http://localhost:8000`

**Headers (authenticated):**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## Authenticatie

### POST /api/auth/register
Nieuwe gebruiker registreren.

**Request:**
```json
{
  "name": "Jan",
  "pincode": "1234",
  "role": "student"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "name": "Jan",
    "role": "student",
    "student_code": "ABC123XYZ789",
    "is_premium": false
  },
  "token": "1|abc123..."
}
```

### POST /api/auth/login
Inloggen.

**Request:**
```json
{
  "name": "Jan",
  "pincode": "1234"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Jan",
    "role": "student",
    "student_code": "ABC123XYZ789",
    "is_premium": false
  },
  "token": "2|def456..."
}
```

**Error (401):**
```json
{
  "message": "Invalid credentials"
}
```

### GET /api/auth/user
Huidige gebruiker ophalen.

**Response (200):**
```json
{
  "id": 1,
  "name": "Jan",
  "role": "student",
  "student_code": "ABC123XYZ789",
  "is_premium": false,
  "premium_until": null
}
```

### POST /api/auth/logout
Uitloggen (token invalideren).

**Response (200):**
```json
{
  "message": "Logged out"
}
```

---

## Vakken (Subjects)

### GET /api/subjects
Alle vakken van huidige gebruiker.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Nederlands",
    "color": "#4f46e5",
    "exam_date": "2024-03-15",
    "tasks": [
      {
        "id": 1,
        "description": "Hoofdstuk 1-3",
        "estimated_minutes": 90,
        "planned_amount": 30,
        "unit": "blz",
        "completed": false
      }
    ]
  }
]
```

### POST /api/subjects
Nieuw vak aanmaken.

**Request:**
```json
{
  "name": "Wiskunde",
  "color": "#22c55e",
  "exam_date": "2024-03-20"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Wiskunde",
  "color": "#22c55e",
  "exam_date": "2024-03-20",
  "tasks": []
}
```

### PUT /api/subjects/{id}
Vak bijwerken.

**Request:**
```json
{
  "name": "Wiskunde B",
  "color": "#22c55e",
  "exam_date": "2024-03-22"
}
```

**Response (200):** Updated subject object

### DELETE /api/subjects/{id}
Vak verwijderen (inclusief taken).

**Response (204):** No content

---

## Taken (Tasks)

### POST /api/subjects/{subjectId}/tasks
Nieuwe taak voor vak.

**Request:**
```json
{
  "description": "Hoofdstuk 4-6",
  "estimated_minutes": 120,
  "planned_amount": 45,
  "unit": "blz"
}
```

**Response (201):**
```json
{
  "id": 2,
  "subject_id": 1,
  "description": "Hoofdstuk 4-6",
  "estimated_minutes": 120,
  "planned_amount": 45,
  "unit": "blz",
  "completed": false
}
```

### PUT /api/tasks/{id}
Taak bijwerken.

### DELETE /api/tasks/{id}
Taak verwijderen.

---

## Sessies (Planned Sessions)

### GET /api/sessions
Alle sessies van huidige gebruiker.

**Query params:**
- `from`: datum (YYYY-MM-DD)
- `to`: datum (YYYY-MM-DD)

**Response (200):**
```json
[
  {
    "id": 1,
    "date": "2024-03-10",
    "hour": 14,
    "subject_id": 1,
    "task_id": 1,
    "minutes_planned": 45,
    "minutes_actual": null,
    "amount_planned": 15,
    "amount_actual": null,
    "completed": false,
    "knowledge_rating": null
  }
]
```

### POST /api/sessions
Nieuwe sessie aanmaken.

**Request:**
```json
{
  "date": "2024-03-10",
  "hour": 14,
  "subject_id": 1,
  "task_id": 1,
  "minutes_planned": 45,
  "amount_planned": 15
}
```

### PUT /api/sessions/{id}
Sessie bijwerken (verplaatsen in agenda).

**Request:**
```json
{
  "date": "2024-03-11",
  "hour": 16
}
```

### DELETE /api/sessions/{id}
Sessie verwijderen.

---

## Timer Sessies

### POST /api/session/start
Studiesessie starten.

**Request:**
```json
{
  "session_id": 1
}
```

**Response (200):**
```json
{
  "active_session": {
    "id": 1,
    "started_at": "2024-03-10T14:00:00Z"
  }
}
```

### POST /api/session/stop
Sessie stoppen met resultaat.

**Request:**
```json
{
  "session_id": 1,
  "minutes_actual": 42,
  "amount_actual": 12,
  "knowledge_rating": 7,
  "completed": false
}
```

**Response (200):**
```json
{
  "session": {
    "id": 1,
    "completed": false,
    "minutes_actual": 42,
    "amount_actual": 12,
    "knowledge_rating": 7
  },
  "new_session": {
    "id": 2,
    "amount_planned": 3,
    "minutes_planned": 15
  }
}
```

Note: `new_session` alleen als `completed: false` (restant).

### GET /api/session/active
Actieve sessies (voor mentor).

**Response (200):**
```json
{
  "active": [
    {
      "user_id": 1,
      "user_name": "Jan",
      "session_id": 1,
      "subject_name": "Nederlands",
      "started_at": "2024-03-10T14:00:00Z",
      "minutes_elapsed": 15
    }
  ]
}
```

---

## Mentor

### GET /api/mentor/students
Gekoppelde leerlingen.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Jan",
    "student_code": "ABC123XYZ789",
    "is_studying": true,
    "last_activity": "2024-03-10T14:00:00Z"
  }
]
```

### GET /api/mentor/student/{id}
Volledige data van leerling.

**Response (200):**
```json
{
  "user": { ... },
  "subjects": [ ... ],
  "sessions": [ ... ],
  "stats": {
    "total_hours_week": 5.5,
    "sessions_completed": 12
  }
}
```

### POST /api/mentor/accept-student
Leerling koppelen via code.

**Request:**
```json
{
  "invite_code": "ABC123"
}
```

**Response (200):**
```json
{
  "student": {
    "id": 1,
    "name": "Jan"
  },
  "message": "Student gekoppeld"
}
```

**Error (404):**
```json
{
  "message": "Ongeldige of verlopen code"
}
```

### DELETE /api/mentor/student/{id}
Leerling ontkoppelen.

---

## Student

### POST /api/student/invite
Invite code genereren.

**Response (201):**
```json
{
  "code": "XYZ789",
  "expires_at": "2024-03-11T14:00:00Z"
}
```

### GET /api/student/mentors
Gekoppelde mentoren.

**Response (200):**
```json
[
  {
    "id": 2,
    "name": "Vader"
  }
]
```

### DELETE /api/student/mentor/{id}
Mentor ontkoppelen.

---

## Sync

### POST /api/student/subjects/sync
Bulk sync subjects + tasks.

**Request:**
```json
{
  "subjects": [
    {
      "id": "local-uuid-1",
      "name": "Nederlands",
      "color": "#4f46e5",
      "exam_date": "2024-03-15",
      "tasks": [ ... ]
    }
  ]
}
```

### POST /api/student/sessions/sync
Bulk sync sessions.

---

## Premium

### GET /api/premium/status
Premium status checken.

**Response (200):**
```json
{
  "is_premium": true,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

### GET /api/premium/stats
Statistieken ophalen (premium only).

**Response (200):**
```json
{
  "total_hours": {
    "week": 5.5,
    "month": 22.3
  },
  "by_subject": [
    { "name": "Nederlands", "hours": 2.5, "color": "#4f46e5" }
  ],
  "completion_rate": 0.85,
  "trend": [
    { "date": "2024-03-04", "hours": 1.2 },
    { "date": "2024-03-05", "hours": 0.8 }
  ]
}
```

**Error (403):** Premium required

### GET /api/premium/learning-speed
Leersnelheid per vak.

**Response (200):**
```json
{
  "speeds": [
    {
      "subject_id": 1,
      "subject_name": "Nederlands",
      "pages_per_hour": 12.5,
      "exercises_per_hour": 8.2
    }
  ]
}
```
