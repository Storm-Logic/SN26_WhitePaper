# PRB API Reference

**Base URL:** `https://api.perturbai.io`  
**Local dev:** `http://localhost:4001`

---

## Authentication

| Method | Description |
|--------|-------------|
| **JWT Cookie** | Set automatically on login/register. Sent via `httpOnly` cookie named `token`. Required to create jobs. |
| **API Key** | Pass as `Authorization: Bearer <PRB_API_KEY>` header. Used by the ML processing service to read and update jobs. |
| **Admin JWT** | JWT cookie belonging to an `admin`-role user. Accepted wherever an API key is accepted. |

---

## Role Summary

| Role | Description |
|------|-------------|
| `general` | Default role on registration. Cannot create jobs. |
| `granted` | Can create and submit jobs for processing. |
| `admin` | Full access — can create jobs and access all protected endpoints. |

---

## Authentication Routes

### `POST /auth/register`

Create a new account. Sets the `token` JWT cookie on success.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | User email address |
| `password` | string | ✓ | Plain-text password (min 8 characters) |

**Response `201`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "general"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Missing/invalid `email` or password too short |
| `409` | Email already registered |

---

### `POST /auth/login`

Authenticate and receive a JWT cookie.

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✓ | Registered email |
| `password` | string | ✓ | Account password |

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "general"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Missing `email` or `password` |
| `401` | Invalid credentials |

---

### `POST /auth/logout`

Clears the JWT cookie.

**Response `200`**
```json
{ "message": "Logged out" }
```

---

### `GET /auth/me`

Returns the currently authenticated user's profile.

**Auth:** JWT cookie required.

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "general"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |

---

### `GET /auth/google`

Initiates Google OAuth flow. Redirects the browser to Google's consent screen.

---

### `GET /auth/google/callback`

Google OAuth callback. On success, sets the JWT cookie and redirects to the frontend dashboard. On failure, redirects to `/login?error=oauth_failed`.

---

## Jobs

### `POST /jobs`

Upload an image and create a new processing job.

**Auth:** JWT cookie required — user must have `granted` or `admin` role.

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `image` | file | ✓ | Image to process (JPEG, PNG, WebP, or GIF — max 10 MB) |

**Response `201`**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "WAITING",
  "exampleImageKeys": [],
  "processedImageKey": null,
  "initialModelScore": null,
  "initialClass": null,
  "afterClass": null,
  "afterScore": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**`status` values:** `WAITING` | `CLASSIFIED` | `PENDING` | `COMPLETE`

**Errors**

| Code | Reason |
|------|--------|
| `400` | No file provided |
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but role is not `granted` or `admin` |

---

### `GET /jobs`

Return all jobs in reverse-chronological order. Each job includes short-lived presigned URLs (10 minutes) for stored images.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "status": "COMPLETE",
    "userImageUrl": "https://r2.example.com/...",
    "userImageKey": "prb/user/uuid.jpg",
    "processedImageUrl": "https://r2.example.com/...",
    "processedImageKey": "prb/processed/uuid.jpg",
    "exampleImageUrls": ["https://r2.example.com/..."],
    "exampleImageKeys": ["prb/examples/uuid.jpg"],
    "initialModelScore": 0.92,
    "initialClass": "cat",
    "afterClass": "dog",
    "afterScore": 0.61,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
]
```

`processedImageUrl`/`processedImageKey` are `null` until a processed image is uploaded via `PATCH`. `exampleImageUrls`/`exampleImageKeys` are empty arrays until example images are uploaded via `PATCH`.

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid API key / JWT cookie |

---

### `GET /jobs/:id`

Return a single job by ID, including short-lived presigned URLs (10 minutes) for stored images.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Response `200`**
```json
{
  "id": "uuid",
  "status": "COMPLETE",
  "userImageUrl": "https://r2.example.com/...",
  "userImageKey": "prb/user/uuid.jpg",
  "processedImageUrl": "https://r2.example.com/...",
  "processedImageKey": "prb/processed/uuid.jpg",
  "exampleImageUrls": ["https://r2.example.com/..."],
  "exampleImageKeys": ["prb/examples/uuid.jpg"],
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": "dog",
  "afterScore": 0.61,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

### `POST /jobs/:id/proceed`

Transition a job from `CLASSIFIED` to `PENDING`, signalling that the granted user approves the initial classification and wants perturbation to begin.

**Auth:** JWT cookie required — user must have `granted` or `admin` role. Non-admin users may only proceed their own jobs.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Response `200`** *(raw job entity — storage keys only, no presigned URLs)*
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "PENDING",
  "exampleImageKeys": [],
  "processedImageKey": null,
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": null,
  "afterScore": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but role is not `granted` or `admin`, or job belongs to another user |
| `404` | Job not found |
| `409` | Job is not in `CLASSIFIED` status |

---

`processedImageUrl`/`processedImageKey` are `null` until a processed image is uploaded via `PATCH`. `exampleImageUrls`/`exampleImageKeys` are empty until example images are uploaded via `PATCH`.

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid API key / JWT cookie |
| `404` | Job not found |

---

### `PATCH /jobs/:id`

Update a job with result data from the processing service. All fields are optional — only provided fields are updated.

**Auth:** `Authorization: Bearer <PRB_API_KEY>` **or** admin JWT cookie required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | Job UUID |

**Request Body** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `processedImage` | file | — | Perturbed output image (JPEG, PNG, WebP, or GIF — max 10 MB). Uploaded to R2 and stored as `processedImageKey`. |
| `exampleImages` | file[] | — | One or more example images (JPEG, PNG, WebP, or GIF — max 10 MB each). Replaces all existing example images. |
| `status` | string | — | New job status (`WAITING` \| `CLASSIFIED` \| `PENDING` \| `COMPLETE`) |
| `initialModelScore` | number | — | Model confidence score for the original image |
| `initialClass` | string | — | Predicted class for the original image |
| `afterClass` | string | — | Predicted class after perturbation |
| `afterScore` | number | — | Model confidence score after perturbation |

**Response `200`** *(raw job entity — storage keys only, no presigned URLs)*
```json
{
  "id": "uuid",
  "userId": "uuid",
  "userImageKey": "prb/user/uuid.jpg",
  "status": "COMPLETE",
  "exampleImageKeys": ["prb/examples/uuid.jpg"],
  "processedImageKey": "prb/processed/uuid.jpg",
  "initialModelScore": 0.92,
  "initialClass": "cat",
  "afterClass": "dog",
  "afterScore": 0.61,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Uploaded file is invalid or exceeds 10 MB |
| `401` | Missing or invalid API key / JWT cookie |
| `404` | Job not found |

---

## User Management

All user management routes require a valid JWT cookie **and** the `admin` role.

### `GET /users`

List all registered users.

**Auth:** JWT cookie + `admin` role required.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "general",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Errors**

| Code | Reason |
|------|--------|
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |

---

### `PATCH /users/:id/role`

Update a user's role.

**Auth:** JWT cookie + `admin` role required.

**Path Parameters**

| Parameter | Description |
|-----------|-------------|
| `id` | User UUID |

**Request Body** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | ✓ | New role (`general` \| `granted` \| `admin`) |

**Response `200`**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "granted"
}
```

**Errors**

| Code | Reason |
|------|--------|
| `400` | Invalid or missing `role` value |
| `401` | Missing or invalid JWT cookie |
| `403` | Authenticated but not an admin |
| `404` | User not found |
