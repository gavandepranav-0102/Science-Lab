# SciLab AI API map

All JSON endpoints are under `/api`.

| Method | Route | Auth |
|---|---|---|
| GET | /health | No |
| POST | /auth/register | No |
| POST | /auth/login | No |
| POST | /auth/guest | No |
| POST | /auth/logout | Yes |
| GET | /auth/me | Yes |
| POST | /auth/change-password | Yes |
| POST | /auth/forgot-password | No |
| POST | /auth/reset-password | No |
| GET | /users/me | Yes |
| GET | /users/me/logins | Yes |
| GET | /experiments/history | Yes |
| GET | /experiments/history/:id | Yes |
| POST | /experiments/history | Yes |
| DELETE | /experiments/history/:id | Yes |
| DELETE | /experiments/history | Yes |
| POST | /ai/chat | Yes |

Authentication is via the `scilab_token` HttpOnly cookie. A Bearer token is also accepted by the middleware for API-client testing.
