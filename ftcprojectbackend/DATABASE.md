### `admin`

Stores administrator user accounts.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `username` | `varchar(100)` | `DEFAULT NULL` |
| `email` | `varchar(255)` | `DEFAULT NULL` |
| `password` | `varchar(255)` | `DEFAULT NULL` |

---

### `appointments`

Stores appointment or contact form submissions.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `name` | `varchar(120)` | `NOT NULL` |
| `email` | `varchar(255)` | `NOT NULL` |
| `message` | `varchar(100)` | `DEFAULT NULL` |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` |

---

### `attendance`

Tracks daily attendance and leave records for interns.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `intern_id` | `int` | `NOT NULL` |
| `mentor_id` | `int` | `DEFAULT NULL` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `date` | `date` | `NOT NULL` |
| `check_in_time` | `varchar(10)` | `DEFAULT NULL` |
| `check_out_time` | `varchar(10)` | `DEFAULT NULL` |
| `status` | `enum('Present','Absent','Half-day','Leave')` | `NOT NULL` |
| `leave_type` | `enum('Casual','Sick','Unpaid','Annual','Short Leave')` | `DEFAULT NULL` |
| `approval` | `enum('Approved','Processing','Rejected')` | `DEFAULT NULL` |
| `reason` | `varchar(50)` | `DEFAULT NULL` |
| `leave_start_time` | `time` | `DEFAULT NULL` |
| `leave_end_time` | `time` | `DEFAULT NULL` |

**Foreign Keys:**
* `intern_id` -> `intern(id)`
* `mentor_id` -> `mentor(id)`
* `admin_id` -> `admin(id)`

---

### `candidates`

Stores information about job or internship candidates, including their CV.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `name` | `varchar(120)` | `NOT NULL` |
| `email` | `varchar(160)` | `NOT NULL` |
| `phone` | `varchar(60)` | `NOT NULL` |
| `cv_original_name` | `varchar(255)` | `NOT NULL` |
| `cv_mime` | `varchar(120)` | `NOT NULL` |
| `cv_size` | `bigint` | `NOT NULL` |
| `cv_stored_name` | `varchar(255)` | `NOT NULL` |
| `cv_stored_path` | `varchar(500)` | `NOT NULL` |
| `cv_data` | `longblob` | `NULL` |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` |

---

### `cohorts`

Defines internship cohorts with start and end dates.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `name` | `varchar(45)` | `NOT NULL` |
| `start_date` | `date` | `NOT NULL` |
| `end_date` | `date` | `NOT NULL` |

---

### `comments`

Stores comments made on tasks by mentors or admins.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `task_id` | `int` | `NOT NULL` |
| `mentor_id` | `int` | `DEFAULT NULL` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `comment_text` | `varchar(200)` | `NOT NULL` |
| `created_at` | `timestamp` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

**Foreign Keys:**
* `task_id` -> `tasks(id)`
* `mentor_id` -> `mentor(id)`
* `admin_id` -> `admin(id)`

---

### `intern`

Stores primary login information for interns.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `cohorts_id` | `int` | `NOT NULL` |
| `username` | `varchar(45)` | `NOT NULL` |
| `position` | `varchar(45)` | `NOT NULL` |
| `email` | `varchar(45)` | `NOT NULL` |
| `password` | `varchar(100)` | `DEFAULT NULL` |

**Foreign Keys:**
* `cohorts_id` -> `cohorts(id)`

---

### `intern_details`

Stores detailed personal and banking information for interns.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `intern_id` | `int` | `NOT NULL` |
| `full_name` | `varchar(255)` | `NOT NULL` |
| `nic` | `varchar(20)` | `NOT NULL` |
| `email` | `varchar(255)` | `NOT NULL` |
| `home_address` | `text` | `NULL` |
| `phone` | `varchar(20)` | `DEFAULT NULL` |
| `bank_branch` | `varchar(100)` | `DEFAULT NULL` |
| `bank_account_number` | `varchar(50)` | `DEFAULT NULL` |
| `id_front_image` | `varchar(255)` | `DEFAULT NULL` |
| `id_back_image` | `varchar(255)` | `DEFAULT NULL` |
| `status` | `enum('Processing','Approved','Rejected')` | `DEFAULT 'Processing'` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

**Foreign Keys:**
* `intern_id` -> `intern(id)`
* `admin_id` -> `admin(id)`

---

### `mentor`

Stores primary login information for mentors.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `username` | `varchar(45)` | `NOT NULL` |
| `email` | `varchar(45)` | `NOT NULL` |
| `password` | `varchar(100)` | `DEFAULT NULL` |

---

### `mentor_details`

Stores detailed personal and banking information for mentors.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `mentor_id` | `int` | `NOT NULL` |
| `full_name` | `varchar(255)` | `NOT NULL` |
| `nic` | `varchar(20)` | `NOT NULL` |
| `email` | `varchar(255)` | `NOT NULL` |
| `home_address` | `text` | `NULL` |
| `phone` | `varchar(20)` | `DEFAULT NULL` |
| `bank_branch` | `varchar(100)` | `DEFAULT NULL` |
| `bank_account_number` | `varchar(50)` | `DEFAULT NULL` |
| `id_front_image` | `varchar(255)` | `DEFAULT NULL` |
| `id_back_image` | `varchar(255)` | `DEFAULT NULL` |
| `status` | `enum('Processing','Approved','Rejected')` | `DEFAULT 'Processing'` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `created_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP` |
| `updated_at` | `timestamp` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` |

**Foreign Keys:**
* `mentor_id` -> `mentor(id)`
* `admin_id` -> `admin(id)`

---

### `messages`

Stores direct messages between users (admins, mentors, interns).

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `sender_id` | `int` | `NOT NULL` |
| `sender_role` | `enum('admin','mentor','intern')` | `NOT NULL` |
| `receiver_id` | `int` | `NOT NULL` |
| `receiver_role` | `enum('admin','mentor','intern')` | `NOT NULL` |
| `text` | `text` | `NULL` |
| `file_name` | `varchar(255)` | `DEFAULT NULL` |
| `file_path` | `varchar(512)` | `DEFAULT NULL` |
| `timestamp` | `datetime` | `DEFAULT CURRENT_TIMESTAMP` |

---

### `projects`

Defines projects assigned to cohorts.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `cohorts_id` | `int` | `NOT NULL` |
| `mentor_id` | `int` | `DEFAULT NULL` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `name` | `varchar(45)` | `NOT NULL` |
| `description` | `varchar(45)` | `NOT NULL` |
| `start_date` | `date` | `NOT NULL` |
| `end_date` | `date` | `NOT NULL` |
| `status` | `varchar(20)` | `NOT NULL` |

**Foreign Keys:**
* `cohorts_id` -> `cohorts(id)`
* `mentor_id` -> `mentor(id)`
* `admin_id` -> `admin(id)`

---

### `subtasks`

Defines subtasks within a main task, assigned to specific interns.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `task_id` | `int` | `NOT NULL` |
| `intern_id` | `int` | `NOT NULL` |
| `title` | `varchar(45)` | `NOT NULL` |
| `status` | `enum('In Progress','In Review','Done')` | `NOT NULL` |
| `rating` | `int` | `DEFAULT NULL` |
| `work_type` | `enum('bug','task','new feature')` | `NOT NULL` |
| `labels` | `json` | `DEFAULT NULL` |
| `due_date` | `date` | `DEFAULT NULL` |

**Foreign Keys:**
* `task_id` -> `tasks(id)`
* `intern_id` -> `intern(id)`

---

### `tasks`

Defines main tasks within a project.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `int` | `NOT NULL`, `AUTO_INCREMENT`, `PRIMARY KEY` |
| `projects_id` | `int` | `NOT NULL` |
| `mentor_id` | `int` | `DEFAULT NULL` |
| `admin_id` | `int` | `DEFAULT NULL` |
| `title` | `varchar(45)` | `NOT NULL` |
| `description` | `varchar(45)` | `NOT NULL` |
| `status` | `varchar(20)` | `NOT NULL` |
| `priority` | `varchar(10)` | `NOT NULL` |
| `due_date` | `date` | `NOT NULL` |
| `attachment_name` | `varchar(255)` | `DEFAULT NULL` |
| `attachment_mime` | `varchar(100)` | `DEFAULT NULL` |
| `attachment_data` | `longblob` | `NULL` |

**Foreign Keys:**
* `projects_id` -> `projects(id)`
* `mentor_id` -> `mentor(id)`
* `admin_id` -> `admin(id)`

---