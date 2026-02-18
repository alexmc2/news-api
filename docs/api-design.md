# Guardian 2 Blog API

## Resources

### Authors

| Field         | Type         | Constraints                           |
| ------------- | ------------ | ------------------------------------- |
| id            | integer      | primary key, auto-increment           |
| name          | varchar(100) | required                              |
| email         | varchar(255) | required, unique                      |
| password_hash | varchar(255) | required, never returned in responses |
| bio           | text         | optional                              |
| joined_at     | timestamp    | default now                           |

### Posts

| Field        | Type         | Constraints                 |
| ------------ | ------------ | --------------------------- |
| id           | integer      | primary key, auto-increment |
| title        | varchar(255) | required                    |
| summary      | text         | optional                    |
| body         | text         | required                    |
| published_at | timestamp    | default now                 |

### Post Authors (junction table)

| Field     | Type    | Constraints                               |
| --------- | ------- | ----------------------------------------- |
| post_id   | integer | foreign key → posts(id), cascade delete   |
| author_id | integer | foreign key → authors(id), cascade delete |
|           |         | primary key (post_id, author_id)          |

## Endpoints

### Posts

| Method | URL                    | Status          | Description             |
| ------ | ---------------------- | --------------- | ----------------------- |
| GET    | /api/posts             | 200             | List all posts          |
| POST   | /api/posts             | 201             | Create a post           |
| GET    | /api/posts/:id         | 200 / 404       | Get a single post       |
| PATCH  | /api/posts/:id         | 200 / 404 / 422 | Partially update a post |
| DELETE | /api/posts/:id         | 204 / 404       | Delete a post           |
| GET    | /api/posts/:id/authors | 200 / 404       | List authors for a post |

### Authors

| Method | URL                    | Status    | Description             |
| ------ | ---------------------- | --------- | ----------------------- |
| GET    | /api/authors           | 200       | List all authors        |
| POST   | /api/authors           | 201       | Create an author        |
| GET    | /api/authors/:id       | 200 / 404 | Get a single author     |
| GET    | /api/authors/:id/posts | 200 / 404 | List posts by an author |

## Request / Response Examples

### Create a post

**Request** `POST /api/posts`

```json
{
  "author_ids": [1, 3],
  "title": "My New Post",
  "summary": "A brief summary",
  "body": "The full article text."
}
```

**Response** `201 Created`

```json
{
  "id": 15,
  "title": "My New Post",
  "summary": "A brief summary",
  "body": "The full article text.",
  "published_at": "2026-02-18T10:00:00.000Z"
}
```

### Update a post

**Request** `PATCH /api/posts/15`

```json
{
  "title": "Updated Title"
}
```

**Response** `200 OK`

```json
{
  "id": 15,
  "title": "Updated Title",
  "summary": "A brief summary",
  "body": "The full article text.",
  "published_at": "2026-02-18T10:00:00.000Z"
}
```

## Validation

### Creating a post

- `title` — required, string
- `body` — required, string
- `author_ids` — required, non-empty array of existing author ids

### Creating an author

- `name` — required, string
- `email` — required, string, must be unique
- `password_hash` — required, string

## Error Responses

All errors return JSON with `status` and `message`:

```json
{
  "status": 422,
  "message": "\"title\" is required."
}
```

| Status | When                      |
| ------ | ------------------------- |
| 400    | Invalid id parameter      |
| 404    | Resource not found        |
| 409    | Duplicate email           |
| 422    | Missing or invalid fields |
| 500    | Unexpected server error   |

## Filtering, Pagination, Sorting (planned)

Not yet implemented. Planned query parameters for `GET /api/posts`:

| Param     | Type    | Description                                         |
| --------- | ------- | --------------------------------------------------- |
| author_id | integer | Filter by author                                    |
| from      | date    | Posts published on or after this date               |
| to        | date    | Posts published on or before this date              |
| q         | string  | Search title and summary                            |
| sort      | string  | `published_at` or `title` (default: `published_at`) |
| order     | string  | `asc` or `desc` (default: `desc`)                   |
| page      | integer | Page number (default: 1)                            |
| per_page  | integer | Results per page (default: 20)                      |

### Example: filter by author and date range

`GET /api/posts?author_id=3&from=2024-01-01&to=2024-12-31`

### Example: search with pagination

`GET /api/posts?q=climate&page=1&per_page=5`
